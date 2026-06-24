import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";
import { sendData } from "../utils/response.js";

const currentUser = { id: "demo-user", name: "Alex Morgan", email: env.DEMO_EMAIL, role: "Learner", isDemo: !env.MONGODB_URI };

export function login(req, res) {
  if (req.body.email !== env.DEMO_EMAIL || req.body.password !== env.DEMO_PASSWORD) throw new HttpError(401, "Email or password is incorrect");
  const token = jwt.sign({ sub: currentUser.id, email: currentUser.email }, env.JWT_SECRET, { expiresIn: "8h" });
  sendData(res, { token, user: currentUser }, "Welcome back");
}

export function me(_req, res) { sendData(res, currentUser); }
export function logout(_req, res) { sendData(res, null, "Signed out successfully"); }
