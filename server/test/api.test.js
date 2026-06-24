import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();
let token;

beforeAll(async () => {
  const response = await request(app).post("/api/v1/auth/login").send({ email: "demo@learningos.dev", password: "learn123" });
  token = response.body.data.token;
});

describe("API", () => {
  it("rejects unauthenticated requests", async () => {
    const response = await request(app).get("/api/v1/tasks");
    expect(response.status).toBe(401);
  });

  it("returns dashboard summaries", async () => {
    const response = await request(app).get("/api/v1/dashboard").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.stats.items).toBeGreaterThan(0);
  });

  it("validates and creates a task", async () => {
    const invalid = await request(app).post("/api/v1/tasks").set("Authorization", `Bearer ${token}`).send({ title: "" });
    expect(invalid.status).toBe(400);
    const response = await request(app).post("/api/v1/tasks").set("Authorization", `Bearer ${token}`).send({ title: "Test API", target: 1 });
    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe("Test API");
  });

  it("searches across resources", async () => {
    const response = await request(app).get("/api/v1/search?q=React").set("Authorization", `Bearer ${token}`);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
