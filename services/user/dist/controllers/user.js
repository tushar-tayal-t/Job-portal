import { TryCatch } from "../utils/TryCatch.js";
export const myProfile = TryCatch(async (req, res, next) => {
    const user = req.user;
    res.json(user);
});
