import express from "express";
import jobRoutes from "./routes/job.js";
const app = express();
app.use(express.json());
app.use("/api/job", jobRoutes);
export default app;
