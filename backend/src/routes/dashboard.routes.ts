import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getSummary } from "../controllers/dashboard.controller";

const router = Router();

router.use(authenticate);
router.get("/summary", getSummary);

export default router;
