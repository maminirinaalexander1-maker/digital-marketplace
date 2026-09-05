'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, isAllowedRole, type SessionUser } from '@/lib/auth';
import { getSupabaseAccessToken, uploadProductFile } from '@/lib/supabase';

export default function SellerPage() {
  const router = useRouter();
  const [user] = useState<SessionUser | null>(() => getSession());
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('15000');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!isAllowedRole(user, ['seller', 'admin'])) {
      router.replace('/login');
    }
  }, [router, user]);

  async function rewriteDescription() {
    if (!title.trim() && !description.trim()) {
      setStatus('Ajoutez un titre ou une description pour générer une version commerciale.');
      return;
    }

    setIsRewriting(true);
    setStatus('Réécriture de la description en cours...');

    try {
      const response = await fetch('/api/rewrite-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de réécrire la description.');
      }

      setDescription(data.description || description);
      setStatus('Description optimisée avec succès.');
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      setIsRewriting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !file) {
      setStatus('Titre, description et fichier sont requis.');
      return;
    }

    setIsSaving(true);
    setStatus('Envoi du fichier et enregistrement du produit...');

    try {
      const accessToken = await getSupabaseAccessToken();
      if (!accessToken) {
        throw new Error('Session Supabase absente ou expirée. Reconnectez-vous.');
      }

      const fileUrl = await uploadProductFile(file, accessToken);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          price: Number(price),
          description,
          file_url: fileUrl,
          image_url: file.name.split('.')[0].slice(0, 12) || '📦',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossible d’ajouter le produit.');
      }

      setStatus('Produit ajouté avec succès.');
      setTitle('');
      setPrice('15000');
      setDescription('');
      setFile(null);
      const fileInput = document.getElementById('product-file') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return null;

  return (
    <main className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Vendeur</span>
          <h2 style={{ marginTop: '0.8rem' }}>Publier un produit numérique</h2>
        </div>
        <Link href="/" className="secondary-btn">Retour au catalogue</Link>
      </div>

      <form className="form-shell" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="title">Titre du produit</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Pack templates Canva" />
          </div>

          <div className="field">
            <label htmlFor="price">Prix MGA</label>
            <input id="price" type="number" min="0" step="100" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div className="field-wide">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le produit, ce qu’il contient et les bénéfices pour l’acheteur." />
          </div>

          <div className="field-wide">
            <label htmlFor="product-file">Fichier du produit</label>
            <input id="product-file" className="file-input" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={rewriteDescription} disabled={isRewriting}>
            {isRewriting ? 'Réécriture...' : 'Optimiser avec IA'}
          </button>
          <button className="submit-btn" type="submit" disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : 'Publier le produit'}
          </button>
        </div>

        {status ? <p className="muted" style={{ marginTop: '1rem' }}>{status}</p> : null}
      </form>
    </main>
  );
}
