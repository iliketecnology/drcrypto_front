import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { TrustMetrics } from '@/components/sections/TrustMetrics';
import { Differentials } from '@/components/sections/Differentials';
import { SupportedNetworks } from '@/components/sections/SupportedNetworks';
import { About } from '@/components/sections/About';
import { FAQ } from '@/components/sections/FAQ';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <HowItWorks />
      <TrustMetrics />
      <Differentials />
      <SupportedNetworks />
      <About />
      <FAQ />
    </>
  );
}
