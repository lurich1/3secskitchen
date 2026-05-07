const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const PAYSTACK_BASE = "https://api.paystack.co";

export function isPaystackEnabled(): boolean {
  return PAYSTACK_SECRET.length > 0;
}

export type PaystackInitResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export async function initializeTransaction(opts: {
  email: string;
  amountGhs: number;
  reference: string;
  callbackUrl: string;
}): Promise<PaystackInitResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      amount: Math.round(opts.amountGhs * 100), // pesewas
      currency: "GHS",
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      channels: ["mobile_money", "card"],
    }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data?.status) {
    throw new Error(data?.message ?? "Paystack initialization failed.");
  }
  return data.data as PaystackInitResponse;
}

export type PaystackVerifyResult = {
  paid: boolean;
  status: string;
  amountInPesewas: number;
};

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data?.status) {
    throw new Error(data?.message ?? "Paystack verification failed.");
  }
  const tx = data.data;
  return {
    paid: tx?.status === "success",
    status: tx?.status ?? "unknown",
    amountInPesewas: Number(tx?.amount ?? 0),
  };
}
