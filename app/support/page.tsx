import Link from 'next/link';

const topics = [
  ['Paiement', 'Une question sur MVola, Orange Money ou votre commande ?'],
  ['Téléchargement', 'Un lien expiré ou un fichier qui ne s’ouvre pas ?'],
  ['Vente', 'Besoin d’aide pour publier et présenter votre produit ?'],
];

export default function SupportPage() {
  return (
    <main className="page-shell content-page">
      <div className="content-hero">
        <span className="eyebrow">Centre d’aide</span>
        <h1>On vous aide à avancer.</h1>
        <p className="muted">Trouvez rapidement le bon point de contact pour votre achat ou votre publication.</p>
      </div>
      <div className="support-grid">
        {topics.map(([title, description]) => (
          <article className="feature-card" key={title}>
            <span className="feature-icon">{title === 'Paiement' ? '₍₎' : title === 'Vente' ? '+' : '↓'}</span>
            <h2>{title}</h2>
            <p>{description}</p>
            <a className="text-link" href="mailto:support@madadigital.com">Écrire au support →</a>
          </article>
        ))}
      </div>
      <div className="content-note">
        <strong>Support e-mail</strong>
        <p className="muted">support@madadigital.com · Réponse habituelle sous 24 à 48 heures.</p>
        <Link href="/" className="secondary-btn">Retour au catalogue</Link>
      </div>
    </main>
  );
}
