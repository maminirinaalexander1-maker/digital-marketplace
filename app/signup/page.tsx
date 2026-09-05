'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithRole, registerAccount, saveSession, type UserRole } from '@/lib/auth';

const roles: { label: string; value: UserRole }[] = [
  { label: 'Acheteur', value: 'buyer' },
  { label: 'Vendeur', value: 'seller' },
];

export default function SignupPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const newUser = await registerAccount({
      name,
      email,
      password,
      role: selectedRole,
    });

    if (!newUser) {
      setError('Compte invalide ou déjà existant. Vérifiez les informations et choisissez un rôle.');
      return;
    }

    const sessionUser = await loginWithRole(email, password, selectedRole);
    if (!sessionUser) {
      setError('Création du compte réussie mais connexion impossible. Veuillez réessayer.');
      return;
    }

    saveSession(sessionUser);
    setSuccess('Compte créé avec succès. Redirection...');

    setTimeout(() => {
      router.push(selectedRole === 'seller' ? '/seller' : selectedRole === 'admin' ? '/admin' : '/dashboard');
    }, 500);
  }

  return (
    <main className="page-shell">
      <div className="form-shell" style={{ maxWidth: 620 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="eyebrow">Inscription</span>
          <h2 style={{ margin: '0.8rem 0 0' }}>Créer un compte</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-wide" style={{ marginBottom: '1rem' }}>
            <label>Rôle</label>
            <div className="role-switcher">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={selectedRole === role.value ? 'chip active' : 'chip'}
                  onClick={() => setSelectedRole(role.value)}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field" style={{ marginBottom: '1rem' }}>
            <label htmlFor="name">Nom complet</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Rakoto"
            />
          </div>

          <div className="field" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean@example.com"
            />
          </div>

          <div className="field" style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
            />
          </div>

          {error ? <p className="muted" style={{ marginBottom: '1rem' }}>{error}</p> : null}
          {success ? <p className="muted" style={{ marginBottom: '1rem', color: '#8fe7be' }}>{success}</p> : null}

          <div className="form-actions" style={{ justifyContent: 'space-between' }}>
            <a href="/login" className="secondary-btn">Retour</a>
            <button type="submit" className="submit-btn">Créer le compte</button>
          </div>
        </form>
      </div>
    </main>
  );
}
