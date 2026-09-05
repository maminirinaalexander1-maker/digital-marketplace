import './globals.css';
import type { Metadata } from 'next';
import ClientShell from '@/components/ClientShell';

export const metadata: Metadata = {
  title: 'Mada Digital Market',
  description: 'Marketplace de produits numériques en Ariary MGA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
