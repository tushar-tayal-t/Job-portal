import { AuthenticatedRequest } from "../middleware/auth.js";
import sql from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { stripe } from "../index.js";

export const checkOut = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    new ErrorHandler(401, "No valid User");
  }

  const userId = req.user?.user_id;

  const [user] = await sql`
    SELECT * FROM users WHERE user_id=${userId}
  ` as any[];

  const subTime = user?.subscription 
    ? new Date(user.subscription).getTime() 
    : 0;
  
  const now = Date.now();

  const isSubcribed = subTime > now;

  if (isSubcribed) {
    throw new ErrorHandler(400, "Already have an subscription");
  }

  const options = {
    amount: Number(119 * 100),
    currency: "INR",
    automatic_payment_methods: { enabled: true },
    metadata: {
      user_id: userId?.toString() as string,
    }
  }

  const paymentIntent = await stripe.paymentIntents.create(options);

  res.status(201).json({
    paymentIntent,
    message: "Checkout Successfull"
  });
});

export const paymentVerification = TryCatch(async(req: AuthenticatedRequest, res)=>{
  const user = req.user;
  if (!req.user) {
    new ErrorHandler(401, "No valid User");
  }
  // {
  //   "id": "pi_3NxABC123xyz",
  //   "object": "payment_intent",
  //   "amount": 11900,
  //   "currency": "inr",
  //   "status": "requires_payment_method",
  //   "client_secret": "pi_3NxABC123xyz_secret_xxxxxxxxx",
  //   "metadata": {
  //     "user_id": "64f123abc456"
  //   },
  //   "created": 1709123456
  // }
  


})