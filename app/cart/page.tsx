"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatGhs } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-900 mb-6">Your cart</h1>

      {items.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-xl p-10 text-center">
          <p className="text-brand-900/70">Your cart is empty.</p>
          <Link
            href="/"
            className="inline-block mt-4 bg-brand-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-600"
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="bg-white border border-brand-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className="flex gap-3 sm:gap-4 items-center flex-1 min-w-0">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-cover bg-center bg-brand-100 flex-shrink-0"
                  style={{ backgroundImage: `url('${item.imageUrl}')` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-brand-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-brand-700/80 mt-0.5">
                    <span className="inline-block bg-accent-100 text-brand-900 px-1.5 py-0.5 rounded font-semibold">
                      {item.variantLabel}
                    </span>{" "}
                    · {formatGhs(item.priceGhs)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(item.variantId, item.quantity - 1)}
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-md border border-brand-100 hover:bg-brand-50 text-lg sm:text-base"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="w-7 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => setQty(item.variantId, item.quantity + 1)}
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-md border border-brand-100 hover:bg-brand-50 text-lg sm:text-base"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => remove(item.variantId)}
                  className="text-rose-500 text-sm hover:underline whitespace-nowrap"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="bg-white border border-brand-100 rounded-xl p-5">
            <div className="flex justify-between text-sm py-1">
              <span>Subtotal</span>
              <span>{formatGhs(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm py-1">
                <span>Delivery</span>
                <span>{formatGhs(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-brand-100 mt-2">
              <span>Total</span>
              <span>{formatGhs(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="block mt-4 text-center bg-brand-500 text-white py-3 rounded-md font-semibold hover:bg-brand-600"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
