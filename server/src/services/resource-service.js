import { randomUUID } from "node:crypto";
import { HttpError } from "../utils/http-error.js";

export class ResourceService {
  constructor(repository) { this.repository = repository; }

  async list(name, userId, query) { return await this.repository.list(name, userId, query); }

  async get(name, id, userId) {
    const item = await this.repository.get(name, id, userId);
    if (!item) throw new HttpError(404, "Item was not found");
    return item;
  }

  async create(name, values, userId) {
    const item = await this.repository.create(name, values, userId);
    await this.addActivity(userId, `Created ${this.label(name)}: ${item.title || item.name}`, name);
    return item;
  }

  async update(name, id, values, userId) {
    const item = await this.repository.update(name, id, values, userId);
    if (!item) throw new HttpError(404, "Item was not found");
    await this.addActivity(userId, `Updated ${this.label(name)}: ${item.title || item.name}`, name);
    return item;
  }

  async remove(name, id, userId) {
    const item = await this.repository.remove(name, id, userId);
    if (!item) throw new HttpError(404, "Item was not found");
    await this.addActivity(userId, `Deleted ${this.label(name)}: ${item.title || item.name}`, name);
    return item;
  }

  async updateNested(name, id, field, nestedId, values, userId, remove = false) {
    const item = await this.get(name, id, userId);
    const entries = [...(item[field] || [])];
    if (!nestedId) entries.push({ id: randomUUID(), ...values });
    else if (remove) {
      const index = entries.findIndex(entry => entry.id === nestedId);
      if (index !== -1) entries.splice(index, 1);
    } else {
      const index = entries.findIndex(entry => entry.id === nestedId);
      if (index < 0) throw new HttpError(404, "Nested item was not found");
      entries[index] = { ...entries[index], ...values };
    }
    return await this.update(name, id, { [field]: entries }, userId);
  }

  async addActivity(userId, action, resource) { await this.repository.create("activities", { action, resource }, userId); }
  label(name) { return name.replace(/([A-Z])/g, " $1").replace(/s$/, "").trim(); }
}

