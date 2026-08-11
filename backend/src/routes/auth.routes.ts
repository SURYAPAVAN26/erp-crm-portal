import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/auth.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/register", authenticate, authorize("ADMIN"), validate(registerSchema), register);
router.get("/me", authenticate, me);

export default router;
