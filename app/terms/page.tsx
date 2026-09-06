import Link from 'next/link';

export const metadata = { title: 'Conditions · Mada Digital Market' };

export default function TermsPage() {
  return (
    <main className="page-shell content-page legal-page">
      <span className="eyebrow">Cadre d’utilisation</span>
      <h1>Conditions d’utilisation</h1>
      <p className="muted">Dernière mise à jour : 6 septembre 2026</p>
      <section><h2>Achats numériques</h2><p>Chaque produit est décrit par son vendeur. Après confirmation du paiement, le lien de téléchargement peut être disponible pour une durée limitée.</p></section>
      <section><h2>Vendeurs</h2><p>Les vendeurs doivent publier des ressources dont ils détiennent les droits et fournir des informations exactes sur leur contenu.</p></section>
      <section><h2>Utilisation responsable</h2><p>Il est interdit de revendre, partager ou distribuer un fichier acheté sans l’autorisation de son créateur.</p></section>
      <Link href="/" className="secondary-btn">Retour au catalogue</Link>
    </main>
  );
}
