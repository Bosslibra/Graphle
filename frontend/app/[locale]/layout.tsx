import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/switches/theme-provider";
import { SiteSkinProvider } from "@/contexts/site-skin-context";
import SiteHeader from "@/components/layout/site-header";
import { Fraunces, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import GraphBackground from "@/components/layout/graph-background";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home-page" });
  const description = t("game-subtitle");

  return {
    // Set NEXT_PUBLIC_SITE_URL in production so share/OG links are absolute.
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
    title: { default: "Graphle", template: "%s · Graphle" },
    description,
    applicationName: "Graphle",
    openGraph: { title: "Graphle", description, siteName: "Graphle", type: "website", locale },
    twitter: { card: "summary", title: "Graphle", description },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        spaceGrotesk.variable,
        fraunces.variable,
        jetbrainsMono.variable,
        "font-sans",
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SiteSkinProvider>
              <TooltipProvider>
                {/* Site-wide graph background */}
                <GraphBackground />
                
                <SiteHeader />
                <main className="relative z-10 flex flex-1 flex-col">{children}</main>
              </TooltipProvider>
            </SiteSkinProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}