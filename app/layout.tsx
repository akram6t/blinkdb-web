import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "BlinkDB — io_uring-native, Redis-compatible in-memory database",
    template: "%s | BlinkDB",
  },
  description: SITE.description,
  applicationName: "BlinkDB",
  keywords: [
    "BlinkDB", "in-memory database", "Redis alternative", "DragonflyDB alternative", "io_uring database",
    "Rust database", "RESP3", "key-value store", "database benchmark", "memtier_benchmark",
  ],
  authors: [{ name: "Akram", url: "https://github.com/akram6t" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: "BlinkDB",
    title: "BlinkDB — in-memory database at the speed of a blink",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "BlinkDB — in-memory database at the speed of a blink",
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#06070b",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BlinkDB",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Linux",
  description: SITE.description,
  url: SITE.url,
  codeRepository: SITE.github,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
