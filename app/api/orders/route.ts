import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTrackingCode } from "@/lib/utils";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { initializeTransaction, isPaystackEnabled } from "@/lib/paystack";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Delivery fee currently disabled — set to a number > 0 to re-enable.
const DELIVERY_FEE = 0;

type IncomingItem = { variantId: string; quantity: number };

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    paymentMethod,
    notes,
    items,
  } = body ?? {};

  if (
    typeof customerName !== "string" ||
    typeof customerPhone !== "string" ||
    typeof deliveryAddress !== "string" ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const emailValue =
    typeof customerEmail === "string" && customerEmail.trim()
      ? customerEmail.trim().toLowerCase()
      : null;

  if (isPaystackEnabled() && (!emailValue || !emailValue.includes("@"))) {
    return NextResponse.json(
      { error: "A valid email is required for online payment." },
      { status: 400 }
    );
  }

  const variantIds = (items as IncomingItem[]).map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    return NextResponse.json(
      { error: "One or more items are no longer available." },
      { status: 400 }
    );
  }

  const orderItems = (items as IncomingItem[]).map((i) => {
    const v = variants.find((vr) => vr.id === i.variantId)!;
    return {
      productId: v.productId,
      variantId: v.id,
      name: v.product.name,
      variantLabel: v.label,
      priceGhs: v.priceGhs,
      quantity: Math.max(1, Math.min(50, Math.floor(i.quantity))),
    };
  });

  const subtotal = orderItems.reduce((s, i) => s + i.priceGhs * i.quantity, 0);
  const total = subtotal + DELIVERY_FEE;
  const trackingCode = generateTrackingCode();

  // Create the order in PENDING_PAYMENT state.
  const order = await prisma.order.create({
    data: {
      trackingCode,
      paymentReference: trackingCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: emailValue,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod: paymentMethod === "MOMO" ? "MOMO" : "CARD",
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      subtotalGhs: subtotal,
      deliveryFeeGhs: DELIVERY_FEE,
      totalGhs: total,
      status: "PENDING_PAYMENT",
      items: { create: orderItems },
    },
  });

  // --- Payment branch ---
  if (!isPaystackEnabled()) {
    // Demo mode — auto-confirm so the flow can be tested locally without keys.
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "RECEIVED", paidAt: new Date(), paymentProvider: "DEMO" },
    });
    return NextResponse.json({
      trackingCode,
      mode: "demo",
      redirectUrl: `/confirmation/${trackingCode}`,
    });
  }

  // Real Paystack flow.
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  try {
    const init = await initializeTransaction({
      email: emailValue!,
      amountGhs: total,
      reference: trackingCode,
      callbackUrl: `${origin}/api/payments/callback`,
    });
    return NextResponse.json({
      trackingCode,
      mode: "paystack",
      redirectUrl: init.authorization_url,
    });
  } catch (err) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAYMENT_FAILED" },
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment init failed." },
      { status: 502 }
    );
  }
}

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  return NextResponse.json({ orders });
}
