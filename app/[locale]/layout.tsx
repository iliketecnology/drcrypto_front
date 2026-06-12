import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { SwapWizardProvider } from "@/components/wizard/SwapWizardProvider";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// SEO localizado · cada idioma com seu title/description e alt das imagens OG.
const OG_LOCALE: Record<string, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_ES",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  const ogAlt = t("ogAlt");

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "OprPay",
      locale: OG_LOCALE[locale] ?? "pt_BR",
      title,
      description,
      images: [
        {
          url: "/og-wide_new.jpg",
          width: 1200,
          height: 630,
          alt: ogAlt,
          type: "image/jpeg",
        },
        {
          url: "/og-square_new.jpg",
          width: 1200,
          height: 1200,
          alt: ogAlt,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-wide.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SwapWizardProvider>
        <Header />
        <main>{children}</main>
        <Footer />
      </SwapWizardProvider>
    </NextIntlClientProvider>
  );
}
