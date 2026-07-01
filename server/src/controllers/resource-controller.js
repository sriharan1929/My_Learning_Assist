import { querySchema } from "@learning-os/shared";
import { asyncHandler } from "../utils/async-handler.js";
import { sendData } from "../utils/response.js";

export function makeResourceController(name, service) {
  return {
    list: asyncHandler(async (req, res) => sendData(res, await service.list(name, req.user.sub, querySchema.parse(req.query)))),
    get: asyncHandler(async (req, res) => sendData(res, await service.get(name, req.params.id, req.user.sub))),
    create: asyncHandler(async (req, res) => sendData(res, await service.create(name, req.body, req.user.sub), "Created successfully", 201)),
    update: asyncHandler(async (req, res) => sendData(res, await service.update(name, req.params.id, req.body, req.user.sub), "Updated successfully")),
    remove: asyncHandler(async (req, res) => sendData(res, await service.remove(name, req.params.id, req.user.sub), "Deleted successfully"))
  };
}
