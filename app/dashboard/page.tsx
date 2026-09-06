'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <main className="page-shell dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Espace personnel</span>
          <h1>Bonjour, {user.name.split(' ')[0]}.</h1>
          <p className="muted">Retrouvez vos actions et vos accès au même endroit.</p>
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

      <div className="dashboard-grid">
        <section className="dashboard-panel dashboard-panel-main">
          <div className="section-heading" style={{ marginBottom: '1rem' }}>
          <div>
              <span className="panel-kicker">Votre compte</span>
              <h2>Un espace simple, pensé pour avancer.</h2>
          </div>
        </div>

          <p className="muted">Vous êtes connecté en tant que <strong>{user.role}</strong>. Explorez les ressources numériques ou développez votre propre catalogue.</p>
          <div className="dashboard-actions">
            <Link href="/" className="primary-btn">Explorer le catalogue</Link>
            {user.role === 'seller' || user.role === 'admin' ? <Link href="/seller" className="secondary-btn">Publier un produit</Link> : null}
            {user.role === 'admin' ? <Link href="/admin" className="secondary-btn">Ouvrir l’administration</Link> : null}
          </div>
        </section>

        <aside className="dashboard-panel dashboard-panel-accent">
          <span className="panel-kicker">Votre rôle</span>
          <strong className="role-display">{user.role}</strong>
          <p>Les accès disponibles sont automatiquement adaptés à votre profil.</p>
        </aside>
      </div>
    </main>
  );
}
