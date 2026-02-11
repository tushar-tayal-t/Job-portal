import express from "express";
import dotenv from "dotenv";
import router from "./routes/user.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/user", router);

app.listen(process.env.PORT, ()=>{
  console.log(`User service is running on http://localhost:${process.env.PORT}`);
});