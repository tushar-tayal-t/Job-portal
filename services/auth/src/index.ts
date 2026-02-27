import app from './app.js'
import dotenv from 'dotenv'
import sql from './utils/db.js';
import { createClient, RedisClientType } from 'redis';

dotenv.config(); 

declare global{
  var redisClientGlobal: RedisClientType | undefined;
}

if (!global.redisClientGlobal) {
  global.redisClientGlobal = createClient({ 
    url: process.env.REDIS_URL, 
  });

  global.redisClientGlobal 
    .connect()
    .then(()=> console.log("✅ Connected to redis"))
    .catch(console.error);
} else {
  console.log("✅ Connected to redis");
}  
export const redisClient: RedisClientType = global.redisClientGlobal!; 

async function initDb() {
  try {
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role as ENUM ('jobseeker', 'recruiter');
        END IF;
      END$$;
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        role user_role NOT NULL,
        bio TEXT,
        resume VARCHAR(255),
        resume_public_id VARCHAR(255),
        profile_pic VARCHAR(255),
        profile_pic_public_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        subscription TIMESTAMPTZ 
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS skills (
        skill_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_skills (
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, skill_id)
      )
    `;
    console.log("Database created successfully");
  } catch(error) {
    console.error("Error occur:", error);
  }
}

initDb().then(()=>{
  app.listen(process.env.PORT, ()=>{
    console.log(
      `Auth service is running on http://localhost:${process.env.PORT}`
    );
  })
});
