import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    category: z.string().optional(),
    unitPrice: z.number().nonnegative("Unit price must be >= 0"),
    currentStock: z.number().int().nonnegative().default(0),
    minStockAlert: z.number().int().nonnegative().default(0),
    location: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
  params: z.object({ id: z.string().uuid() }),
});

export const stockMovementSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive("Quantity must be greater than 0"),
    type: z.enum(["IN", "OUT"]),
    reason: z.string().min(1, "Reason is required"),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
