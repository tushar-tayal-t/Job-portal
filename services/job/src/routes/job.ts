import express from "express";
import { createCompany, deleteCompany } from "../controllers/job.js";
import uploadFile from "../middleware/multer.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/company/new", uploadFile, isAuth, createCompany);
router.delete("/company/:companyId", isAuth, deleteCompany);

export default router;