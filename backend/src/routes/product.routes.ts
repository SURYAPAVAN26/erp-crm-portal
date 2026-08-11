import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  stockMovementSchema,
  idParamSchema,
} from "../validators/product.validators";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  recordStockMovement,
} from "../controllers/product.controller";

const router = Router();

router.use(authenticate);

// All authenticated roles can view products (sales needs it for challans, accounts for pricing)
router.get("/", listProducts);
router.get("/:id", validate(idParamSchema), getProduct);

router.post("/", authorize("ADMIN", "WAREHOUSE"), validate(createProductSchema), createProduct);
router.put("/:id", authorize("ADMIN", "WAREHOUSE"), validate(updateProductSchema), updateProduct);
router.post(
  "/:id/stock",
  authorize("ADMIN", "WAREHOUSE"),
  validate(stockMovementSchema),
  recordStockMovement
);

export default router;
