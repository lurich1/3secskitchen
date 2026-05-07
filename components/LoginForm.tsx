"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Login failed.");
      }
      router.replace("/manager/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <label className="block">
        <span className="block text-sm font-medium text-brand-900 mb-1">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-brand-100 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-brand-900 mb-1">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-brand-100 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </label>
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-md p-2.5 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-500 text-white py-2.5 rounded-md font-semibold hover:bg-brand-600 disabled:opacity-50"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
