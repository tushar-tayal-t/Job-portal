import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv';
dotenv.config();
let sql;
try {
    sql = global.__sql ?? (global.__sql = neon(process.env.DB_URL));
}
catch (err) {
    console.error("Failed to initialize DB client:", err);
    // fallback so app doesn't crash
    sql = undefined;
}
export default sql;
