import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/lib/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BrskoistAI — UGC Video Generator",
  description: "Ürün görselinizi 12 saniyelik viral UGC videosuna dönüştürün. Sora 2 ve yapay zeka ile.",
  metadataBase: new URL("https://brskoistai.com"),
  openGraph: {
    title: "BrskoistAI — UGC Video Generator",
    description: "Ürün görselinizi 12 saniyelik viral UGC videosuna dönüştürün.",
    url: "https://brskoistai.com",
    siteName: "BrskoistAI",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
