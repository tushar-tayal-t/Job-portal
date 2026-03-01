import sql from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { stripe } from "../index.js";
export const checkOut = TryCatch(async (req, res) => {
    const amount = req.body;
    if (!req.user) {
        new ErrorHandler(401, "No valid User");
    }
    const userId = req.user?.user_id;
    const [user] = await sql `
    SELECT * FROM users WHERE user_id=${userId}
  `;
    const subTime = user?.subscription
        ? new Date(user.subscription).getTime()
        : 0;
    const now = Date.now();
    const isSubcribed = subTime > now;
    if (isSubcribed) {
        throw new ErrorHandler(400, "Already have an subscription");
    }
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: 'Hire heaven subscription',
                    },
                    unit_amount: 119 * 100,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `http://localhost:3000/payment/verify/{CHECKOUT_SESSION_ID}`,
        cancel_url: 'http://localhost:3000/payment/verify/0',
        metadata: {
            user_id: userId?.toString(),
        },
    });
    res.status(201).json({
        url: session.url,
        message: "Checkout Successfull"
    });
});
export const paymentVerification = TryCatch(async (req, res) => {
    const user = req.user;
    const { id } = req.body;
    if (!req.user) {
        new ErrorHandler(401, "No valid User");
    }
    if (!id) {
        new ErrorHandler(400, "No id provided");
    }
    const subTime = user?.subscription
        ? new Date(user.subscription).getTime()
        : 0;
    const now = Date.now();
    const isSubcribed = subTime > now;
    const session = await stripe.checkout.sessions.retrieve(id);
    if (isSubcribed) {
        res.status(200).json({
            message: "Payment successful",
            paymentIntent: session.payment_intent
        });
    }
    if (!session) {
        new ErrorHandler(500, "No session found");
    }
    if (session.status === "complete" && session.metadata?.user_id === String(req.user?.user_id)) {
        //Database entry
        const now = new Date();
        const thiryDays = 30 * 24 * 60 * 60 * 1000;
        const expiryDate = new Date(now.getTime() + thiryDays);
        const [updatedUser] = await sql `
      UPDATE users SET subscription = ${expiryDate} WHERE user_id = ${user?.user_id} RETURNING *
    `;
        res.status(200).json({
            message: "Subscription purchased successfully",
            updatedUser,
            paymentIntent: session.payment_intent
        });
    }
    else {
        throw new ErrorHandler(400, "Please give the valid sesssion id");
    }
});
