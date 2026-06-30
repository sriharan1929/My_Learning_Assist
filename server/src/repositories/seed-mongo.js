import mongoose from "mongoose";
import { env } from "../config/env.js";
import { models } from "../models/index.js";
import { seed } from "./seed.js";

async function seedDatabase() {
  const uri = env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI is not defined in the environment.");
    process.exit(1);
  }

  console.log(`Connecting to database at ${uri}...`);
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  for (const [key, items] of Object.entries(seed)) {
    const model = models[key];
    if (!model) {
      console.warn(`Warning: No model found for key ${key}`);
      continue;
    }

    console.log(`Clearing collection for ${key}...`);
    await model.deleteMany({});

    console.log(`Inserting ${items.length} items for ${key}...`);
    // Omit custom string id so Mongoose/MongoDB can auto-generate a valid ObjectId _id
    const formatted = items.map(item => {
      const copy = { ...item };
      delete copy.id;
      return copy;
    });
    await model.insertMany(formatted);
  }

  console.log("Database seeded successfully!");
  await mongoose.disconnect();
}

seedDatabase().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
