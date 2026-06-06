import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@/styles/globals.css';

// Metadata textual (title/description/OG/Twitter) é localizada por idioma no
// generateMetadata de app/[locale]/layout.tsx. Aqui fica só o que é global.
// Domínio que serve o site, base pras URLs absolutas de OG/Twitter. Usa o
// domínio de produção da Vercel quando disponível (corrige sozinho quando um
// domínio próprio for ligado), com fallback pro .vercel.app atual. Pode ser
// sobrescrito por NEXT_PUBLIC_SITE_URL.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://dr-crypto-pay.vercel.app');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Sem `template`: cada página (home localizada + legais) já entrega o title
  // completo com o sufixo da marca, então o template duplicaria "Dr. Crypto Pay".
  title: 'Dr. Crypto Pay',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
