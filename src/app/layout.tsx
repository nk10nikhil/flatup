import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/ui/header";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlatUp - Find Your Perfect Home",
  description: "The premier platform for flat listings and rentals. Connect with property owners, brokers, and room sharers.",
  keywords: "flat rental, property listing, room sharing, real estate, accommodation",
  authors: [{ name: "FlatUp Team" }],
  openGraph: {
    title: "FlatUp - Find Your Perfect Home",
    description: "The premier platform for flat listings and rentals",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
