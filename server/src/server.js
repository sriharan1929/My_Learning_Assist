import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { models } from "./models/index.js";
import { MongoRepository } from "./repositories/mongo-repository.js";

let repository;
if (env.MONGODB_URI) {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected to MongoDB successfully.");
  repository = new MongoRepository(models);

  try {
    const demoUser = await models.users.findOne({ email: env.DEMO_EMAIL });
    if (!demoUser) {
      console.log("Seeding demo user into MongoDB...");
      const hashedPassword = await bcrypt.hash(env.DEMO_PASSWORD, 10);
      await models.users.create({
        _id: "demo-user",
        name: "Alex Morgan",
        email: env.DEMO_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: "Learner"
      });
      console.log("Demo user seeded successfully.");
    }
  } catch (err) {
    console.error("Warning: Failed to seed demo user:", err);
  }
}

const app = createApp(repository);

app.listen(env.PORT, () => console.log(`My Learning OS API is running on http://localhost:${env.PORT}`));

