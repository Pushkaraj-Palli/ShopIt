// Keep the original import path working while auth logic lives beside the
// application models and database connection.
export {
  authorizationErrorResponse,
  requireRole,
  verifyAuth,
  type AuthenticatedUser,
  type RoleGuardResult,
} from '@/app/lib/auth';

/** Read the cached user ID for client-side display state only. */
export function getUserIdFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    const userData = JSON.parse(user) as { id?: string };
    return userData.id ?? null;
  } catch {
    return null;
  }
}
