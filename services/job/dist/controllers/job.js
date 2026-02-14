import axios from "axios";
import getBuffer from "../utils/buffer.js";
import sql from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
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
    const { data } = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/uploads`, {
        buffer: fileBuffer.content,
        public_id: undefined
    });
    const [newCompany] = await sql `
    INSERT INTO companies (name, description, website, logo, logo_public_id, recruiter_id) 
    VALUES(${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${user?.user_id})
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
