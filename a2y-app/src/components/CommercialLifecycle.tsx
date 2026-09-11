"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface Opportunity {
  stage: string;
  meetingAt: string | null;
  opportunityValue: number | null;
  recurringValue: number | null;
  closedAt: string | null;
  lostReason: string | null;
  source: string;
}

interface Diagnosis {
  leadSource?: string | null;
  monthlyLeadVolume?: number | null;
  channels?: string | null;
  teamSize?: number | null;
  currentControl?: string | null;
  quoteProcess?: string | null;
  followUpProcess?: string | null;
  averageTicket?: number | null;
  bottlenecks?: string | null;
  priority?: string | null;
  recommendedSolution?: string | null;
  completedAt?: string | null;
}

interface Proposal {
  id: string;
  version: number;
  title: string;
  setupPrice: number | null;
  monthlyPrice: number | null;
  status: string;
  validUntil: string | null;
  createdAt: string;
}

interface Onboarding {
  status: string;
  data: Record<string, unknown> | null;
  completedAt: string | null;
}

interface Implementation {
  status: string;
  checklist: unknown;
  caseConsent: boolean | null;
  caseAnonymous: boolean;
  caseNotes: string | null;
  metricsBefore: unknown;
  metricsAfter: unknown;
}

interface Payload {
  opportunity: Opportunity;
  diagnosis: Diagnosis | null;
  proposals: Proposal[];
  onboarding: Onboarding | null;
  implementation: Implementation | null;
}

interface ChecklistItem {
  title: string;
  done: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { title: "Dia 1 — validar briefing e mapear processo", done: false },
  { title: "Dia 2 — configurar pipeline, usuários e campos", done: false },
  { title: "Dia 3 — conectar canais e organizar dados", done: false },
  { title: "Dia 4 — configurar follow-up e alertas", done: false },
  { title: "Dia 5 — implementar automações previstas no escopo", done: false },
  { title: "Dia 6 — validar dashboard e indicadores", done: false },
  { title: "Dia 7 — QA, treinamento e aceite da implantação", done: false },
];

const STAGE_LABELS: Record<string, string> = {
  IMPORTADO: "Importado",
  NOVO: "Novo",
  CONTATADO: "Contatado",
  INTERESSADO: "Interessado",
  REUNIAO_MARCADA: "Reunião marcada",
  DIAGNOSTICO_REALIZADO: "Diagnóstico realizado",
  PROPOSTA_ENVIADA: "Proposta enviada",
  NEGOCIACAO: "Negociação",
  FECHADO_GANHO: "Fechado ganho",
  FECHADO_PERDIDO: "Fechado perdido",
  ONBOARDING: "Onboarding",
  IMPLANTACAO: "Implantação",
  ATIVO: "Cliente ativo",
};

function fieldClass() {
  return "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none ring-blue-600 transition focus:border-blue-500 focus:ring-2";
}

function textareaClass() {
  return `${fieldClass()} min-h-24 resize-y`;
}

function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function money(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CommercialLifecycle({ clientId }: { clientId: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [opportunity, setOpportunity] = useState({ meetingAt: "", opportunityValue: "", recurringValue: "" });
  const [diagnosis, setDiagnosis] = useState<Record<string, string>>({});
  const [onboarding, setOnboarding] = useState<Record<string, string>>({});
  const [onboardingStatus, setOnboardingStatus] = useState("EM_ANDAMENTO");
  const [implementationStatus, setImplementationStatus] = useState("PLANEJADA");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [caseConsent, setCaseConsent] = useState(false);
  const [caseAnonymous, setCaseAnonymous] = useState(false);
  const [caseNotes, setCaseNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/clients/${clientId}/commercial`);
      if (!response.ok) throw new Error("Não foi possível carregar o ciclo comercial.");
      const payload = (await response.json()) as Payload;
      setData(payload);
      setOpportunity({
        meetingAt: toDatetimeLocal(payload.opportunity.meetingAt),
        opportunityValue: payload.opportunity.opportunityValue?.toString() ?? "",
        recurringValue: payload.opportunity.recurringValue?.toString() ?? "",
      });
      const d = payload.diagnosis;
      setDiagnosis({
        leadSource: d?.leadSource ?? "",
        monthlyLeadVolume: d?.monthlyLeadVolume?.toString() ?? "",
        channels: d?.channels ?? "",
        teamSize: d?.teamSize?.toString() ?? "",
        currentControl: d?.currentControl ?? "",
        quoteProcess: d?.quoteProcess ?? "",
        followUpProcess: d?.followUpProcess ?? "",
        averageTicket: d?.averageTicket?.toString() ?? "",
        bottlenecks: d?.bottlenecks ?? "",
        priority: d?.priority ?? "",
        recommendedSolution: d?.recommendedSolution ?? "",
      });
      const onboardingData = (payload.onboarding?.data ?? {}) as Record<string, unknown>;
      setOnboarding({
        team: String(onboardingData.team ?? ""),
        channels: String(onboardingData.channels ?? ""),
        services: String(onboardingData.services ?? ""),
        salesStages: String(onboardingData.salesStages ?? ""),
        faq: String(onboardingData.faq ?? ""),
        tools: String(onboardingData.tools ?? ""),
        integrations: String(onboardingData.integrations ?? ""),
        objective: String(onboardingData.objective ?? ""),
      });
      setOnboardingStatus(payload.onboarding?.status ?? "EM_ANDAMENTO");
      setImplementationStatus(payload.implementation?.status ?? "PLANEJADA");
      const storedChecklist = payload.implementation?.checklist;
      if (Array.isArray(storedChecklist) && storedChecklist.length) {
        setChecklist(storedChecklist.map((item) => ({
          title: typeof item === "object" && item && "title" in item ? String((item as ChecklistItem).title) : "Etapa",
          done: Boolean(typeof item === "object" && item && "done" in item ? (item as ChecklistItem).done : false),
        })));
      } else {
        setChecklist(DEFAULT_CHECKLIST);
      }
      setCaseConsent(Boolean(payload.implementation?.caseConsent));
      setCaseAnonymous(Boolean(payload.implementation?.caseAnonymous));
      setCaseNotes(payload.implementation?.caseNotes ?? "");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const checklistProgress = useMemo(() => {
    if (!checklist.length) return 0;
    return Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100);
  }, [checklist]);

  async function patch(section: string, payload: Record<string, unknown>) {
    setSaving(section);
    setError(null);
    try {
      const response = await fetch(`/api/clients/${clientId}/commercial`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, ...payload }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Falha ao salvar.");
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(null);
    }
  }

  async function createProposal() {
    setSaving("proposal-create");
    setError(null);
    try {
      const response = await fetch(`/api/clients/${clientId}/commercial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-proposal" }),
      });
      if (!response.ok) throw new Error("Não foi possível gerar a proposta.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Carregando ciclo comercial...</div>;
  }

  if (!data) return null;

  return (
    <section className="mx-auto mt-6 flex max-w-5xl flex-col gap-5">
      <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0344F0]">Ciclo comercial A2Y</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Da reunião ao cliente ativo</h2>
            <p className="mt-1 text-sm text-slate-500">Diagnóstico, proposta, onboarding e implantação no mesmo fluxo.</p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0344F0]">
            {STAGE_LABELS[data.opportunity.stage] ?? data.opportunity.stage}
          </span>
        </div>
        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">Oportunidade</h3>
          <p className="mt-1 text-xs text-slate-500">Origem: {data.opportunity.source}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">Reunião
              <input className={fieldClass()} type="datetime-local" value={opportunity.meetingAt} onChange={(e) => setOpportunity((v) => ({ ...v, meetingAt: e.target.value }))} />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Valor implantação
              <input className={fieldClass()} type="number" min="0" step="0.01" value={opportunity.opportunityValue} onChange={(e) => setOpportunity((v) => ({ ...v, opportunityValue: e.target.value }))} />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">MRR potencial
              <input className={fieldClass()} type="number" min="0" step="0.01" value={opportunity.recurringValue} onChange={(e) => setOpportunity((v) => ({ ...v, recurringValue: e.target.value }))} />
            </label>
          </div>
          <button onClick={() => patch("opportunity", opportunity)} disabled={saving === "opportunity"} className="mt-4 rounded-lg bg-[#071827] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving === "opportunity" ? "Salvando..." : "Salvar oportunidade"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950">Propostas</h3>
              <p className="mt-1 text-xs text-slate-500">Condição fundadora padrão: R$ 1.490 + R$ 397/mês.</p>
            </div>
            <button onClick={createProposal} disabled={saving === "proposal-create"} className="rounded-lg bg-[#0344F0] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
              {saving === "proposal-create" ? "Gerando..." : "Gerar proposta"}
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {data.proposals.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Nenhuma proposta criada.</p>}
            {data.proposals.map((proposal) => (
              <div key={proposal.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">v{proposal.version} · {proposal.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{money(proposal.setupPrice)} + {money(proposal.monthlyPrice)}/mês</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{proposal.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {proposal.status === "RASCUNHO" && <button onClick={() => patch("proposal", { proposalId: proposal.id, status: "ENVIADA" })} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0344F0]">Marcar enviada</button>}
                  {["ENVIADA", "VISUALIZADA"].includes(proposal.status) && <button onClick={() => patch("proposal", { proposalId: proposal.id, status: "ACEITA" })} className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Aceitar</button>}
                  {["ENVIADA", "VISUALIZADA"].includes(proposal.status) && <button onClick={() => patch("proposal", { proposalId: proposal.id, status: "RECUSADA" })} className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">Recusar</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Diagnóstico</h3>
            <p className="mt-1 text-sm text-slate-500">Registre o que a empresa disse. Hipótese e evidência continuam separadas.</p>
          </div>
          {data.diagnosis?.completedAt && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Concluído</span>}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ["leadSource", "De onde vêm os leads?"],
            ["channels", "Canais usados"],
            ["currentControl", "Como controlam as oportunidades?"],
            ["quoteProcess", "Como enviam orçamento?"],
            ["followUpProcess", "Como fazem follow-up?"],
            ["priority", "O que é prioridade resolver agora?"],
          ].map(([key, label]) => (
            <label key={key} className="grid gap-1.5 text-xs font-semibold text-slate-600">{label}
              <textarea className={textareaClass()} value={diagnosis[key] ?? ""} onChange={(e) => setDiagnosis((v) => ({ ...v, [key]: e.target.value }))} />
            </label>
          ))}
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Leads/mês
            <input className={fieldClass()} type="number" min="0" value={diagnosis.monthlyLeadVolume ?? ""} onChange={(e) => setDiagnosis((v) => ({ ...v, monthlyLeadVolume: e.target.value }))} />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Pessoas no atendimento/comercial
            <input className={fieldClass()} type="number" min="0" value={diagnosis.teamSize ?? ""} onChange={(e) => setDiagnosis((v) => ({ ...v, teamSize: e.target.value }))} />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Ticket médio aproximado
            <input className={fieldClass()} type="number" min="0" step="0.01" value={diagnosis.averageTicket ?? ""} onChange={(e) => setDiagnosis((v) => ({ ...v, averageTicket: e.target.value }))} />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">Gargalos relatados
            <textarea className={textareaClass()} value={diagnosis.bottlenecks ?? ""} onChange={(e) => setDiagnosis((v) => ({ ...v, bottlenecks: e.target.value }))} />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">Solução recomendada
            <textarea className={textareaClass()} value={diagnosis.recommendedSolution ?? ""} onChange={(e) => setDiagnosis((v) => ({ ...v, recommendedSolution: e.target.value }))} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => patch("diagnosis", diagnosis)} disabled={saving === "diagnosis"} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">Salvar rascunho</button>
          <button onClick={() => patch("diagnosis", { ...diagnosis, completed: true })} disabled={saving === "diagnosis"} className="rounded-lg bg-[#0344F0] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Concluir diagnóstico</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div><h3 className="font-semibold text-slate-950">Onboarding</h3><p className="mt-1 text-xs text-slate-500">Coleta estruturada após o fechamento.</p></div>
            <select value={onboardingStatus} onChange={(e) => setOnboardingStatus(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
              <option value="RASCUNHO">Rascunho</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDO">Concluído</option>
            </select>
          </div>
          <div className="mt-4 space-y-3">
            {[
              ["team", "Equipe e responsáveis"], ["channels", "Canais e números"], ["services", "Produtos/serviços principais"], ["salesStages", "Etapas atuais da venda"], ["faq", "Perguntas frequentes"], ["tools", "Ferramentas/planilhas atuais"], ["integrations", "Integrações necessárias"], ["objective", "Objetivo prioritário da implantação"],
            ].map(([key, label]) => <label key={key} className="grid gap-1.5 text-xs font-semibold text-slate-600">{label}<textarea className={textareaClass()} value={onboarding[key] ?? ""} onChange={(e) => setOnboarding((v) => ({ ...v, [key]: e.target.value }))} /></label>)}
          </div>
          <button onClick={() => patch("onboarding", { status: onboardingStatus, data: onboarding })} disabled={saving === "onboarding"} className="mt-4 rounded-lg bg-[#071827] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Salvar onboarding</button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div><h3 className="font-semibold text-slate-950">Implantação</h3><p className="mt-1 text-xs text-slate-500">{checklistProgress}% do checklist concluído.</p></div>
            <select value={implementationStatus} onChange={(e) => setImplementationStatus(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
              <option value="PLANEJADA">Planejada</option><option value="EM_ANDAMENTO">Em andamento</option><option value="BLOQUEADA">Bloqueada</option><option value="CONCLUIDA">Concluída</option>
            </select>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#0344F0] transition-all" style={{ width: `${checklistProgress}%` }} /></div>
          <div className="mt-4 space-y-2">
            {checklist.map((item, index) => (
              <label key={`${item.title}-${index}`} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <input type="checkbox" checked={item.done} onChange={(e) => setChecklist((items) => items.map((current, i) => i === index ? { ...current, done: e.target.checked } : current))} className="mt-0.5 h-4 w-4" />
                <span className={item.done ? "text-slate-400 line-through" : ""}>{item.title}</span>
              </label>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Case</p>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={caseConsent} onChange={(e) => setCaseConsent(e.target.checked)} /> Cliente autorizou usar dados/resultados em case</label>
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={caseAnonymous} onChange={(e) => setCaseAnonymous(e.target.checked)} /> Publicar de forma anônima</label>
            <textarea className={`${textareaClass()} mt-3`} placeholder="Observações do case e métricas disponíveis" value={caseNotes} onChange={(e) => setCaseNotes(e.target.value)} />
          </div>
          <button onClick={() => patch("implementation", { status: implementationStatus, checklist, caseConsent, caseAnonymous, caseNotes })} disabled={saving === "implementation"} className="mt-4 rounded-lg bg-[#0344F0] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Salvar implantação</button>
        </div>
      </div>
    </section>
  );
}
