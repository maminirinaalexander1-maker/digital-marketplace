'use client';

import { useEffect, useState } from 'react';
import { getSession, isAllowedRole, logout, type SessionUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
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
        <div className="section-heading" style={{ marginBottom: '1rem' }}>
          <div>
            <span className="eyebrow">Admin</span>
            <h2 style={{ marginTop: '0.8rem' }}>Tableau de bord</h2>
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

        <p className="muted">Bienvenue {user.name}. Vous pouvez superviser la marketplace.</p>
        <div className="feature-grid" style={{ marginTop: '1.5rem' }}>
          <div className="feature-card">
            <h3>Ventes</h3>
            <p>Suivi des paiements, commandes et liens de paiement générés.</p>
          </div>
          <div className="feature-card">
            <h3>Produits</h3>
            <p>Validation des ressources publiées par les vendeurs.</p>
          </div>
          <div className="feature-card">
            <h3>Comptes</h3>
            <p>Gestion des rôles acheteur, vendeur et administrateur.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
