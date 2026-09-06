'use client';

import Link from 'next/link';
import { useState } from 'react';
import { requestPasswordReset } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!email.includes('@')) {
      setError('Entrez une adresse e-mail valide.');
      return;
    }

    setIsSending(true);
    const sent = await requestPasswordReset(email);
    setIsSending(false);

    if (!sent) {
      setError('Impossible d’envoyer l’e-mail. Vérifiez la configuration Supabase.');
      return;
    }

    setStatus('Si ce compte existe, un lien de réinitialisation vient d’être envoyé.');
  }

  return (
    <main className="page-shell">
      <div className="form-shell auth-shell">
        <span className="eyebrow">Accès au compte</span>
        <h1>Réinitialiser votre mot de passe.</h1>
        <p className="muted">Nous vous enverrons un lien sécurisé pour choisir un nouveau mot de passe.</p>
        <form onSubmit={handleSubmit}>
          <div className="field-wide">
            <label htmlFor="reset-email">Adresse e-mail</label>
            <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" required />
          </div>
          {error ? <p className="form-message form-message-error">{error}</p> : null}
          {status ? <p className="form-message form-message-success">{status}</p> : null}
          <div className="form-actions">
            <Link href="/login" className="secondary-btn">Retour à la connexion</Link>
            <button className="submit-btn" type="submit" disabled={isSending}>{isSending ? 'Envoi...' : 'Recevoir le lien'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
