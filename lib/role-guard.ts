import { cookies } from 'next/headers';
import { getSessionFromCookie, isAllowedRole, type UserRole } from '@/lib/auth';

export async function requireRole(allowedRoles: UserRole | UserRole[]) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('mada-market-session')?.value ?? null;
  const user = getSessionFromCookie(sessionCookie);

  if (!isAllowedRole(user, allowedRoles)) {
    return null;
  }

  return user;
}
