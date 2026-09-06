'use client';

import { useEffect, useState } from 'react';
import { getSession, isAllowedRole, logout, type SessionUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ProductSummary = { id: string; title: string; price: number; category?: string };

export default function AdminPage() {
  const router = useRouter();
  const [user] = useState<SessionUser | null>(() => getSession());
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!isAllowedRole(user, 'admin')) {
      router.replace('/login');
    }
  }, [router, user]);

  useEffect(() => {
    fetch('/api/products')
      .then((response) => response.json())
      .then((data) => setProducts(Array.isArray(data.products) ? data.products : []))
      .finally(() => setLoadingProducts(false));
  }, []);

  if (!user) return null;

  return (
    <main className="page-shell dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Vue d’ensemble.</h1>
          <p className="muted">Supervisez le catalogue et gardez une marketplace saine.</p>
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

      <div className="admin-stats">
        <div className="metric-card"><span>Produits visibles</span><strong>{loadingProducts ? '...' : products.length}</strong></div>
        <div className="metric-card"><span>Rôle actif</span><strong>Admin</strong></div>
        <div className="metric-card"><span>État du catalogue</span><strong className="metric-positive">En ligne</strong></div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel dashboard-panel-main">
          <div className="section-heading" style={{ marginBottom: '1rem' }}>
          <div>
              <span className="panel-kicker">Catalogue récent</span>
              <h2>Les ressources publiées</h2>
          </div>
        </div>
          {products.length ? <div className="admin-product-list">{products.slice(0, 5).map((product) => <div className="admin-product-row" key={product.id}><span>{product.title}</span><span>{product.category || 'Numérique'} · {new Intl.NumberFormat('fr-FR').format(product.price)} MGA</span></div>)}</div> : <p className="muted">Aucun produit à afficher.</p>}
        </section>
        <aside className="dashboard-panel dashboard-panel-accent">
          <span className="panel-kicker">Raccourcis</span>
          <h2>Actions rapides</h2>
          <div className="stack-actions"><Link href="/seller" className="primary-btn">Publier un produit</Link><Link href="/admin/protected" className="secondary-btn">Zone protégée</Link></div>
        </aside>
      </div>
    </main>
  );
}
