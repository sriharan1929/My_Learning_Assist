import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(12).default("local-demo-secret"),
  DEMO_EMAIL: z.string().email().default("demo@learningos.dev"),
  DEMO_PASSWORD: z.string().min(6).default("learn123"),
  MONGODB_URI: z.string().default("")
});

export const env = envSchema.parse(process.env);
