/** Roles that can be assigned to a ShopIt account. */
export const USER_ROLES = ['customer', 'retailer', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type Permission =
  | 'browseCatalogue'
  | 'checkout'
  | 'manageOwnProducts'
  | 'manageOwnOrders'
  | 'administerPlatform';

/** Capabilities are kept here so route handlers and UI can share one policy. */
export const PERMISSIONS: Record<Permission, readonly UserRole[]> = {
  browseCatalogue: ['customer', 'retailer', 'admin'],
  checkout: ['customer', 'retailer', 'admin'],
  manageOwnProducts: ['retailer', 'admin'],
  manageOwnOrders: ['retailer', 'admin'],
  administerPlatform: ['admin'],
};

export function hasPermission(
  role: UserRole | null | undefined,
  permission: Permission,
): boolean {
  return role !== null && role !== undefined && PERMISSIONS[permission].includes(role);
}

export function hasRole(
  role: UserRole | null | undefined,
  allowedRoles: readonly UserRole[],
): boolean {
  return role !== null && role !== undefined && allowedRoles.includes(role);
}
