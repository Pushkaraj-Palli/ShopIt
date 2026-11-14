/** Legacy catalogue items without a marketplace status remain public until migrated. */
export function publicProductQuery<T extends Record<string, unknown>>(filters: T = {} as T) {
  return {
    $and: [
      {
        $or: [
          { status: 'active' },
          { status: { $exists: false }, sellerId: { $exists: false } },
        ],
      },
      filters,
    ],
  };
}
