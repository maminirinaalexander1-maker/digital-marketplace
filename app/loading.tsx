export default function Loading() {
  return (
    <main className="page-shell state-page">
      <div className="state-card" role="status" aria-live="polite">
        <span className="loading-orbit" aria-hidden="true" />
        <span className="eyebrow">Mada Digital Market</span>
        <h1>Préparation de votre espace</h1>
        <p className="muted">Quelques secondes, le catalogue arrive.</p>
      </div>
    </main>
  );
}
