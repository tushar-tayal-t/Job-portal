import axios from "axios";
import getBuffer from "../utils/buffer.js";
import sql from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { applicationStatusUpdateTemplate } from "../template.js";
import { publicToTopic } from "../producer.js";
export const createCompany = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    if (user.role !== 'recruiter') {
        throw new ErrorHandler(403, "Forbidden: only recruiter can create a company");
    }
    const { name, description, website } = req.body;
    if (!name || !description || !website) {
        throw new ErrorHandler(400, "All the fields are required");
    }
    const existingCompany = await sql `SELECT company_id FROM companies WHERE name = ${name}`;
    if (existingCompany.length > 0) {
        throw new ErrorHandler(409, `Company with the name ${name} already exist`);
    }
    const file = req.file;
    if (!file) {
        throw new ErrorHandler(400, `Company logo file is required`);
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        throw new ErrorHandler(500, "Failed to create file buffer");
    }
    let data1;
    try {
        const { data } = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/uploads`, {
            buffer: fileBuffer.content,
            public_id: undefined
        });
        data1 = data;
    }
    catch (e) {
        throw new ErrorHandler(500, "Utils service fail in response");
    }
    const [newCompany] = await sql `
    INSERT INTO companies (name, description, website, logo, logo_public_id, recruiter_id) 
    VALUES(${name}, ${description}, ${website}, ${data1.url}, ${data1.public_id}, ${user?.user_id})
    RETURNING *
  `;
    res.json({
        message: "Company create successfully",
        company: newCompany
    });
});
export const deleteCompany = TryCatch(async (req, res) => {
    const user = req.user;
    const { companyId } = req.params;
    const [company] = await sql `
    SELECT  
      logo_public_id 
    FROM companies WHERE company_id = ${companyId} AND recruiter_id = ${user?.user_id}
  `;
    if (!company) {
        throw new ErrorHandler(404, "Company not found or you're not authorized to delete the company");
    }
    await sql `DELETE FROM companies WHERE company_id = ${companyId}`;
    res.json({
        message: "Company and all associated jobs have been deleted successfully"
    });
});
export const createJob = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    if (user.role !== 'recruiter') {
        throw new ErrorHandler(403, "Forbidden: only recruiter can create a company");
    }
    const { title, description, salary, location, role, job_type, work_location, company_id, openings } = req.body;
    if (!title || !description || !salary || !location || !role || !openings) {
        throw new ErrorHandler(400, "All the fields are required");
    }
    const [company] = await sql `
    SELECT company_id FROM companies WHERE company_id = ${company_id} AND recruiter_id = ${user.user_id};
  `;
    if (!company) {
        throw new ErrorHandler(404, "Company not found");
    }
    const [newJob] = await sql `
    INSERT INTO jobs (
      title, 
      description, 
      salary, 
      location, 
      role, 
      job_type, 
      work_location, 
      company_id, 
      posted_by_recruiter_id, 
      openings) VALUES (
      ${title}, 
      ${description}, 
      ${salary}, 
      ${location}, 
      ${role}, 
      ${job_type}, 
      ${work_location}, 
      ${company_id}, 
      ${user.user_id}, 
      ${openings}) RETURNING *;
  `;
    if (!newJob) {
        throw new ErrorHandler(500, "Error in creation of job");
    }
    res.json({
        message: "Job posted successfully",
        job: newJob
    });
});
export const updateJob = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    if (user.role !== 'recruiter') {
        throw new ErrorHandler(403, "Forbidden: only recruiter can create a company");
    }
    const { title, description, salary, location, role, job_type, work_location, company_id, openings, is_active } = req.body;
    const [existingJob] = await sql `
    SELECT 
      posted_by_recruiter_id 
    FROM jobs WHERE job_id = ${req.params.jobId} AND company_id = ${company_id}
  `;
    if (!existingJob) {
        throw new ErrorHandler(404, "Job not found");
    }
    if (existingJob.posted_by_recruiter_id !== user.user_id) {
        throw new ErrorHandler(404, "Forbiden: You are not allowed");
    }
    const [updateJob] = await sql `
    UPDATE jobs SET 
      title = ${title},
      description = ${description},
      salary = ${salary},
      location = ${location},
      role = ${role},
      job_type = ${job_type},
      work_location = ${work_location},
      openings = ${openings},
      is_active = ${is_active}
    WHERE job_id = ${req.params.jobId} RETURNING *;
  `;
    res.json({
        message: "Job updated successfully",
        job: updateJob
    });
});
export const getAllCompany = TryCatch(async (req, res) => {
    const companies = await sql `
      SELECT * FROM companies WHERE recruiter_id = ${req.user?.user_id}
    `;
    res.json(companies);
});
export const getCompanyDetails = TryCatch(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ErrorHandler(400, "Company id is required");
    }
    const [companyData] = await sql `
      SELECT c.*, COALESCE (
        (
          SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
        ),
        '[]'::json
      ) AS jobs
      FROM companies c WHERE c.company_id = ${id} GROUP BY c.company_id;`;
    if (!companyData) {
        throw new ErrorHandler(404, "Company not found");
    }
    res.json(companyData);
});
export const getAllActiveJobs = TryCatch(async (req, res) => {
    const { title, location } = req.query;
    let queryString = `SELECT 
      j.job_id, 
      j.title, 
      j.description,
      j.salary,
      j.location,
      j.job_type, 
      j.role, 
      j.work_location,
      j.created_at,
      c.name AS company_name,
      c.logo AS company_logo,
      c.company_id AS company_id
    FROM jobs j JOIN companies c 
    ON j.company_id = c.company_id 
    WHERE j.is_active = true`;
    const values = [];
    let paramIndex = 1;
    if (title) {
        queryString += ` AND j.title ILIKE $${paramIndex}`;
        values.push(`%${title}%`);
        paramIndex++;
    }
    if (location) {
        queryString += ` AND j.location ILIKE $${paramIndex}`;
        values.push(`%${location}%`);
        paramIndex++;
    }
    queryString += " ORDER BY j.created_at DESC";
    const jobs = (await sql.query(queryString, values));
    res.json(jobs);
});
export const getSingleJob = TryCatch(async (req, res) => {
    const [job] = await sql `
      SELECT * FROM jobs WHERE job_id = ${req.params.jobId}
    `;
    res.json(job);
});
export const getAllApplicationForJob = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    if (user.role !== 'recruiter') {
        throw new ErrorHandler(403, "Forbidden: Only recruiter can view the applications for the job");
    }
    const { jobId } = req.params;
    const [job] = await sql `
    SELECT posted_by_recruiter_id FROM jobs WHERE job_id = ${jobId} AND posted_by_recruiter_id = ${user?.user_id}
  `;
    if (!job) {
        throw new ErrorHandler(404, "No job found with this job id");
    }
    const applications = await sql `
    SELECT * FROM applications WHERE job_id = ${jobId} ORDER BY subscribed DESC, applied_at ASC
  `;
    res.json(applications);
});
export const updateApplication = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    if (user.role !== 'recruiter') {
        throw new ErrorHandler(403, "Forbidden: Only recruiter can update the applications for this job");
    }
    const { id } = req.params;
    const [application] = await sql `
    SELECT * FROM applications WHERE application_id = ${id}
  `;
    if (!application) {
        throw new ErrorHandler(404, "Application not found");
    }
    const [job] = await sql `
    SELECT posted_by_recruiter_id, title FROM jobs WHERE job_id = ${application.job_id}
  `;
    if (!job) {
        throw new ErrorHandler(404, "Job with this id not found");
    }
    if (job?.posted_by_recruiter_id !== user.user_id) {
        throw new ErrorHandler(403, "Forbidden you are not allowed");
    }
    const [updatedApplication] = await sql `
    UPDATE applications SET 
      status = ${req.body.status} 
    WHERE application_id = ${id} RETURNING *; 
  `;
    const message = {
        to: application?.applicant_email,
        subject: "Application status update - Job portal",
        html: applicationStatusUpdateTemplate(job.title)
    };
    publicToTopic("send-mail", message).catch((error) => {
        console.error("Failed to public message to kafka", error);
    });
    res.json({
        message: "Application updated",
        job,
        updatedApplication
    });
});
