import Link from 'next/link';

export const metadata = { title: 'Confidentialité · Mada Digital Market' };

export default function PrivacyPage() {
  return (
    <main className="page-shell content-page legal-page">
      <span className="eyebrow">Transparence</span>
      <h1>Politique de confidentialité</h1>
      <p className="muted">Dernière mise à jour : 6 septembre 2026</p>
      <section><h2>Les données utilisées</h2><p>Nous utilisons votre nom et votre adresse e-mail pour créer votre compte, traiter une commande et vous permettre d’accéder à vos achats.</p></section>
      <section><h2>Paiements</h2><p>Les paiements sont traités par notre prestataire de paiement. Nous ne stockons pas vos informations bancaires.</p></section>
      <section><h2>Vos droits</h2><p>Vous pouvez demander la correction ou la suppression de vos données en écrivant à support@madadigital.com.</p></section>
      <Link href="/" className="secondary-btn">Retour au catalogue</Link>
    </main>
  );
}
