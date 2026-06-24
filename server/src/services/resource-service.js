import { HttpError } from "../utils/http-error.js";

export class ResourceService {
  constructor(repository) { this.repository = repository; }

  list(name, userId, query) { return this.repository.list(name, userId, query); }

  get(name, id, userId) {
    const item = this.repository.get(name, id, userId);
    if (!item) throw new HttpError(404, "Item was not found");
    return item;
  }

  create(name, values, userId) {
    const item = this.repository.create(name, values, userId);
    this.addActivity(userId, `Created ${this.label(name)}: ${item.title || item.name}`, name);
    return item;
  }

  update(name, id, values, userId) {
    const item = this.repository.update(name, id, values, userId);
    if (!item) throw new HttpError(404, "Item was not found");
    this.addActivity(userId, `Updated ${this.label(name)}: ${item.title || item.name}`, name);
    return item;
  }

  remove(name, id, userId) {
    const item = this.repository.remove(name, id, userId);
    if (!item) throw new HttpError(404, "Item was not found");
    this.addActivity(userId, `Deleted ${this.label(name)}: ${item.title || item.name}`, name);
    return item;
  }

  updateNested(name, id, field, nestedId, values, userId, remove = false) {
    const item = this.get(name, id, userId);
    const entries = [...(item[field] || [])];
    if (!nestedId) entries.push({ id: crypto.randomUUID(), ...values });
    else if (remove) entries.splice(entries.findIndex(entry => entry.id === nestedId), 1);
    else {
      const index = entries.findIndex(entry => entry.id === nestedId);
      if (index < 0) throw new HttpError(404, "Nested item was not found");
      entries[index] = { ...entries[index], ...values };
    }
    return this.update(name, id, { [field]: entries }, userId);
  }

  addActivity(userId, action, resource) { this.repository.create("activities", { action, resource }, userId); }
  label(name) { return name.replace(/([A-Z])/g, " $1").replace(/s$/, "").trim(); }
}
