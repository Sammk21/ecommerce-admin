import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Product name must be at least 3 characters",
    })
    .max(255, {
      message: "Product name must not exceed 255 characters",
    }),
  price: z.coerce
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .min(0.01, {
      message: "Price must be greater than 0",
    }),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const productFilterSchema = z.object({
  name: z.string().optional(),
  sku: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export type ProductFilterValues = z.infer<typeof productFilterSchema>;
