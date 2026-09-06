'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-shell state-page">
      <div className="state-card">
        <span className="eyebrow">Un petit contretemps</span>
        <h1>Cette page n’a pas pu se charger.</h1>
        <p className="muted">Réessayez maintenant ou revenez au catalogue.</p>
        <div className="dashboard-actions">
          <button className="primary-btn" type="button" onClick={() => reset()}>Réessayer</button>
          <Link className="secondary-btn" href="/">Retour au catalogue</Link>
        </div>
      </div>
    </main>
  );
}
