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
  app.use(cors({ origin: env.CLIENT_URL }));
  app.use(express.json({ limit: "1mb" }));
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  if (env.NODE_ENV !== "test") app.use(morgan("dev"));
  app.use("/api/v1", rateLimit({ windowMs: 60000, limit: 200, standardHeaders: "draft-7" }), makeRoutes(service, repository));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
