import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv';
dotenv.config();
const sql = global.__sql ?? (global.__sql = neon(process.env.DB_URL));
export default sql;
