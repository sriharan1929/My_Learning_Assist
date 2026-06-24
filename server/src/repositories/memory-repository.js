import { randomUUID } from "node:crypto";
import { BaseRepository } from "./base-repository.js";

function contains(item, search) {
  return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
}

export class MemoryRepository extends BaseRepository {
  constructor(seed = {}) {
    super();
    this.data = structuredClone(seed);
  }

  list(name, userId, query = {}) {
    let items = (this.data[name] || []).filter(item => item.userId === userId);
    if (query.search) items = items.filter(item => contains(item, query.search));
    if (query.status) items = items.filter(item => item.status === query.status);
    if (query.priority) items = items.filter(item => item.priority === query.priority);
    if (query.tag) items = items.filter(item => item.tags?.includes(query.tag));
    if (query.date) items = items.filter(item => [item.dueDate, item.plannedDate, item.entryDate].includes(query.date));
    const field = query.sort?.replace("-", "") || "updatedAt";
    const direction = query.sort?.startsWith("-") ? -1 : 1;
    items.sort((a, b) => String(a[field] || "").localeCompare(String(b[field] || "")) * direction);
    const total = items.length;
    const start = (query.page - 1) * query.limit;
    return { items: items.slice(start, start + query.limit), page: query.page, limit: query.limit, total };
  }

  all(name, userId) { return (this.data[name] || []).filter(item => item.userId === userId); }
  get(name, id, userId) { return this.all(name, userId).find(item => item.id === id); }

  create(name, values, userId) {
    const now = new Date().toISOString();
    const item = { id: randomUUID(), ...values, userId, createdAt: now, updatedAt: now };
    this.data[name] ||= [];
    this.data[name].push(item);
    return item;
  }

  update(name, id, values, userId) {
    const item = this.get(name, id, userId);
    if (!item) return null;
    Object.assign(item, values, { updatedAt: new Date().toISOString() });
    return item;
  }

  remove(name, id, userId) {
    const item = this.get(name, id, userId);
    if (!item) return null;
    this.data[name] = this.data[name].filter(current => current.id !== id);
    return item;
  }
}
