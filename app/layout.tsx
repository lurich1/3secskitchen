import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "3sec Kitchen — Fast, Fresh, Flavorful",
  description:
    "Order rice, fries, salads, sandwiches and pasta from 3sec Kitchen. Fast delivery across Accra.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-brand-700 text-white py-8 text-center text-sm">
          <div className="max-w-5xl mx-auto px-4">
            <p className="font-semibold">3sec Kitchen · Accra, Ghana</p>
            <p className="mt-1 text-accent-100/90">Fast, Fresh, Flavorful — Always.</p>
            <p className="mt-3 text-white/60">
              Call / WhatsApp <span className="font-medium text-accent-400">0536 991 464</span>
            </p>
            <p className="mt-3 text-white/40 text-xs">
              © {new Date().getFullYear()} 3sec Kitchen
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
