import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatGhs, statusLabel, statusColor } from "@/lib/utils";
import ClearCart from "@/components/ClearCart";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: { trackingCode: string };
}) {
  const order = await prisma.order.findUnique({
    where: { trackingCode: params.trackingCode },
    include: { items: true },
  });

  if (!order) notFound();

  const isPaid = !!order.paidAt;
  const paymentMethodLabel =
    order.paymentMethod === "MOMO"
      ? "Mobile Money"
      : order.paymentMethod === "CARD"
        ? "Card"
        : order.paymentMethod;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {isPaid && <ClearCart />}

      <div className="bg-white border border-brand-100 rounded-xl p-8 text-center">
        {isPaid ? (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 grid place-items-center text-emerald-600 text-2xl">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-brand-900 mt-4">Payment received!</h1>
            <p className="text-brand-900/70 mt-1">
              Thanks {order.customerName.split(" ")[0]} — the kitchen has your order.
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-yellow-100 grid place-items-center text-yellow-700 text-2xl">
              ⏳
            </div>
            <h1 className="text-2xl font-bold text-brand-900 mt-4">Awaiting payment</h1>
            <p className="text-brand-900/70 mt-1">
              We'll start cooking the moment we see your payment.
            </p>
          </>
        )}

        <div className="mt-5 inline-block px-4 py-2 bg-brand-100 rounded-md">
          <span className="text-xs uppercase tracking-wide text-brand-700">Tracking code</span>
          <div className="font-bold text-brand-900 text-lg">{order.trackingCode}</div>
        </div>
        <p className="text-sm text-brand-900/60 mt-3">
          Status:{" "}
          <span
            className={`inline-block px-2 py-0.5 rounded font-medium text-xs ${statusColor(order.status)}`}
          >
            {statusLabel(order.status)}
          </span>
        </p>
      </div>

      <div className="bg-white border border-brand-100 rounded-xl p-5 mt-5">
        <h2 className="font-semibold text-brand-900 mb-3">Order details</h2>
        <ul className="text-sm divide-y divide-brand-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 gap-3">
              <span className="min-w-0">
                {item.name}{" "}
                <span className="text-brand-700/70 text-xs">({item.variantLabel})</span>{" "}
                <span className="text-brand-700/60">× {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap">
                {formatGhs(item.priceGhs * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-sm pt-3 mt-2 border-t border-brand-100">
          <span>Subtotal</span>
          <span>{formatGhs(order.subtotalGhs)}</span>
        </div>
        {order.deliveryFeeGhs > 0 && (
          <div className="flex justify-between text-sm py-1">
            <span>Delivery</span>
            <span>{formatGhs(order.deliveryFeeGhs)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-brand-100 mt-2">
          <span>Total</span>
          <span>{formatGhs(order.totalGhs)}</span>
        </div>
        <div className="text-xs text-brand-700/70 mt-3">
          Paid via <strong>{paymentMethodLabel}</strong>
          {order.paidAt && (
            <> on {new Date(order.paidAt).toLocaleString("en-GH")}</>
          )}
        </div>
      </div>

      <div className="bg-white border border-brand-100 rounded-xl p-5 mt-5 text-sm">
        <h2 className="font-semibold text-brand-900 mb-2">Delivering to</h2>
        <p>{order.customerName}</p>
        <p>{order.customerPhone}</p>
        {order.customerEmail && (
          <p className="text-brand-700/70">{order.customerEmail}</p>
        )}
        <p className="text-brand-900/70">{order.deliveryAddress}</p>
        {order.notes && (
          <p className="mt-2 text-brand-700/70 italic">Note: {order.notes}</p>
        )}
      </div>

      <Link
        href="/"
        className="block mt-6 text-center bg-brand-500 text-white py-3 rounded-md font-semibold hover:bg-brand-600"
      >
        Order something else
      </Link>
    </div>
  );
}
