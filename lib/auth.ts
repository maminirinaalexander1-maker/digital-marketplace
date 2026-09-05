import { supabase } from '@/lib/supabase';

export type UserRole = 'buyer' | 'seller' | 'admin';

export type SessionUser = {
  email: string;
  role: UserRole;
  name: string;
};

export type RegisteredUser = SessionUser & {
  password: string;
};

const STORAGE_KEY = 'mada-market-session';
const ACCOUNTS_KEY = 'mada-market-accounts';
const COOKIE_NAME = 'mada-market-session';

export const demoUsers: Record<UserRole, { email: string; password: string; name: string }> = {
  buyer: {
    email: 'buyer@madadigital.com',
    password: 'buyer123',
    name: 'Achatteur Mada',
  },
  seller: {
    email: 'seller@madadigital.com',
    password: 'seller123',
    name: 'Vendeur Mada',
  },
  admin: {
    email: 'admin@madadigital.com',
    password: 'admin123',
    name: 'Administrateur',
  },
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeRole(value: unknown, fallback: UserRole): UserRole {
  const role = typeof value === 'string' ? value.toLowerCase() : fallback;
  return role === 'buyer' || role === 'seller' || role === 'admin' ? role : fallback;
}

async function getSupabaseProfileByEmail(email: string) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role')
      .eq('email', email)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

function getStoredUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RegisteredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: RegisteredUser[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(users));
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<SessionUser | null> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  if (!name || !email || !password) return null;
  if (!email.includes('@')) return null;
  if (password.length < 6) return null;
  const requestedRole: UserRole = input.role === 'seller' ? 'seller' : 'buyer';

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: requestedRole,
          },
        },
      });

      if (!error && data.user) {
        const profileUser: SessionUser = {
          email: data.user.email || email,
          role: sanitizeRole(data.user.user_metadata?.role, requestedRole),
          name: (data.user.user_metadata?.name as string) || name,
        };

        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              email: profileUser.email,
              name: profileUser.name,
              role: profileUser.role,
            },
            { onConflict: 'id' }
          );
        } catch {
          // ignore profile initialization failures during local setup
        }

        return profileUser;
      }

      return null;
    } catch {
      return null;
    }
  }

  const existingUsers = getStoredUsers();
  const alreadyExists = [...Object.values(demoUsers), ...existingUsers].some(
    (user) => user.email.toLowerCase() === email && user.name.toLowerCase() === name.toLowerCase()
  ) || existingUsers.some((user) => user.email.toLowerCase() === email);

  if (alreadyExists) return null;

  const newUser: RegisteredUser = {
    email,
    password,
    role: requestedRole,
    name,
  };

  saveStoredUsers([...existingUsers, newUser]);

  return {
    email,
    role: requestedRole,
    name,
  };
}

export async function getAuthSessionUser(): Promise<SessionUser | null> {
  if (!supabase) return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    const profile = await getSupabaseProfileByEmail(session.user.email || '');
    const profileRole = sanitizeRole(profile?.role ?? session.user.user_metadata?.role, 'buyer');
    const profileName = (profile?.name as string) || (session.user.user_metadata?.name as string) || session.user.email || 'Utilisateur';

    return {
      email: session.user.email || '',
      role: profileRole,
      name: profileName,
    };
  } catch {
    return null;
  }
}

export async function loginWithRole(email: string, password: string, role: UserRole): Promise<SessionUser | null> {
  const normalizedEmail = normalizeEmail(email);

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!error && data.user) {
        const profile = await getSupabaseProfileByEmail(data.user.email || normalizedEmail);
        const profileRole = sanitizeRole(profile?.role ?? data.user.user_metadata?.role ?? role, role);
        const profileName = (profile?.name as string) || (data.user.user_metadata?.name as string) || data.user.email || 'Utilisateur';

        if (profile && profileRole !== role) {
          return null;
        }

        return {
          email: data.user.email || normalizedEmail,
          role: profileRole,
          name: profileName,
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  const demo = demoUsers[role];

  if (demo && demo.email === normalizedEmail && demo.password === password) {
    return {
      email: demo.email,
      role,
      name: demo.name,
    };
  }

  const customUser = getStoredUsers().find(
    (user) => user.email.toLowerCase() === normalizedEmail && user.role === role && user.password === password
  );

  if (customUser) {
    return {
      email: customUser.email,
      role: customUser.role,
      name: customUser.name,
    };
  }

  return null;
}

export function getSessionFromCookie(cookieValue?: string | null): SessionUser | null {
  if (!cookieValue) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue)) as SessionUser;
    if (!parsed?.email || !parsed?.role || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(user: SessionUser) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SessionUser;
      if (parsed?.email && parsed?.role && parsed?.name) return parsed;
    } catch {
      // ignore invalid localStorage JSON
    }
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${COOKIE_NAME}=`))
    ?.split('=')[1];

  const cookieUser = getSessionFromCookie(cookie);
  if (cookieUser) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cookieUser));
    return cookieUser;
  }

  return null;
}

export async function logout() {
  if (typeof window === 'undefined') return;

  try {
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch {
    // ignore supabase signOut errors when using local fallback auth
  }

  window.localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function isAllowedRole(user: SessionUser | null, allowedRoles: UserRole | UserRole[]) {
  if (!user) return false;
  const list = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return list.includes(user.role);
}

