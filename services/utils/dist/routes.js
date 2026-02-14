import express from 'express';
import cloudinary from 'cloudinary';
const router = express.Router();
router.post("/uploads", async (req, res) => {
    try {
        const { buffer, public_id } = req.body;
        if (public_id) {
            cloudinary.v2.uploader.destroy(public_id);
        }
        const cloud = await cloudinary.v2.uploader.upload(buffer);
        res.json({
            url: cloud.secure_url,
            public_id: cloud.public_id
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
router.post("/career", async (req, res) => {
    try {
        const { skills } = req.body;
        if (!skills) {
            return res.status(400).json({
                message: "Skills Required",
            });
        }
        const prompt = ` 
      Based on the following skills: ${skills}. 
      
      Please act as a career advisor and generate a career path suggestion. 
      Your entire response must be in a valid JSON format. Do not include any text or markdown 
      formatting outside of the JSON structure. 
      
      The JSON object should have the following structure: 
      { 
      "summary": "A brief, encouraging summary of the user's skill set and their general job 
      title.", 
      "jobOptions": [ 
      { 
      "title": "The name of the job role.", 
      "responsibilities": "A description of what the user would do in this role.", 
      "why": "An explanation of why this role is a good fit for their skills." 
      } 
      ], 
      "skillsToLearn": [ 
      { 
      "category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack 
      Mastery', 'DevOps & Cloud').", 
      "skills": [ 
      { 
      "title": "The name of the skill to learn.", 
      "why": "Why learning this skill is important.", 
      "how": "Specific examples of how to learn or apply this skill." 
      } 
      ] 
      } 
      ], 
      "learningApproach": { 
      "title": "How to Approach Learning", 
      "points": ["A bullet point list of actionable advice for learning."] 
      } 
      } 
    `;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt
        });
        let jsonResponse;
        try {
            const rawText = response.text
                ?.replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
            if (!rawText) {
                throw new Error("Ai did not return a valid text response.");
            }
            jsonResponse = JSON.parse(rawText);
        }
        catch (error) {
            return res.status(500).json({
                message: "Ai returned response that was not valid JSON",
                rawResponse: response.text
            });
        }
        res.json({
            jsonResponse
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});
export default router;
