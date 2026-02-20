import express from "express";
import dotenv from "dotenv";
import router from "./routes/user.js";
import cors from "cors"

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/user", router);

app.listen(process.env.PORT, ()=>{
  console.log(`User service is running on http://localhost:${process.env.PORT}`);
});