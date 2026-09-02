import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Hemanth Ice Creams • Haute Glacerie & Reserve Collection',
  description:
    'Experience artisanal 3D luxury ice cream formulations. Churned with 100% Jersey cream, single-origin cocoa, Kashmiri saffron, and Madagascar bourbon vanilla.',
  keywords: ['Luxury Ice Cream', 'Artisanal Ice Cream', 'Hemanth Ice Creams', '3D Ice Cream Customizer'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-obsidian-950 text-zinc-100 antialiased selection:bg-gold-500 selection:text-obsidian-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
