"use client";

import { useCart } from "@/lib/cart-store";
import { formatGhs } from "@/lib/utils";
import { useState } from "react";

type Variant = {
  id: string;
  label: string;
  priceGhs: number;
  position: number;
};

type Props = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  minPriceGhs: number;
  maxPriceGhs: number;
  variants: Variant[];
};

export default function PizzaCard({
  id,
  name,
  description,
  imageUrl,
  minPriceGhs,
  maxPriceGhs,
  variants,
}: Props) {
  const sorted = [...variants].sort((a, b) => a.position - b.position);
  const add = useCart((s) => s.add);
  const [selectedId, setSelectedId] = useState(sorted[0]?.id ?? "");
  const [added, setAdded] = useState(false);

  const selected = sorted.find((v) => v.id === selectedId) ?? sorted[0];
  const hasMultiple = sorted.length > 1;

  function handleAdd() {
    if (!selected) return;
    add({
      productId: id,
      variantId: selected.id,
      variantLabel: selected.label,
      name,
      priceGhs: selected.priceGhs,
      imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const priceRangeLabel = hasMultiple
    ? `${formatGhs(minPriceGhs)} – ${formatGhs(maxPriceGhs)}`
    : formatGhs(minPriceGhs);

  return (
    <article className="bg-white rounded-xl overflow-hidden border border-brand-100 shadow-sm hover:shadow-md hover:border-brand-200 transition flex flex-col">
      <div
        className="aspect-[4/3] bg-brand-100 bg-center bg-cover"
        style={{ backgroundImage: `url('${imageUrl}')` }}
        aria-label={name}
      />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-brand-900 leading-tight">{name}</h3>
        <p className="text-sm text-brand-900/60 mt-1 flex-1">{description}</p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-extrabold text-brand-700 text-sm whitespace-nowrap">
            {hasMultiple && (
              <span className="text-[10px] font-medium text-brand-700/60 uppercase tracking-wider mr-1">
                from
              </span>
            )}
            {priceRangeLabel}
          </span>
        </div>

        {hasMultiple && (
          <div className="mt-3">
            <label className="block text-[11px] uppercase tracking-wider text-brand-700/70 font-semibold mb-1">
              Portion
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {sorted.map((v) => {
                const active = v.id === selectedId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedId(v.id)}
                    className={`px-2 py-1.5 rounded-md text-xs font-semibold border transition ${
                      active
                        ? "bg-brand-500 border-brand-500 text-white"
                        : "bg-white border-brand-200 text-brand-900 hover:border-brand-400"
                    }`}
                  >
                    <div className="leading-tight">{v.label}</div>
                    <div
                      className={`text-[10px] font-bold mt-0.5 ${
                        active ? "text-accent-300" : "text-brand-700"
                      }`}
                    >
                      {formatGhs(v.priceGhs)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          className={`mt-3 w-full py-2 rounded-md text-sm font-bold transition shadow-sm ${
            added
              ? "bg-emerald-500 text-white"
              : "bg-brand-500 text-white hover:bg-brand-600"
          }`}
        >
          {added
            ? "Added ✓"
            : `Add ${selected ? formatGhs(selected.priceGhs) : ""}`.trim()}
        </button>
      </div>
    </article>
  );
}
