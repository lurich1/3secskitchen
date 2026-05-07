import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { KITCHEN_STATUSES } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const status = body?.status;
  if (!KITCHEN_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid kitchen status." },
      { status: 400 }
    );
  }

  // Don't allow flipping unpaid orders into kitchen states.
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (!order.paidAt) {
    return NextResponse.json(
      { error: "Cannot update an unpaid order." },
      { status: 409 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
