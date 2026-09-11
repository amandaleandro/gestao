"use client";

import { useCallback, useEffect, useState } from "react";

interface Proposal {
  id: string;
  version: number;
  publicToken: string;
  title: string;
  context: string | null;
  problems: string | null;
  solution: string | null;
  scope: string | null;
  exclusions: string | null;
  timeline: string | null;
  setupPrice: number | null;
  monthlyPrice: number | null;
  validUntil: string | null;
  status: string;
  sentAt: string | null;
  viewedAt: string | null;
  acceptedAt: string | null;
  acceptanceName: string | null;
  acceptanceEmail: string | null;
  createdAt: string;
}

function fieldClass() {
  return "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0344F0] focus:ring-2 focus:ring-blue-100";
}

function money(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toDateInput(value: string | null): string {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export default function ProposalManager({ clientId }: { clientId: string }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/clients/${clientId}/commercial`);
    if (!response.ok) {
      setMessage("Não foi possível carregar as propostas.");
      setLoading(false);
      return;
    }
    const data = await response.json();
    const list = (data.proposals ?? []) as Proposal[];
    setProposals(list);
    setSelectedId((current) => current && list.some((p) => p.id === current) ? current : list[0]?.id ?? null);
    setLoading(false);
  }, [clientId]);

  useEffect(() => { void load(); }, [load]);

  const selected = proposals.find((proposal) => proposal.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) {
      setForm({});
      return;
    }
    setForm({
      title: selected.title ?? "",
      context: selected.context ?? "",
      problems: selected.problems ?? "",
      solution: selected.solution ?? "",
      scope: selected.scope ?? "",
      exclusions: selected.exclusions ?? "",
      timeline: selected.timeline ?? "",
      setupPrice: selected.setupPrice?.toString() ?? "",
      monthlyPrice: selected.monthlyPrice?.toString() ?? "",
      validUntil: toDateInput(selected.validUntil),
    });
  }, [selected]);

  async function createProposal() {
    setSaving(true);
    setMessage(null);
    const response = await fetch(`/api/clients/${clientId}/commercial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-proposal" }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(data.error ?? "Não foi possível gerar a proposta.");
    else {
      await load();
      setSelectedId(data.id);
      setMessage("Nova versão criada a partir do diagnóstico.");
    }
    setSaving(false);
  }

  async function save(extra: Record<string, unknown> = {}) {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    const response = await fetch(`/api/clients/${clientId}/commercial`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "proposal",
        proposalId: selected.id,
        ...form,
        setupPrice: form.setupPrice || null,
        monthlyPrice: form.monthlyPrice || null,
        validUntil: form.validUntil ? `${form.validUntil}T23:59:59-03:00` : null,
        ...extra,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(data.error ?? "Não foi possível salvar a proposta.");
    else {
      setMessage("Proposta atualizada.");
      await load();
    }
    setSaving(false);
  }

  async function copyPublicLink() {
    if (!selected) return;
    const link = `${window.location.origin}/proposta/${selected.publicToken}`;
    await navigator.clipboard.writeText(link);
    setMessage("Link público copiado.");
  }

  if (loading) return <p className="text-sm text-slate-500">Carregando propostas...</p>;

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0344F0]">Versões</p><h2 className="mt-1 font-semibold text-slate-950">Propostas</h2></div>
          <button onClick={createProposal} disabled={saving} className="rounded-lg bg-[#0344F0] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">+ Nova</button>
        </div>
        <div className="mt-4 space-y-2">
          {proposals.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Ainda não existe proposta.</p>}
          {proposals.map((proposal) => (
            <button key={proposal.id} onClick={() => setSelectedId(proposal.id)} className={`w-full rounded-xl border p-3 text-left transition ${selectedId === proposal.id ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-900">Versão {proposal.version}</span><span className="text-[10px] font-bold text-slate-500">{proposal.status}</span></div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{proposal.title}</p>
              <p className="mt-2 text-xs font-semibold text-slate-700">{money(proposal.setupPrice)} · {money(proposal.monthlyPrice)}/mês</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {!selected ? (
          <div className="py-12 text-center"><p className="text-sm text-slate-500">Crie a primeira proposta depois de registrar o diagnóstico.</p></div>
        ) : (
          <>
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0344F0]">Proposta v{selected.version}</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Editar antes de enviar</h2>
                <p className="mt-1 text-xs text-slate-500">Status: {selected.status}{selected.viewedAt ? ` · visualizada em ${new Date(selected.viewedAt).toLocaleString("pt-BR")}` : ""}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={copyPublicLink} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Copiar link</button>
                <a href={`/proposta/${selected.publicToken}`} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Pré-visualizar ↗</a>
              </div>
            </div>

            {message && <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p>}

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Título<input className={fieldClass()} value={form.title ?? ""} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} /></label>
              {[
                ["context", "Contexto"],
                ["problems", "Problemas entendidos"],
                ["solution", "Solução recomendada"],
                ["scope", "Escopo"],
                ["exclusions", "Não incluso"],
                ["timeline", "Prazo e implantação"],
              ].map(([key, label]) => (
                <label key={key} className="grid gap-1.5 text-xs font-semibold text-slate-600">{label}<textarea rows={4} className={`${fieldClass()} resize-y`} value={form[key] ?? ""} onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))} /></label>
              ))}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Implantação<input type="number" min="0" step="0.01" className={fieldClass()} value={form.setupPrice ?? ""} onChange={(e) => setForm((v) => ({ ...v, setupPrice: e.target.value }))} /></label>
                <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Mensalidade<input type="number" min="0" step="0.01" className={fieldClass()} value={form.monthlyPrice ?? ""} onChange={(e) => setForm((v) => ({ ...v, monthlyPrice: e.target.value }))} /></label>
                <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Validade<input type="date" className={fieldClass()} value={form.validUntil ?? ""} onChange={(e) => setForm((v) => ({ ...v, validUntil: e.target.value }))} /></label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
              <button onClick={() => save()} disabled={saving} className="rounded-lg bg-[#071827] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Salvar</button>
              {selected.status === "RASCUNHO" && <button onClick={() => save({ status: "ENVIADA" })} disabled={saving} className="rounded-lg bg-[#0344F0] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Salvar e marcar enviada</button>}
              {selected.status === "ACEITA" && <span className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">Aceita por {selected.acceptanceName ?? "cliente"}{selected.acceptanceEmail ? ` · ${selected.acceptanceEmail}` : ""}</span>}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
