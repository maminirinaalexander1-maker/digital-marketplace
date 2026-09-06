'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <main className="page-shell dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Zone protégée</span>
          <h1>Administration sécurisée.</h1>
          <p className="muted">Cette zone confirme que votre rôle admin est bien actif.</p>
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
          <span className="panel-kicker">Accès confirmé</span>
          <h2>Bonjour {user.name}.</h2>
          <p className="muted">Vous disposez des autorisations nécessaires pour superviser les produits, les comptes et les commandes.</p>
          <div className="dashboard-actions">
            <Link href="/admin" className="primary-btn">Retour au dashboard</Link>
            <Link href="/" className="secondary-btn">Voir le catalogue</Link>
          </div>
        </section>
        <aside className="dashboard-panel dashboard-panel-accent">
          <span className="panel-kicker">Sécurité</span>
          <strong className="role-display">ADMIN</strong>
          <p>Votre session est protégée par le contrôle de rôle côté serveur.</p>
        </aside>
      </div>
    </main>
  );
}
