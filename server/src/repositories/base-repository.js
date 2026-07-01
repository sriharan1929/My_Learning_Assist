export class BaseRepository {
  list() { throw new Error("list() must be implemented"); }
  all() { throw new Error("all() must be implemented"); }
  get() { throw new Error("get() must be implemented"); }
  create() { throw new Error("create() must be implemented"); }
  update() { throw new Error("update() must be implemented"); }
  remove() { throw new Error("remove() must be implemented"); }
}
