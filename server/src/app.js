import fs from "fs";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { MemoryRepository } from "./repositories/memory-repository.js";
import { seed } from "./repositories/seed.js";
import { makeRoutes } from "./routes/index.js";
import { ResourceService } from "./services/resource-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(customRepository) {
  const repository = customRepository || new MemoryRepository(seed);
  const service = new ResourceService(repository);
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: false }));

  // Support multiple comma-separated origins in CLIENT_URL (e.g. Vercel URL + localhost)
  const allowedOrigins = env.CLIENT_URL
    ? env.CLIENT_URL.split(",").map(u => u.trim())
    : ["http://localhost:5173"];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, same-origin server requests)
      if (!origin || allowedOrigins.some(o => o === "*" || o === origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true
  }));

  app.use(express.json({ limit: "1mb" }));

  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  if (env.NODE_ENV !== "test") app.use(morgan("dev"));
  app.use("/api/v1", rateLimit({ windowMs: 60000, limit: 200, standardHeaders: "draft-7" }), makeRoutes(service, repository));

  const clientDistPath = path.join(__dirname, "../../client/dist");
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}


export const app = createApp();
