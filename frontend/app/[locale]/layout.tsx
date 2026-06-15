import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/switches/theme-provider";
import { SiteSkinProvider } from "@/contexts/site-skin-context";
import { ControlsDrawer } from "@/components/layout/controls-drawer";
import { Fraunces, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { setRequestLocale } from "next-intl/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import GraphBackground from "@/components/layout/graph-background";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Graphle",
  description: "Daily puzzle game about graph theory",
};

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
      <body className="min-h-full flex flex-col">
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
                
                {/* Single entry point for all UI controls */}
                <div className="fixed left-4 top-4 sm:left-6 sm:top-6 z-50">
                  <ControlsDrawer />
                </div>

                {children}
              </TooltipProvider>
            </SiteSkinProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}