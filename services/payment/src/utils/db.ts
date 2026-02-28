import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv';

dotenv.config();
declare global {
  var __sql: ReturnType<typeof neon> | undefined;
}

const sql = global.__sql ?? (global.__sql = neon(process.env.DB_URL as string));

export default sql;
