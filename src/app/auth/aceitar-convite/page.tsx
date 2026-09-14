"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!token) return setError("Este link de convite não é válido.");
    if (password !== confirmation) return setError("As senhas não conferem.");

    setLoading(true);
    try {
      const response = await fetch("/api/workspace/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setError(data.error || "Não foi possível aceitar o convite.");
      setSuccess(true);
      setTimeout(() => router.replace("/auth/signin"), 1600);
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-5">
      <div><p className="text-xl font-bold text-slate-900">Lex<span className="text-amber-500">AI</span></p><h1 className="mt-5 text-2xl font-bold text-slate-900">Aceitar convite</h1><p className="mt-1 text-xs text-slate-500">Defina sua senha para acessar o escritório. Se você já possui uma conta, informe sua senha atual.</p></div>
      {success ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">Convite aceito. Redirecionando para o login…</p> : <form onSubmit={submit} className="space-y-4">
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
        <label className="block text-xs font-bold text-slate-700">Senha<input className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" required /></label>
        <label className="block text-xs font-bold text-slate-700">Confirmar senha<input className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" required /></label>
        <button disabled={loading || !token} className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-white disabled:opacity-50">{loading ? "Aceitando…" : "Aceitar convite"}</button>
      </form>}
      <Link href="/auth/signin" className="block text-center text-xs font-semibold text-slate-500">Voltar ao login</Link>
    </section>
  </main>;
}

export default function AcceptInvitePage() { return <Suspense fallback={<main className="min-h-screen grid place-items-center bg-slate-50 text-sm text-slate-500">Carregando…</main>}><AcceptInviteForm /></Suspense>; }
