import express from "express";
import { forgetPassword, loginUser, registerUser } from "../controllers/auth.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router();
router.post('/register', uploadFile, registerUser);
router.post('/login', loginUser);
router.post('/forgot', forgetPassword);
export default router;
