import { z } from "zod";

const customerTypeEnum = z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]);
const customerStatusEnum = z.enum(["LEAD", "ACTIVE", "INACTIVE"]);

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required"),
    mobile: z.string().min(7, "Valid mobile number is required"),
    email: z.string().email().optional().or(z.literal("")),
    businessName: z.string().optional(),
    gstNumber: z.string().optional(),
    customerType: customerTypeEnum.default("RETAIL"),
    address: z.string().optional(),
    status: customerStatusEnum.default("LEAD"),
    followUpDate: z.string().datetime().optional().or(z.literal("")),
    notes: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: createCustomerSchema.shape.body.partial(),
  params: z.object({ id: z.string().uuid() }),
});

export const addFollowUpSchema = z.object({
  body: z.object({
    note: z.string().min(1, "Note is required"),
    date: z.string().datetime().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
