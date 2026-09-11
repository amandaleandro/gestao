"use client";

import { FormEvent, useState } from "react";

const FIELDS = [
  ["team", "Equipe e responsáveis", "Quem participa do atendimento/comercial e quem decide sobre o processo?"],
  ["channels", "Canais e números", "WhatsApp, Instagram, formulário, telefone e outros canais usados."],
  ["services", "Produtos e serviços principais", "O que vocês vendem e quais tipos de solicitação chegam com mais frequência?"],
  ["salesStages", "Etapas atuais da venda", "Descreva o caminho desde o primeiro contato até o fechamento."],
  ["faq", "Perguntas frequentes", "Quais dúvidas, pedidos e objeções aparecem com frequência?"],
  ["tools", "Ferramentas e planilhas atuais", "CRM, agenda, planilhas, ERP ou qualquer ferramenta usada hoje."],
  ["integrations", "Integrações necessárias", "Quais sistemas precisam conversar entre si? Se não souber, pode deixar em branco."],
  ["objective", "Objetivo prioritário", "O que precisa estar claramente melhor depois desta implantação?"],
] as const;

export default function PublicOnboardingForm({
  token,
  initialData,
  initialStatus,
}: {
  token: string;
  initialData: Record<string, string>;
  initialStatus: string;
}) {
  const [data, setData] = useState<Record<string, string>>(initialData);
  const [status, setStatus] = useState(initialStatus);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(completed: boolean) {
    setState("saving");
    setMessage("");
    const response = await fetch(`/api/public/onboarding/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, completed }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState("error");
      setMessage(body.error ?? "Não foi possível salvar o onboarding.");
      return;
    }
    setStatus(body.status);
    setState("success");
    setMessage(completed ? "Onboarding concluído. A A2Y já pode preparar a implantação." : "Dados salvos. Você pode voltar por este mesmo link para continuar.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(true);
  }

  if (status === "CONCLUIDO") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Onboarding concluído</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-emerald-950">Informações recebidas.</h2>
        <p className="mt-3 text-sm leading-6 text-emerald-800">A equipe da A2Y utilizará este briefing para planejar a implantação e alinhar os próximos passos.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(7,24,39,0.07)] sm:p-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0344F0]">Briefing de implantação</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#071827]">Conte como a operação funciona hoje.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Não precisa escrever de forma técnica. O objetivo é reduzir retrabalho e configurar a solução com o contexto correto.</p>
      </div>

      <div className="mt-6 grid gap-5">
        {FIELDS.map(([key, label, hint]) => (
          <label key={key} className="grid gap-2">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            <span className="text-xs leading-5 text-slate-500">{hint}</span>
            <textarea
              rows={4}
              value={data[key] ?? ""}
              onChange={(event) => setData((current) => ({ ...current, [key]: event.target.value }))}
              className="resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#0344F0] focus:ring-4 focus:ring-blue-100"
            />
          </label>
        ))}
      </div>

      {state === "error" && <p className="mt-5 text-sm font-medium text-red-700">{message}</p>}
      {state === "success" && <p className="mt-5 text-sm font-medium text-emerald-700">{message}</p>}

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
        <button type="button" onClick={() => void submit(false)} disabled={state === "saving"} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">Salvar e continuar depois</button>
        <button type="submit" disabled={state === "saving"} className="rounded-xl bg-[#0344F0] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0239c9] disabled:opacity-60">{state === "saving" ? "Salvando..." : "Concluir onboarding"}</button>
      </div>
    </form>
  );
}
