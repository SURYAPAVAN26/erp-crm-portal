import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../utils/AppError";

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw AppError.badRequest(
          "Validation failed",
          err.errors.map((e) => ({ path: e.path.join("."), message: e.message }))
        );
      }
      throw err;
    }
  };
}
