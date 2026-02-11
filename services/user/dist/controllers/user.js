import sql from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
export const myProfile = TryCatch(async (req, res, next) => {
    const user = req.user;
    res.json(user);
});
export const getUserProfile = TryCatch(async (req, res, next) => {
    const { userId } = req.params;
    const users = await sql `
      SELECT 
        u.user_id, u.name, u.email, u.phone_number, u.role, u.bio, u.resume, u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills 
      FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.user_id = ${userId} GROUP BY u.user_id;
    `;
    if (users.length === 0) {
        throw new ErrorHandler(404, "User not found");
    }
    const user = users[0];
    user.skills = user.skills || [];
    res.json(user);
});
