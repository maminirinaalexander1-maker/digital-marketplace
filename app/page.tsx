'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/supabase';

const categories = ['Tous', 'Design', 'Marketing', 'Productivité', 'Automatisation'];

const fallbackProducts: Product[] = [
  {
    id: '1',
    title: 'Pack Starter Canva Pro',
    price: 15000,
    category: 'Design',
    description: 'Modèles premium Canva, templates pour réseaux sociaux et fiches produits.',
    file_url: 'https://example.com/files/canva-pack.zip',
    image_url: '🎨',
  },
  {
    id: '2',
    title: 'Mini cours Notion Business',
    price: 22000,
    category: 'Productivité',
    description: 'Guide pratique pour organiser votre activité, vos tâches, clients et cashflow.',
    file_url: 'https://example.com/files/notion-business.pdf',
    image_url: '📘',
  },
  {
    id: '3',
    title: 'Kit de branding digital',
    price: 35000,
    category: 'Marketing',
    description: 'Logo, palette, mockups et feuilles de style pour lancer une présence forte.',
    file_url: 'https://example.com/files/branding-kit.zip',
    image_url: '✨',
  },
  {
    id: '4',
    title: 'Checklist vente WhatsApp',
    price: 12000,
    category: 'Automatisation',
    description: 'Script, réponses automatiques et plan de vente sur WhatsApp.',
    file_url: 'https://example.com/files/whatsapp-checklist.pdf',
    image_url: '💬',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Tous') return products;
    return products.filter((product) => (product.category || 'Design') === selectedCategory);
  }, [products, selectedCategory]);

  async function handleBuy(product: Product) {
    const email = window.prompt('Entrez votre adresse e-mail pour recevoir le paiement et le fichier :');

    if (!email || !email.includes('@')) {
      alert('Adresse e-mail invalide.');
      return;
    }

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        email,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.paymentUrl) {
      alert(result.error || 'Une erreur est survenue lors du checkout.');
      return;
    }

    window.location.assign(result.paymentUrl);
  }

  return (
    <>
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">Produits numériques • MGA</span>
              <h1>Achète les meilleurs outils digitaux en Ariary.</h1>
              <p>
                Trouvez des ressources, templates, checklists et packs de vente pour lancer,
                automatiser et développer votre activité en ligne depuis Madagascar.
              </p>
              <div className="hero-actions">
                <a href="#catalogue" className="primary-btn">Découvrir les produits</a>
                <a href="/seller" className="secondary-btn">Ajouter un produit</a>
              </div>
            </div>

            <div className="hero-card">
              <div className="stat-grid">
                <div className="stat">
                  <strong>+1.2k</strong>
                  <span className="muted">Téléchargements</span>
                </div>
                <div className="stat">
                  <strong>14</strong>
                  <span className="muted">Créateurs</span>
                </div>
                <div className="stat">
                  <strong>4.9/5</strong>
                  <span className="muted">Note</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-us" className="feature-section">
          <div className="container">
            <div className="section-heading center-heading">
              <h2>Pourquoi Mada Digital Market ?</h2>
            </div>
            <div className="feature-grid">
              <div className="feature-card">
                <span className="feature-icon">⚡</span>
                <h3>Livraison instantanée</h3>
                <p>Recevez vos fichiers immédiatement après paiement, sans attente ni friction.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">💸</span>
                <h3>Paiement local</h3>
                <p>Payez en Ariary avec MVola et Orange Money via des liens de paiement sécurisés.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🧠</span>
                <h3>Contenus IA</h3>
                <p>Les vendeurs profitent d’une aide AI pour améliorer la commercialisation de leurs produits.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="catalogue" className="main-section">
          <div className="container">
            <div className="section-heading">
              <h2>Produits populaires</h2>
              <span className="muted">Paiements MVola / Orange Money</span>
            </div>

            <div className="category-bar">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={selectedCategory === category ? 'chip active' : 'chip'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="products-grid">
              {loading ? (
                <p className="muted">Chargement des produits...</p>
              ) : (
                filteredProducts.map((product) => (
                  <article key={product.id} className="product-card">
                    <div className="product-visual">{product.image_url || '📦'}</div>
                    <div className="product-content">
                      <div className="product-meta">
                        <span className="inline-badge">{product.category || 'Numérique'}</span>
                        <span className="product-price">{new Intl.NumberFormat('fr-FR').format(product.price)} MGA</span>
                      </div>
                      <h3>{product.title}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="product-footer">
                        <span className="muted">Livraison instantanée</span>
                        <button className="primary-btn" onClick={() => handleBuy(product)}>
                          Acheter
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-banner">
              <div>
                <span className="eyebrow">Vendez vos talents</span>
                <h3>Monétisez vos ressources numériques</h3>
              </div>
              <a href="/seller" className="primary-btn">Publier un produit</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
