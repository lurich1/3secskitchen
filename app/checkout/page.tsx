import { Suspense } from "react";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-900 mb-6">Checkout</h1>
      <Suspense fallback={null}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
