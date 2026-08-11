import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
  addFollowUpSchema,
  idParamSchema,
} from "../validators/customer.validators";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  addFollowUp,
} from "../controllers/customer.controller";

const router = Router();

router.use(authenticate);

// Admin, Sales, and Accounts can view customers. Warehouse typically doesn't need CRM access.
router.get("/", authorize("ADMIN", "SALES", "ACCOUNTS"), listCustomers);
router.get("/:id", authorize("ADMIN", "SALES", "ACCOUNTS"), validate(idParamSchema), getCustomer);
router.post("/", authorize("ADMIN", "SALES"), validate(createCustomerSchema), createCustomer);
router.put("/:id", authorize("ADMIN", "SALES"), validate(updateCustomerSchema), updateCustomer);
router.post("/:id/followups", authorize("ADMIN", "SALES"), validate(addFollowUpSchema), addFollowUp);

export default router;
