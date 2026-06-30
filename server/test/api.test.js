import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";

vi.mock("../src/config/env.js", () => ({
  env: {
    MONGODB_URI: "",
    JWT_SECRET: "test-secret-key-12345",
    DEMO_EMAIL: "demo@learningos.dev",
    DEMO_PASSWORD: "learn123"
  }
}));

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

  it("validates nested steps and items schemas", async () => {
    const roadmapRes = await request(app)
      .post("/api/v1/roadmaps")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Roadmap" });
    expect(roadmapRes.status).toBe(201);
    const roadmapId = roadmapRes.body.data.id;

    const invalidStep = await request(app)
      .post(`/api/v1/roadmaps/${roadmapId}/steps`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "" });
    expect(invalidStep.status).toBe(400);

    const validStep = await request(app)
      .post(`/api/v1/roadmaps/${roadmapId}/steps`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Learn Zod" });
    expect(validStep.status).toBe(201);
    expect(validStep.body.data.steps[0].title).toBe("Learn Zod");
  });

  it("rejects registration in demo memory mode", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "Jane Doe", email: "jane@example.com", password: "password123" });
    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Registration is not supported");
  });

  it("returns analytics data", async () => {
    const response = await request(app).get("/api/v1/analytics").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("currentStreak");
    expect(response.body.data).toHaveProperty("longestStreak");
    expect(response.body.data).toHaveProperty("studyTimeByTopic");
    expect(response.body.data).toHaveProperty("studyTimeByDate");
    expect(response.body.data).toHaveProperty("streakHistory");
  });
});

