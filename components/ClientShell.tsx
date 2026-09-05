'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getSession, logout, type SessionUser } from '@/lib/auth';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => getSession());

  return (
    <>
      <header className="header">
        <div className="container navbar">
          <Link href="/" className="brand">
            <span className="brand-mark">M</span>
            <span>Mada Digital Market</span>
          </Link>
          <nav className="nav-links">
            <Link href="/">Catalogue</Link>
            <Link href="/seller">Vendre</Link>
            <Link href="/admin">Admin</Link>
            {user ? (
              <div className="user-menu">
                <Link href="/dashboard" className="user-badge">{user.role.toUpperCase()}</Link>
                <button
                  className="secondary-btn"
                  onClick={async () => {
                    await logout();
                    setUser(null);
                  }}
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="user-menu">
                <Link href="/login" className="secondary-btn">Connexion</Link>
                <Link href="/signup" className="primary-btn">Créer un compte</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
