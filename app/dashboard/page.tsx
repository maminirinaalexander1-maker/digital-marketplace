'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, isAllowedRole, logout, type SessionUser } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user] = useState<SessionUser | null>(() => getSession());

  useEffect(() => {
    if (!isAllowedRole(user, ['buyer', 'seller', 'admin'])) {
      router.replace('/login');
    }
  }, [router, user]);

  if (!user) return null;

  return (
    <main className="page-shell">
      <div className="form-shell">
        <div className="section-heading" style={{ marginBottom: '1rem' }}>
          <div>
            <span className="eyebrow">Mon espace</span>
            <h2 style={{ marginTop: '0.8rem' }}>Bienvenue {user.name}</h2>
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

        <p className="muted">
          Vous êtes connecté en tant que <strong>{user.role}</strong>.
        </p>

        {user.role === 'seller' ? (
          <div style={{ marginTop: '1.5rem' }}>
            <a href="/seller" className="primary-btn">Publier un produit</a>
          </div>
        ) : null}

        {user.role === 'admin' ? (
          <div style={{ marginTop: '1.5rem' }}>
            <a href="/admin" className="primary-btn">Aller au dashboard admin</a>
          </div>
        ) : null}
      </div>
    </main>
  );
}
