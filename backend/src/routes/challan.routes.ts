import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createChallanSchema, idParamSchema } from "../validators/challan.validators";
import {
  listChallans,
  getChallan,
  createChallan,
  confirmChallan,
  cancelChallan,
} from "../controllers/challan.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE"), listChallans);
router.get("/:id", authorize("ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE"), validate(idParamSchema), getChallan);
router.post("/", authorize("ADMIN", "SALES"), validate(createChallanSchema), createChallan);
router.post("/:id/confirm", authorize("ADMIN", "SALES", "WAREHOUSE"), validate(idParamSchema), confirmChallan);
router.post("/:id/cancel", authorize("ADMIN", "SALES"), validate(idParamSchema), cancelChallan);

export default router;
