'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';

type Order = {
  title: string;
  status: 'pending' | 'paid' | 'failed';
  downloadUrl: string | null;
};

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const accessToken = searchParams.get('token');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId || !accessToken) return;

    fetch(`/api/orders/${encodeURIComponent(orderId)}?token=${encodeURIComponent(accessToken)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Commande introuvable.');
        setOrder(data.order);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Erreur de commande.');
      });
  }, [accessToken, orderId]);

  const displayedError = error || (!orderId || !accessToken ? 'Lien de commande incomplet.' : '');

  return (
    <main className="page-shell">
      <div className="success-box">
        <span className="eyebrow">Commande</span>
        <h1>{order?.status === 'paid' ? 'Paiement confirmé' : 'Paiement en attente'}</h1>
        <p>
          {order?.status === 'paid'
            ? 'Votre paiement est confirmé. Le téléchargement est disponible pendant 10 minutes.'
            : 'Votre commande est enregistrée. Le téléchargement sera disponible après confirmation du paiement.'}
        </p>

        <div className="download-card">
          <strong>{order?.title || 'Vérification de votre commande...'}</strong>
          {order?.downloadUrl ? (
            <p style={{ marginBottom: 0 }}>
              <a className="primary-btn" href={order.downloadUrl} target="_blank" rel="noreferrer">
                Télécharger le fichier
              </a>
            </p>
          ) : displayedError ? (
            <p className="muted">{displayedError}</p>
          ) : (
            <p className="muted">Téléchargement indisponible pour le moment.</p>
          )}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/" className="secondary-btn">Retour au catalogue</Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<main className="page-shell"><div className="success-box">Chargement de la commande...</div></main>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
