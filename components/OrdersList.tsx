"use client";

import { useEffect, useState } from "react";
import {
  formatGhs,
  KITCHEN_STATUSES,
  statusColor,
  statusLabel,
  type OrderStatus,
} from "@/lib/utils";

type OrderItem = {
  id: string;
  name: string;
  variantLabel: string;
  priceGhs: number;
  quantity: number;
};

type Order = {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deliveryAddress: string;
  paymentMethod: string;
  notes: string | null;
  subtotalGhs: number;
  deliveryFeeGhs: number;
  totalGhs: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  items: OrderItem[];
};

type Filter = "ALL" | "RECEIVED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "UNPAID";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All paid" },
  { key: "RECEIVED", label: "New" },
  { key: "PREPARING", label: "Preparing" },
  { key: "OUT_FOR_DELIVERY", label: "Out" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "UNPAID", label: "Unpaid" },
];

export default function OrdersList({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch {}
    }, 15000);
    return () => clearInterval(t);
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    const prev = orders;
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setOrders(prev);
      alert("Could not update order. Please try again.");
    }
  }

  const filtered = orders.filter((o) => {
    if (filter === "UNPAID") {
      return o.status === "PENDING_PAYMENT" || o.status === "PAYMENT_FAILED";
    }
    // Hide unpaid orders from "paid" filters by default.
    if (o.status === "PENDING_PAYMENT" || o.status === "PAYMENT_FAILED") {
      return false;
    }
    if (filter === "ALL") return true;
    return o.status === filter;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              filter === f.key
                ? "bg-brand-500 text-white"
                : "bg-white border border-brand-100 text-brand-900 hover:bg-brand-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-xl p-10 text-center text-brand-900/60">
          No orders here.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const time = new Date(o.createdAt).toLocaleString("en-GH", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
            });
            const isOpen = openId === o.id;
            const isPaid = !!o.paidAt;
            return (
              <div
                key={o.id}
                className="bg-white border border-brand-100 rounded-xl overflow-hidden"
              >
                <button
                  className="w-full p-4 flex items-center gap-4 text-left"
                  onClick={() => setOpenId(isOpen ? null : o.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-brand-900">{o.trackingCode}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${statusColor(o.status)}`}
                      >
                        {statusLabel(o.status)}
                      </span>
                      {isPaid ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          PAID
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                          UNPAID
                        </span>
                      )}
                      <span className="text-xs text-brand-900/50">{time}</span>
                    </div>
                    <div className="text-sm text-brand-900/70 mt-0.5 truncate">
                      {o.customerName} · {o.customerPhone} · {formatGhs(o.totalGhs)} ·{" "}
                      {o.items.reduce((s, i) => s + i.quantity, 0)} items
                    </div>
                  </div>
                  <span className="text-brand-700">{isOpen ? "▴" : "▾"}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-brand-100 pt-4 space-y-4">
                    <div>
                      <h4 className="text-xs uppercase tracking-wide text-brand-700 mb-1">
                        Items
                      </h4>
                      <ul className="text-sm divide-y divide-brand-100">
                        {o.items.map((it) => (
                          <li key={it.id} className="flex justify-between py-1.5 gap-3">
                            <span className="min-w-0">
                              {it.name}{" "}
                              <span className="inline-block bg-accent-100 text-brand-900 text-[10px] px-1.5 py-0.5 rounded font-semibold ml-1">
                                {it.variantLabel}
                              </span>{" "}
                              <span className="text-brand-700/60">× {it.quantity}</span>
                            </span>
                            <span className="whitespace-nowrap">
                              {formatGhs(it.priceGhs * it.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between text-sm pt-2 mt-1 border-t border-brand-100">
                        <span>Subtotal</span>
                        <span>{formatGhs(o.subtotalGhs)}</span>
                      </div>
                      {o.deliveryFeeGhs > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Delivery</span>
                          <span>{formatGhs(o.deliveryFeeGhs)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-1 mt-1 border-t border-brand-100">
                        <span>Total</span>
                        <span>{formatGhs(o.totalGhs)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="text-xs uppercase tracking-wide text-brand-700 mb-1">
                          Delivery
                        </h4>
                        <p>{o.customerName}</p>
                        <p>
                          <a
                            href={`tel:${o.customerPhone}`}
                            className="text-brand-700 underline"
                          >
                            {o.customerPhone}
                          </a>
                        </p>
                        {o.customerEmail && (
                          <p className="text-brand-700/70 text-xs">{o.customerEmail}</p>
                        )}
                        <p className="text-brand-900/70">{o.deliveryAddress}</p>
                        {o.notes && (
                          <p className="mt-1 italic text-brand-700/80">
                            Note: {o.notes}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-wide text-brand-700 mb-1">
                          Payment
                        </h4>
                        <p>
                          {o.paymentMethod === "MOMO"
                            ? "Mobile Money"
                            : o.paymentMethod === "CARD"
                              ? "Card"
                              : o.paymentMethod}
                        </p>
                        {isPaid ? (
                          <p className="text-emerald-700 text-xs mt-1">
                            ✓ Paid {new Date(o.paidAt!).toLocaleString("en-GH")}
                          </p>
                        ) : (
                          <p className="text-rose-700 text-xs mt-1">
                            Payment not confirmed
                          </p>
                        )}
                      </div>
                    </div>

                    {isPaid && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wide text-brand-700 mb-2">
                          Update kitchen status
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {KITCHEN_STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(o.id, s)}
                              disabled={o.status === s}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                                o.status === s
                                  ? `${statusColor(s)} ring-2 ring-brand-400 cursor-default`
                                  : "bg-white border border-brand-100 hover:bg-brand-50"
                              }`}
                            >
                              {statusLabel(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
