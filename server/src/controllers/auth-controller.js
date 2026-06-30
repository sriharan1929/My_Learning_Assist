import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { models } from "../models/index.js";
import { HttpError } from "../utils/http-error.js";
import { sendData } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";

const currentUser = { id: "demo-user", name: "Alex Morgan", email: env.DEMO_EMAIL, role: "Learner", isDemo: !env.MONGODB_URI };

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!env.MONGODB_URI) {
    if (email !== env.DEMO_EMAIL || password !== env.DEMO_PASSWORD) {
      throw new HttpError(401, "Email or password is incorrect");
    }
    const token = jwt.sign({ sub: currentUser.id, email: currentUser.email }, env.JWT_SECRET, { expiresIn: "8h" });
    return sendData(res, { token, user: currentUser }, "Welcome back");
  }

  const user = await models.users.findOne({ email: email.toLowerCase() });
  if (!user) throw new HttpError(401, "Email or password is incorrect");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new HttpError(401, "Email or password is incorrect");

  const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: "8h" });
  sendData(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, isDemo: false }
  }, "Welcome back");
});

export const me = asyncHandler(async (req, res) => {
  if (!env.MONGODB_URI) {
    return sendData(res, currentUser);
  }

  const user = await models.users.findById(req.user.sub).lean();
  if (!user) throw new HttpError(404, "User not found");

  sendData(res, {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isDemo: false
  });
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!env.MONGODB_URI) {
    throw new HttpError(400, "Registration is not supported in demo memory mode");
  }

  const existing = await models.users.findOne({ email: email.toLowerCase() });
  if (existing) throw new HttpError(400, "A user with this email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await models.users.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "Learner"
  });

  const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: "8h" });
  sendData(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, isDemo: false }
  }, "Registered successfully", 201);
});

export function logout(_req, res) {
  sendData(res, null, "Signed out successfully");
}

