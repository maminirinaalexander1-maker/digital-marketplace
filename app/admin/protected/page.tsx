'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, isAllowedRole, logout, type SessionUser } from '@/lib/auth';

export default function AdminProtectedPage() {
  const router = useRouter();
  const [user] = useState<SessionUser | null>(() => getSession());

  useEffect(() => {
    if (!isAllowedRole(user, 'admin')) {
      router.replace('/login');
    }
  }, [router, user]);

  if (!user) return null;

  return (
    <main className="page-shell">
      <div className="form-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Zone protégée</span>
            <h2 style={{ marginTop: '0.8rem' }}>Administration sécurisée</h2>
          </div>
          <button
            className="secondary-btn"
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
          >
            Déconnexion
          </button>
        </div>

        <p className="muted">Bienvenue {user.name}. Cette page est réservée aux admins.</p>
      </div>
    </main>
  );
}
