"use client";

import { useCallback, useEffect, useState } from "react";

interface DashboardData {
  byStage: { stage: string; count: number }[];
  byCategory: { category: string; count: number }[];
  proposals: { status: string; count: number }[];
  conversionRate: number;
  closedWon: number;
  closedThisMonth: number;
  totalClients: number;
  activeClients: number;
  overdueCount: number;
  soldRevenue: number;
  receivedRevenue: number;
  mrr: number;
}

const STAGE_LABELS: Record<string, string> = {
  IMPORTADO: "Importado",
  NOVO: "Novo",
  CONTATADO: "Contatado",
  INTERESSADO: "Interessado",
  REUNIAO_MARCADA: "Reunião marcada",
  DIAGNOSTICO_REALIZADO: "Diagnóstico realizado",
  PROPOSTA_ENVIADA: "Proposta enviada",
  NEGOCIACAO: "Negociação",
  FECHADO_GANHO: "Fechado (ganho)",
  FECHADO_PERDIDO: "Fechado (perdido)",
  ONBOARDING: "Onboarding",
  IMPLANTACAO: "Implantação",
  ATIVO: "Cliente ativo",
};

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Falha ao carregar o dashboard");
      setData(await response.json());
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  if (isLoading && !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-3" aria-label="Carregando dashboard">
        {[1, 2, 3].map((key) => (
          <div key={key} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-4 h-7 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <p className="font-semibold">Não foi possível carregar o dashboard.</p>
        <button type="button" onClick={() => void loadDashboard()} className="mt-4 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white">Tentar novamente</button>
      </div>
    );
  }

  const maxStageCount = Math.max(1, ...data.byStage.map((stage) => stage.count));
  const maxCategoryCount = Math.max(1, ...data.byCategory.map((category) => category.count));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0344F0]">Visão comercial</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Receita, funil e implantação</h2>
          <p className="mt-1 text-sm text-slate-500">Da entrada do lead até o cliente ativo, separando venda contratada de caixa recebido.</p>
        </div>
        <button type="button" onClick={() => void loadDashboard()} disabled={isLoading} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-[#0344F0] disabled:opacity-60">{isLoading ? "Atualizando..." : "Atualizar dados"}</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Oportunidades / clientes</p><p className="mt-2 text-3xl font-semibold text-slate-950">{data.totalClients}</p></div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#0344F0]">Conversão decidida</p><p className="mt-2 text-3xl font-semibold text-blue-950">{data.conversionRate.toFixed(1)}%</p></div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Vendas ganhas</p><p className="mt-2 text-3xl font-semibold text-emerald-950">{data.closedWon}</p><p className="mt-1 text-xs text-emerald-700">{data.closedThisMonth} neste mês</p></div>
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Clientes ativos</p><p className="mt-2 text-3xl font-semibold text-violet-950">{data.activeClients}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Receita vendida</p><p className="mt-2 text-2xl font-semibold text-slate-950">{money(data.soldRevenue)}</p><p className="mt-1 text-xs text-slate-500">Implantações aceitas</p></div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Receita recebida</p><p className="mt-2 text-2xl font-semibold text-emerald-950">{money(data.receivedRevenue)}</p><p className="mt-1 text-xs text-emerald-700">Implantações com pagamento confirmado</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">MRR contratado</p><p className="mt-2 text-2xl font-semibold text-slate-950">{money(data.mrr)}</p></div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Follow-ups atrasados</p><p className="mt-2 text-3xl font-semibold text-amber-950">{data.overdueCount}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Propostas</p><p className="mt-2 text-3xl font-semibold text-slate-950">{data.proposals.reduce((sum, proposal) => sum + proposal.count, 0)}</p></div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Oportunidades por etapa</h3>
          <div className="flex flex-col gap-3">
            {data.byStage.length ? data.byStage.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs text-slate-600">{STAGE_LABELS[stage.stage] ?? stage.stage}</span>
                <div className="h-2.5 flex-1 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-[#0344F0] transition-all" style={{ width: `${(stage.count / maxStageCount) * 100}%` }} /></div>
                <span className="w-8 text-right text-xs font-semibold text-slate-700">{stage.count}</span>
              </div>
            )) : <p className="text-sm text-slate-500">Ainda não há dados.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Top segmentos</h3>
          <div className="flex flex-col gap-3">
            {data.byCategory.length ? data.byCategory.map((category) => (
              <div key={category.category} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-xs text-slate-600">{category.category}</span>
                <div className="h-2.5 flex-1 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-slate-700 transition-all" style={{ width: `${(category.count / maxCategoryCount) * 100}%` }} /></div>
                <span className="w-8 text-right text-xs font-semibold text-slate-700">{category.count}</span>
              </div>
            )) : <p className="text-sm text-slate-500">Os segmentos aparecerão com os clientes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
