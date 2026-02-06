import { Request, Response } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import { forgotPasswordTemplate } from "../template.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import sql from "../utils/db.js";
import bcrypt from 'bcrypt';
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import { publicToTopic } from "../producer.js";

export const registerUser = TryCatch(async(req, res, next)=>{
  const {name, email, password, phoneNumber, role, bio} = req.body;
  if (!name || !email || !password || !phoneNumber || !role) {
    throw new ErrorHandler(400, 'Please fill all the details');
  }
  const existingUsers = await sql` SELECT user_id FROM users WHERE email = ${email}`;
  if (Array.isArray(existingUsers) && existingUsers.length > 0) {
    throw new ErrorHandler(409, 'User with this email already exist');
  }
  
  const hashPassword = await bcrypt.hash(password, 10);

  let registerdUser;
  if (role === 'recruiter') {
    const user = await sql`
      INSERT INTO users (name, email, password, phone_number, role) 
      VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}) 
      RETURNING user_id, name, email, role, phone_number, created_at
    ` as any[];
    registerdUser = user[0];
  } else if (role === 'jobseeker') {
    const file = req.file;
    
    if (!file) {
      throw new ErrorHandler(400, "Resume file is required for jobseeker");
    }
    const filebuffer = getBuffer(file);
    if (!filebuffer || !filebuffer?.content) {
      throw new ErrorHandler(500, 'Failed to generate buffer');
    }
    
    const {data} = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      { buffer: filebuffer.content }
    );
    
    const user = await sql` 
      INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id)
      VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}, ${bio}, ${data.url}, ${data.public_id}) 
      RETURNING user_id, name, email, role, phone_number, bio, resume, created_at
    ` as any[];
    registerdUser = user[0];
  }
  const token = jwt.sign(
    { id: registerdUser?.user_id }, 
    process.env.JWT_SEC as string,
    { expiresIn: '15d' }
  )
  res.json({
    message: "User registered",
    registerdUser,
    token
  });
}); 

export const loginUser = TryCatch(async(req, res, next)=>{
  const {email, password} = req.body;
  if (!email || !password) {
    throw new ErrorHandler(400, "Please fill the details for the login");
  }

  const user = await sql`
    SELECT u.user_id, u.name, u.email, u.password, u.phone_number, u.role, u.bio, u.resume, u.profile_pic, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id 
    WHERE u.email = ${email} GROUP BY u.user_id
  ` as any[];

  if (user.length === 0) {
    throw new ErrorHandler(400, "Invalid credentials");
  }

  const userObject = user[0];

  const matchPassword = await bcrypt.compare(password, userObject.password);
  if (!matchPassword) {
    throw new ErrorHandler(400, "Invalid credentials");
  }

  userObject.skills = userObject.skills || [];

  delete userObject.skills;

  const token = jwt.sign(
    { id: userObject?.user_id }, 
    process.env.JWT_SEC as string,
    { expiresIn: '15d' }
  )
  res.json({
    message: "user LoggedIn",
    userObject,
    token
  });

});

export const forgetPassword = TryCatch(async(req, res, next) => {
  const {email} = req.body;
  if (!email) {
    throw new ErrorHandler(400, "Email is required");
  }
  const users = await sql`
    SELECT user_id, email FROM users WHERE email = ${email}
  ` as any[];
  if (users.length === 0) {
    return res.json({
      message: "If that email exists, we have sent a reset link",
    });
  }
  const user = users[0];  

  const resetToken = jwt.sign(
    {
      email: user.email, type: "reset"
    }, 
    process.env.JWT_SEC as string, 
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.Frontend_Url}/reset/${resetToken}`;

  const message = {
    to: email,
    subject: "RESET Your Password - hireheaven",
    html: forgotPasswordTemplate(resetLink)
  };

  publicToTopic("send-mail", message);
  res.json({
    message: "If that email exists, we have sent a reset link",
  });
});