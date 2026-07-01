import { BaseRepository } from "./base-repository.js";

export class MongoRepository extends BaseRepository {
  constructor(models) {
    super();
    this.models = models;
  }

  async list(name, userId, query) {
    const filter = { userId };
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.tag) filter.tags = query.tag;
    if (query.search) filter.$text = { $search: query.search };
    const total = await this.models[name].countDocuments(filter);
    const items = await this.models[name].find(filter).sort(query.sort).skip((query.page - 1) * query.limit).limit(query.limit).lean();
    return { items, total, page: query.page, limit: query.limit };
  }

  all(name, userId) { return this.models[name].find({ userId }).lean(); }
  get(name, id, userId) { return this.models[name].findOne({ _id: id, userId }).lean(); }
  create(name, values, userId) { return this.models[name].create({ ...values, userId }); }
  update(name, id, values, userId) { return this.models[name].findOneAndUpdate({ _id: id, userId }, values, { new: true, runValidators: true }).lean(); }
  remove(name, id, userId) { return this.models[name].findOneAndDelete({ _id: id, userId }).lean(); }
}
