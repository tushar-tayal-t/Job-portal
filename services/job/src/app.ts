import express from "express";
import jobRoutes from "./routes/job.js";
import { connectKafka } from "./producer.js";

const app = express();
connectKafka();

app.use(express.json());
app.use("/api/job", jobRoutes); 

export default app;