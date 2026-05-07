import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction, isPaystackEnabled } from "@/lib/paystack";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference =
    url.searchParams.get("reference") ?? url.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const order = await prisma.order.findFirst({
    where: { paymentReference: reference },
  });
  if (!order) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Already paid? Just send them to confirmation.
  if (order.paidAt) {
    return NextResponse.redirect(
      new URL(`/confirmation/${order.trackingCode}`, req.url)
    );
  }

  if (!isPaystackEnabled()) {
    // No keys configured — shouldn't happen, but fail gracefully.
    return NextResponse.redirect(
      new URL(`/confirmation/${order.trackingCode}`, req.url)
    );
  }

  try {
    const result = await verifyTransaction(reference);
    const expectedPesewas = Math.round(order.totalGhs * 100);

    if (result.paid && result.amountInPesewas === expectedPesewas) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "RECEIVED", paidAt: new Date() },
      });
      return NextResponse.redirect(
        new URL(`/confirmation/${order.trackingCode}`, req.url)
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAYMENT_FAILED" },
    });
    const failed = new URL("/checkout", req.url);
    failed.searchParams.set("failed", order.trackingCode);
    return NextResponse.redirect(failed);
  } catch {
    const failed = new URL("/checkout", req.url);
    failed.searchParams.set("failed", order.trackingCode);
    return NextResponse.redirect(failed);
  }
}
