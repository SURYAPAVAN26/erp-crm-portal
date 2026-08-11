import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { verifyToken, JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or invalid Authorization header");
  }
  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw AppError.unauthorized();
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw AppError.forbidden(`Role '${req.user.role}' is not permitted to perform this action`);
    }
    next();
  };
}
