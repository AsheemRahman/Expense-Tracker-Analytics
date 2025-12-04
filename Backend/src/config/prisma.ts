import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

const connectDB = async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log("PostgreSQL connected");
  } catch (error) {
    console.error("Error connecting to PostgreSQL", error);
    throw error;
  }
};

export default connectDB;