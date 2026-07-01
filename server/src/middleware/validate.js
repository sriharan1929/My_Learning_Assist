import { HttpError } from "../utils/http-error.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message }));
      return next(new HttpError(400, "Please check the submitted information", errors));
    }
    req[source] = result.data;
    next();
  };
}
