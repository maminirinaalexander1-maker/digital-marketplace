'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (!supabase) {
      setError('Supabase n’est pas configuré.');
      return;
    }

    setIsSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword('');
    setConfirmation('');
    setStatus('Mot de passe mis à jour. Vous pouvez maintenant vous connecter.');
  }

  return (
    <main className="page-shell">
      <div className="form-shell auth-shell">
        <span className="eyebrow">Nouveau mot de passe</span>
        <h1>Reprenez le contrôle.</h1>
        <p className="muted">Choisissez un mot de passe unique pour sécuriser votre compte.</p>
        <form onSubmit={handleSubmit}>
          <div className="field-wide"><label htmlFor="new-password">Nouveau mot de passe</label><input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          <div className="field-wide"><label htmlFor="confirm-password">Confirmer le mot de passe</label><input id="confirm-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div>
          {error ? <p className="form-message form-message-error">{error}</p> : null}
          {status ? <p className="form-message form-message-success">{status}</p> : null}
          <div className="form-actions"><Link href="/login" className="secondary-btn">Connexion</Link><button className="submit-btn" type="submit" disabled={isSaving}>{isSaving ? 'Mise à jour...' : 'Enregistrer'}</button></div>
        </form>
      </div>
    </main>
  );
}
