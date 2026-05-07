"use client";

import { useCart } from "@/lib/cart-store";
import { formatGhs } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutForm() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const search = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const failedRef = search.get("failed");
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="bg-white border border-brand-100 rounded-xl p-8 text-center">
        <p className="text-brand-900/70">Your cart is empty.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      customerName: String(formData.get("customerName") ?? "").trim(),
      customerPhone: String(formData.get("customerPhone") ?? "").trim(),
      customerEmail: String(formData.get("customerEmail") ?? "").trim(),
      deliveryAddress: String(formData.get("deliveryAddress") ?? "").trim(),
      paymentMethod: String(formData.get("paymentMethod") ?? "MOMO"),
      notes: String(formData.get("notes") ?? "").trim() || null,
      items: items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    };

    if (!payload.customerName || !payload.customerPhone || !payload.deliveryAddress) {
      setError("Please fill in your name, phone, and delivery address.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Could not place order.");
      }
      const data = await res.json();
      // Send the customer to Paystack (or, in demo mode, straight to confirmation).
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {failedRef && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-md p-3 text-sm">
          Your previous payment for <strong>{failedRef}</strong> was not
          completed. Please try again.
        </div>
      )}

      <div className="bg-white border border-brand-100 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-brand-900">Delivery details</h2>
        <Field name="customerName" label="Full name" placeholder="Ama Mensah" required />
        <Field name="customerPhone" label="Phone number" placeholder="0244 000 000" type="tel" required />
        <Field name="customerEmail" label="Email" placeholder="you@example.com" type="email" required />
        <Field name="deliveryAddress" label="Delivery address" placeholder="House #, street, area, landmark" required textarea />
        <Field name="notes" label="Notes for the kitchen (optional)" placeholder="No onions, please" textarea />
      </div>

      <div className="bg-white border border-brand-100 rounded-xl p-5">
        <h2 className="font-semibold text-brand-900 mb-1">Pay before delivery</h2>
        <p className="text-xs text-brand-900/60 mb-3">
          Choose how you'd like to pay. We confirm payment first, then start
          cooking — your order goes nowhere until then.
        </p>
        <div className="space-y-2">
          <Radio name="paymentMethod" value="MOMO" label="Mobile Money (MTN, Vodafone, AirtelTigo)" defaultChecked />
          <Radio name="paymentMethod" value="CARD" label="Debit / credit card" />
        </div>
      </div>

      <div className="bg-white border border-brand-100 rounded-xl p-5">
        <h2 className="font-semibold text-brand-900 mb-3">Order summary</h2>
        <ul className="text-sm divide-y divide-brand-100">
          {items.map((i) => (
            <li key={i.variantId} className="flex justify-between py-2 gap-3">
              <span className="min-w-0">
                {i.name}{" "}
                <span className="text-brand-700/60 text-xs">({i.variantLabel})</span>{" "}
                <span className="text-brand-700/60">× {i.quantity}</span>
              </span>
              <span className="whitespace-nowrap">{formatGhs(i.priceGhs * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-sm pt-3 mt-2 border-t border-brand-100">
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
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-500 text-white py-3 rounded-md font-semibold hover:bg-brand-600 disabled:opacity-50"
      >
        {submitting
          ? "Redirecting to payment…"
          : `Pay & place order · ${formatGhs(total)}`}
      </button>

      <p className="text-[11px] text-brand-900/50 text-center">
        Payment is held until the kitchen confirms your order. You will only be
        charged on a successful order.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  textarea = false,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-brand-900 mb-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={3}
          className="w-full rounded-md border border-brand-100 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-md border border-brand-100 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      )}
    </label>
  );
}

function Radio({
  name,
  value,
  label,
  defaultChecked = false,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="text-brand-500 focus:ring-brand-400"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
