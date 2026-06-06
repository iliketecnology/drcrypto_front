import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalPage } from '@/components/sections/LegalPage';
import { getLegalDoc } from '@/lib/legal-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = getLegalDoc(locale, 'privacy');
  return {
    title: `${doc.title} · Dr. Crypto Pay`,
    description: doc.intro,
  };
}

export default async function PrivacidadePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const doc = getLegalDoc(locale, 'privacy');
  return <LegalPage doc={doc} />;
}
