import { z } from "zod";

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid("Valid customerId is required"),
    status: z.enum(["DRAFT", "CONFIRMED"]).default("DRAFT"),
    items: z
      .array(
        z.object({
          productId: z.string().uuid("Valid productId is required"),
          quantity: z.number().int().positive("Quantity must be greater than 0"),
        })
      )
      .min(1, "At least one product line is required"),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
