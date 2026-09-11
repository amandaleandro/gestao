"use client";

import { FormEvent, useState } from "react";

type State = "idle" | "sending" | "success" | "error";

export default function DiagnosticForm() {
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");

    const payload = {
      name: String(data.get("name") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      contact: String(data.get("contact") ?? "").trim(),
      segment: String(data.get("segment") ?? "").trim(),
      bottleneck: String(data.get("bottleneck") ?? "").trim(),
      source: "SITE_A2Y",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Falha ao enviar");
      form.reset();
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(7,24,39,0.08)] sm:p-8">
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0344F0]">Diagnóstico inicial</p>
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#071827]">Conte onde a operação está travando.</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Sem apresentação longa. Primeiro entendemos o problema e só então avaliamos se tecnologia faz sentido.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Seu nome
          <input name="name" required className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0344F0] focus:ring-4 focus:ring-blue-100" placeholder="Como podemos te chamar?" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Empresa
          <input name="company" required className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0344F0] focus:ring-4 focus:ring-blue-100" placeholder="Nome da empresa" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          WhatsApp ou e-mail
          <input name="contact" required className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0344F0] focus:ring-4 focus:ring-blue-100" placeholder="Seu melhor contato" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Segmento
          <input name="segment" className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0344F0] focus:ring-4 focus:ring-blue-100" placeholder="Ex.: energia solar" />
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800">
        O que hoje mais atrapalha sua operação ou suas vendas?
        <textarea name="bottleneck" required rows={5} className="resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0344F0] focus:ring-4 focus:ring-blue-100" placeholder="Ex.: recebemos muitos pedidos pelo WhatsApp, mas o acompanhamento fica perdido entre atendentes..." />
      </label>

      <button type="submit" disabled={state === "sending"} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#0344F0] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0239c9] disabled:cursor-not-allowed disabled:opacity-60">
        {state === "sending" ? "Enviando..." : "Solicitar diagnóstico"}
      </button>

      {state === "success" && <p className="mt-4 text-sm font-medium text-emerald-700">Recebemos seu contexto. A próxima etapa é avaliar o problema e entrar em contato.</p>}
      {state === "error" && <p className="mt-4 text-sm font-medium text-red-700">Não foi possível enviar agora. Tente novamente em alguns instantes.</p>}
      <p className="mt-4 text-xs leading-5 text-slate-500">Seus dados são usados apenas para entender a solicitação e dar continuidade ao contato comercial.</p>
    </form>
  );
}
