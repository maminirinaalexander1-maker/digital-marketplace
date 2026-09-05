'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { loginWithRole, saveSession, type UserRole } from '@/lib/auth';

const roles: { label: string; value: UserRole }[] = [
  { label: 'Acheteur', value: 'buyer' },
  { label: 'Vendeur', value: 'seller' },
  { label: 'Admin', value: 'admin' },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [email, setEmail] = useState('buyer@madadigital.com');
  const [password, setPassword] = useState('buyer123');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = await loginWithRole(email, password, selectedRole);

    if (!user) {
      setError('Identifiants invalides pour ce rôle.');
      return;
    }

    saveSession(user);
    router.push(selectedRole === 'seller' ? '/seller' : selectedRole === 'admin' ? '/admin' : '/dashboard');
  }

  return (
    <main className="page-shell">
      <div className="form-shell" style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="eyebrow">Connexion</span>
          <h2 style={{ margin: '0.8rem 0 0' }}>Accéder à votre espace</h2>
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
          </div>

          <div className="field" style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="muted" style={{ marginBottom: '1rem' }}>{error}</p> : null}

          <div className="form-actions" style={{ justifyContent: 'space-between' }}>
            <Link href="/" className="secondary-btn">Retour</Link>
            <button type="submit" className="submit-btn">Se connecter</button>
          </div>

          <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
            Pas de compte ? <a href="/signup" style={{ color: '#8fe7be', fontWeight: 700 }}>Créer un compte</a>
          </p>
        </form>
      </div>
    </main>
  );
}
