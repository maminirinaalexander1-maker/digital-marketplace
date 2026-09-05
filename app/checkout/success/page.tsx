import Link from 'next/link';

type SearchParams = {
  download?: string;
  title?: string;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const download = params.download || '';
  const title = params.title || 'Votre achat';

  return (
    <main className="page-shell">
      <div className="success-box">
        <span className="eyebrow">Paiement validé</span>
        <h1>Merci pour votre achat !</h1>
        <p>
          Votre commande a été enregistrée avec succès. Vous pouvez télécharger le fichier dès maintenant.
        </p>

        <div className="download-card">
          <strong>{title}</strong>
          {download ? (
            <p style={{ marginBottom: 0 }}>
              <a className="primary-btn" href={download} target="_blank" rel="noreferrer">
                Télécharger le fichier
              </a>
            </p>
          ) : (
            <p className="muted">Le lien de téléchargement n’est pas disponible pour le moment.</p>
          )}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/" className="secondary-btn">Retour au catalogue</Link>
        </div>
      </div>
    </main>
  );
}
