import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrdersList from "@/components/OrdersList";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect("/manager/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });

  const counts = {
    received: orders.filter((o) => o.status === "RECEIVED").length,
    preparing: orders.filter((o) => o.status === "PREPARING").length,
    out: orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Kitchen dashboard</h1>
          <p className="text-sm text-brand-900/60">
            Welcome back, {session.name}.
          </p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm bg-white border border-brand-100 px-3 py-1.5 rounded-md hover:bg-brand-50"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="New" value={counts.received} accent="bg-blue-100 text-blue-800" />
        <Stat label="Preparing" value={counts.preparing} accent="bg-amber-100 text-amber-800" />
        <Stat label="Out for delivery" value={counts.out} accent="bg-purple-100 text-purple-800" />
        <Stat label="Delivered today" value={counts.delivered} accent="bg-emerald-100 text-emerald-800" />
      </div>

      <OrdersList initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-white border border-brand-100 rounded-xl p-4">
      <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${accent}`}>
        {label}
      </div>
      <div className="text-2xl font-bold text-brand-900 mt-2">{value}</div>
    </div>
  );
}
