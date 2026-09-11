"use client";

import { FormEvent, useEffect, useState } from "react";

export default function PublicProposalAcceptance({
  token,
  initialStatus,
}: {
  token: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    initialStatus === "ACEITA" ? "success" : "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (["RASCUNHO", "ACEITA", "RECUSADA", "EXPIRADA"].includes(initialStatus)) return;
    void fetch(`/api/public/proposals/${token}/view`, { method: "POST" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (data.status) setStatus(data.status);
      })
      .catch(() => undefined);
  }, [initialStatus, token]);

  async function accept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setState("sending");
    setMessage("");

    const response = await fetch(`/api/public/proposals/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        acceptedTerms: formData.get("acceptedTerms") === "on",
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState("error");
      setMessage(data.error ?? "Não foi possível registrar o aceite.");
      if (response.status === 410) setStatus("EXPIRADA");
      return;
    }

    setStatus("ACEITA");
    setState("success");
  }

  if (status === "RASCUNHO") {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Esta proposta ainda está em preparação e não está disponível para aceite.</div>;
  }

  if (status === "EXPIRADA") {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700"><strong>Proposta expirada.</strong><p className="mt-1">Entre em contato com a A2Y para receber uma versão atualizada.</p></div>;
  }

  if (status === "RECUSADA") {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">Esta proposta foi encerrada como não aceita.</div>;
  }

  if (state === "success" || status === "ACEITA") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Aceite registrado</p>
        <h3 className="mt-2 text-xl font-semibold text-emerald-950">Próxima etapa: onboarding.</h3>
        <p className="mt-2 text-sm leading-6 text-emerald-800">A A2Y já recebeu a confirmação. A implantação começa após os passos comerciais e dados necessários serem concluídos.</p>
      </div>
    );
  }

  return (
    <form onSubmit={accept} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0344F0]">Aceite da proposta</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">Confirmar interesse em seguir</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">Preencha os dados do responsável pelo aceite. O registro fica vinculado a esta versão da proposta.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Nome do responsável
          <input name="name" required className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0344F0] focus:ring-2 focus:ring-blue-100" />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-slate-600">E-mail do responsável
          <input name="email" type="email" required className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0344F0] focus:ring-2 focus:ring-blue-100" />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <input name="acceptedTerms" type="checkbox" required className="mt-1 h-4 w-4 shrink-0" />
        <span>Li esta versão da proposta e concordo com o escopo, valores, prazo estimado, itens não inclusos e próximos passos apresentados. Este aceite registra a aprovação comercial da proposta.</span>
      </label>

      {state === "error" && <p className="mt-4 text-sm font-medium text-red-700">{message}</p>}

      <button type="submit" disabled={state === "sending"} className="mt-5 w-full rounded-xl bg-[#0344F0] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0239c9] disabled:opacity-60">
        {state === "sending" ? "Registrando aceite..." : "Aceitar proposta"}
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-500">Quando necessário, contrato e documentos fiscais seguem o processo comercial aplicável ao projeto.</p>
    </form>
  );
}
