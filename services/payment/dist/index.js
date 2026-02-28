import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import cors from "cors";
import paymentRoutes from "./routes/payment.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/payment", paymentRoutes);
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.listen(process.env.PORT, () => {
    console.log("Payment service is listening at port:", process.env.PORT);
});
