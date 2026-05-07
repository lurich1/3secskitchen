"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { useEffect, useState } from "react";

export default function Header() {
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="bg-white border-b-2 border-brand-500 sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-16 sm:h-20 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Image
            src="/logo.png"
            alt="3sec Kitchen"
            width={64}
            height={64}
            className="h-10 sm:h-12 md:h-14 w-auto flex-shrink-0"
            priority
          />
          <div className="hidden md:block">
            <div className="text-[11px] text-brand-700 font-medium tracking-wide">
              Fast · Fresh · Flavorful — Always
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium flex-shrink-0">
          <Link
            href="/"
            className="text-brand-900 hover:text-brand-500 transition"
          >
            Menu
          </Link>
          <Link
            href="/cart"
            className="relative text-brand-900 hover:text-brand-500 transition"
          >
            Cart
            {mounted && count > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent-500 text-brand-900 text-[11px] font-bold rounded-full h-5 min-w-5 px-1 grid place-items-center">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/manager/dashboard"
            className="text-brand-700 hover:text-brand-500 transition"
          >
            Manager
          </Link>
        </nav>
      </div>
    </header>
  );
}
