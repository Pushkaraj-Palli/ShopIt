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

export const sellerProductInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2000),
  price: priceInPaise,
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
}).strict().superRefine((product, context) => {
  if (product.compareAtPrice !== undefined && product.compareAtPrice <= product.price) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['compareAtPrice'],
      message: 'Compare-at price must be higher than the selling price',
    });
  }
});

export type SellerProductInput = z.infer<typeof sellerProductInputSchema>;
