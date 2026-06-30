import { Router } from "express";
import { loginSchema, registerSchema, resourceNames, schemas, stepSchema, itemSchema, customModuleItemSchema } from "@learning-os/shared";
import { login, logout, me, register } from "../controllers/auth-controller.js";
import { analytics, dashboard, search } from "../controllers/insight-controller.js";
import { makeResourceController } from "../controllers/resource-controller.js";
import { upload, uploadFile } from "../controllers/upload-controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";


export function makeRoutes(service, repository) {
  const router = Router();
  router.post("/auth/login", validate(loginSchema), login);
  router.post("/auth/register", validate(registerSchema), register);
  router.post("/auth/logout", requireAuth, logout);
  router.get("/auth/me", requireAuth, me);
  router.get("/dashboard", requireAuth, dashboard(repository));
  router.get("/analytics", requireAuth, analytics(repository));
  router.get("/search", requireAuth, search(repository));
  router.post("/upload", requireAuth, upload.single("file"), uploadFile);

  resourceNames.forEach(name => {
    const path = name === "customModules" ? "custom-modules" : name === "studySessions" ? "study-sessions" : name;
    const controller = makeResourceController(name, service);
    router.get(`/${path}`, requireAuth, controller.list);
    router.get(`/${path}/:id`, requireAuth, controller.get);
    router.post(`/${path}`, requireAuth, validate(schemas[name]), controller.create);
    router.put(`/${path}/:id`, requireAuth, validate(schemas[name].partial()), controller.update);
    router.delete(`/${path}/:id`, requireAuth, controller.remove);
  });

  const nestedSchemas = {
    "roadmaps/steps": stepSchema,
    "checklists/items": itemSchema,
    "custom-modules/items": customModuleItemSchema
  };

  const nestedRoutes = [["roadmaps", "steps"], ["checklists", "items"], ["custom-modules", "items"]];
  nestedRoutes.forEach(([path, field]) => {
    const name = path === "custom-modules" ? "customModules" : path;
    const schema = nestedSchemas[`${path}/${field}`];
    router.post(`/${path}/:id/${field}`, requireAuth, validate(schema), asyncHandler(async (req, res) => {
      sendNested(res, await service.updateNested(name, req.params.id, field, null, req.body, req.user.sub), 201);
    }));
    router.put(`/${path}/:id/${field}/:nestedId`, requireAuth, validate(schema.partial()), asyncHandler(async (req, res) => {
      sendNested(res, await service.updateNested(name, req.params.id, field, req.params.nestedId, req.body, req.user.sub));
    }));
    router.delete(`/${path}/:id/${field}/:nestedId`, requireAuth, asyncHandler(async (req, res) => {
      sendNested(res, await service.updateNested(name, req.params.id, field, req.params.nestedId, {}, req.user.sub, true));
    }));
  });
  return router;
}

function sendNested(res, data, status = 200) { res.status(status).json({ success: true, data }); }
