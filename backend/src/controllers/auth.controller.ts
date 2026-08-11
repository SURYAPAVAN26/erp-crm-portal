import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/jwt";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role, name: user.name });

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
}

// Admin-only: create additional users for any role
export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw AppError.conflict("A user with this email already exists");
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
  });

  res.status(201).json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw AppError.notFound("User not found");
  res.json({ success: true, data: user });
}
