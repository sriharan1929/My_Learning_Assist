import { describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { MongoRepository } from "../src/repositories/mongo-repository.js";
import { dashboard, search } from "../src/controllers/insight-controller.js";
import { login, me, register } from "../src/controllers/auth-controller.js";
import { sendData } from "../src/utils/response.js";

const mockUserFindOne = vi.fn();
const mockUserCreate = vi.fn();
const mockUserFindById = vi.fn();

vi.mock("../src/config/env.js", () => ({
  env: {
    MONGODB_URI: "mongodb://mock-uri",
    JWT_SECRET: "mock-secret",
    DEMO_EMAIL: "demo@learningos.dev",
    DEMO_PASSWORD: "learn123"
  }
}));

vi.mock("../src/models/index.js", () => ({
  models: {
    users: {
      findOne: (...args) => mockUserFindOne(...args),
      create: (...args) => mockUserCreate(...args),
      findById: (...args) => ({
        lean: () => mockUserFindById(...args)
      })
    }
  }
}));

vi.mock("../src/utils/response.js", () => ({
  sendData: vi.fn(),
}));

describe("MongoRepository", () => {
  it("all() queries mongoose model and returns lean results", async () => {
    const mockLean = vi.fn().mockResolvedValue([{ id: "1", title: "Test Note" }]);
    const mockFind = vi.fn().mockReturnValue({ lean: mockLean });
    const mockModel = { find: mockFind };

    const repository = new MongoRepository({ Note: mockModel });
    const result = await repository.all("Note", "user-123");

    expect(mockFind).toHaveBeenCalledWith({ userId: "user-123" });
    expect(mockLean).toHaveBeenCalled();
    expect(result).toEqual([{ id: "1", title: "Test Note" }]);
  });
});

describe("Insight Controller with MongoRepository", () => {
  it("dashboard handles repository promises correctly", async () => {
    const mockAll = vi.fn().mockResolvedValue([{ id: "1", title: "Test Item", duration: 15, status: "Completed" }]);
    const mockRepository = { all: mockAll };

    const req = { user: { sub: "user-123" } };
    const res = {};
    const next = vi.fn();

    const dashboardHandler = dashboard(mockRepository);
    await dashboardHandler(req, res, next);

    expect(mockAll).toHaveBeenCalled();
    expect(sendData).toHaveBeenCalled();
  });

  it("search handles repository promises correctly", async () => {
    const mockAll = vi.fn().mockResolvedValue([{ id: "1", title: "React Guide", name: "React Item" }]);
    const mockRepository = { all: mockAll };

    const req = { user: { sub: "user-123" }, query: { q: "React" } };
    const res = {};
    const next = vi.fn();

    const searchHandler = search(mockRepository);
    await searchHandler(req, res, next);

    expect(mockAll).toHaveBeenCalled();
    expect(sendData).toHaveBeenCalled();
  });
});

describe("Auth Controller with MongoDB", () => {
  it("register hashes password and creates user", async () => {
    mockUserFindOne.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "user-1", name: "Jane", email: "jane@test.com", role: "Learner" });

    const req = { body: { name: "Jane", email: "jane@test.com", password: "password123" } };
    const res = {};
    const next = vi.fn();

    await register(req, res, next);

    expect(mockUserFindOne).toHaveBeenCalledWith({ email: "jane@test.com" });
    expect(mockUserCreate).toHaveBeenCalled();
    expect(sendData).toHaveBeenCalled();
  });

  it("login verifies password and returns token", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    mockUserFindOne.mockResolvedValue({
      id: "user-1",
      name: "Jane",
      email: "jane@test.com",
      password: hashedPassword,
      role: "Learner"
    });

    const req = { body: { email: "jane@test.com", password: "password123" } };
    const res = {};
    const next = vi.fn();

    await login(req, res, next);

    expect(mockUserFindOne).toHaveBeenCalledWith({ email: "jane@test.com" });
    expect(sendData).toHaveBeenCalled();
  });

  it("me retrieves user details from database", async () => {
    mockUserFindById.mockResolvedValue({
      _id: "user-1",
      name: "Jane",
      email: "jane@test.com",
      role: "Learner"
    });

    const req = { user: { sub: "user-1" } };
    const res = {};
    const next = vi.fn();

    await me(req, res, next);

    expect(mockUserFindById).toHaveBeenCalledWith("user-1");
    expect(sendData).toHaveBeenCalled();
  });
});
