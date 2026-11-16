import { z } from 'zod';

const priceInPaise = z.string()
  .trim()
  .regex(/^\d{1,8}(\.\d{1,2})?$/, 'Enter a price with up to two decimal places')
  .transform((value) => Math.round(Number(value) * 100))
  .refine(Number.isSafeInteger, 'Price is outside the supported range')
  .refine((value) => value > 0, 'Price must be greater than zero');

const optionalPriceInPaise = z.union([priceInPaise, z.literal('')])
  .optional()
  .transform((value) => typeof value === 'number' ? value : undefined);

const imageUrl = z.string().trim().min(1).max(1000).refine(
  (value) => (value.startsWith('/') && !value.startsWith('//')) || /^https:\/\//i.test(value),
  'Image must be a secure URL or a local path',
);

const variantSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  options: z.record(z.string().trim().min(1).max(30)).refine((options) => Object.keys(options).length > 0 && Object.keys(options).length <= 8),
  price: priceInPaise,
  stockQty: z.number().int().min(0).max(1_000_000_000),
  lowStockThreshold: z.number().int().min(0).max(1_000_000_000).default(5),
  image: imageUrl.optional(),
}).strict();

export const sellerProductInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2000),
  price: priceInPaise.optional(),
  compareAtPrice: optionalPriceInPaise,
  categorySlug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/i),
  subCategory: z.string().trim().max(100).optional().default(''),
  brand: z.string().trim().max(100).optional().default(''),
  sku: z.string().trim().max(80).optional().default(''),
  image: imageUrl,
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
  stockQty: z.number().int().min(0).max(1_000_000_000),
  lowStockThreshold: z.number().int().min(0).max(1_000_000_000).default(5),
  allowBackorders: z.boolean().default(false),
  hasVariants: z.boolean().default(false),
  variants: z.array(variantSchema).max(50).default([]),
}).strict().superRefine((product, context) => {
  if (!product.hasVariants && product.price === undefined) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['price'], message: 'Price is required when the product has no variants' });
  }
  const startingPrice = product.hasVariants && product.variants.length
    ? Math.min(...product.variants.map((variant) => variant.price))
    : product.price;
  if (product.compareAtPrice !== undefined && startingPrice !== undefined && product.compareAtPrice <= startingPrice) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['compareAtPrice'],
      message: 'Compare-at price must be higher than the selling price',
    });
  }
  if (product.hasVariants && product.variants.length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['variants'], message: 'Add at least one variant' });
  }
  if (!product.hasVariants && product.variants.length > 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['variants'], message: 'Enable variants before adding variant rows' });
  }
  const skus = product.variants.map((variant) => variant.sku.toLowerCase());
  if (new Set(skus).size !== skus.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['variants'], message: 'Each variant must have a unique SKU' });
  }
});

export type SellerProductInput = z.infer<typeof sellerProductInputSchema>;
