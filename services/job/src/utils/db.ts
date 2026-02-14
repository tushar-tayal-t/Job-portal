import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv';

dotenv.config();
declare global {
  var __sql: ReturnType<typeof neon> | undefined;
}

let sql: any;

try {
  sql = global.__sql ?? (global.__sql = neon(process.env.DB_URL as string));
} catch (err) {
  console.error("Failed to initialize DB client:", err);
  // fallback so app doesn't crash
  sql = undefined; 
}

export default sql;
