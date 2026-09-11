"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildWhatsappLink } from "@/lib/whatsapp";

type Stage =
  | "NOVO"
  | "CONTATADO"
  | "INTERESSADO"
  | "REUNIAO_MARCADA"
  | "DIAGNOSTICO_REALIZADO"
  | "PROPOSTA_ENVIADA"
  | "NEGOCIACAO"
  | "FECHADO_GANHO"
  | "FECHADO_PERDIDO"
  | "ONBOARDING"
  | "IMPLANTACAO"
  | "ATIVO";

interface Client {
  id: string;
  name: string;
  category: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  stage: Stage | "IMPORTADO";
  createdAt: string;
}

const STAGES: { key: Stage; label: string }[] = [
  { key: "NOVO", label: "Novo" },
  { key: "CONTATADO", label: "Contatado" },
  { key: "INTERESSADO", label: "Interessado" },
  { key: "REUNIAO_MARCADA", label: "Reunião marcada" },
  { key: "DIAGNOSTICO_REALIZADO", label: "Diagnóstico realizado" },
  { key: "PROPOSTA_ENVIADA", label: "Proposta enviada" },
  { key: "NEGOCIACAO", label: "Negociação" },
  { key: "FECHADO_GANHO", label: "Fechado (ganho)" },
  { key: "ONBOARDING", label: "Onboarding" },
  { key: "IMPLANTACAO", label: "Implantação" },
  { key: "ATIVO", label: "Cliente ativo" },
  { key: "FECHADO_PERDIDO", label: "Fechado (perdido)" },
];

const NEXT_STAGE: Record<Stage, Stage | null> = {
  NOVO: "CONTATADO",
  CONTATADO: "INTERESSADO",
  INTERESSADO: "REUNIAO_MARCADA",
  REUNIAO_MARCADA: "DIAGNOSTICO_REALIZADO",
  DIAGNOSTICO_REALIZADO: "PROPOSTA_ENVIADA",
  PROPOSTA_ENVIADA: "NEGOCIACAO",
  NEGOCIACAO: "FECHADO_GANHO",
  FECHADO_GANHO: "ONBOARDING",
  ONBOARDING: "IMPLANTACAO",
  IMPLANTACAO: "ATIVO",
  ATIVO: null,
  FECHADO_PERDIDO: null,
};

const PREV_STAGE: Record<Stage, Stage | null> = {
  NOVO: null,
  CONTATADO: "NOVO",
  INTERESSADO: "CONTATADO",
  REUNIAO_MARCADA: "INTERESSADO",
  DIAGNOSTICO_REALIZADO: "REUNIAO_MARCADA",
  PROPOSTA_ENVIADA: "DIAGNOSTICO_REALIZADO",
  NEGOCIACAO: "PROPOSTA_ENVIADA",
  FECHADO_GANHO: "NEGOCIACAO",
  ONBOARDING: "FECHADO_GANHO",
  IMPLANTACAO: "ONBOARDING",
  ATIVO: "IMPLANTACAO",
  FECHADO_PERDIDO: "NEGOCIACAO",
};

function emptyGroups(): Record<Stage, Client[]> {
  return Object.fromEntries(STAGES.map((stage) => [stage.key, []])) as Record<Stage, Client[]>;
}

export default function ProspeccaoBoard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<Stage | null>(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    const res = await fetch(`/api/clients?${params.toString()}`);
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadClients(), 0);
    return () => window.clearTimeout(timer);
  }, [loadClients]);

  const grouped = useMemo(() => {
    const map = emptyGroups();
    for (const client of clients) {
      if (client.stage === "IMPORTADO") continue;
      if (client.stage in map) map[client.stage as Stage].push(client);
    }
    return map;
  }, [clients]);

  async function moveStage(clientId: string, stage: Stage) {
    setClients((prev) => prev.map((client) => (client.id === clientId ? { ...client, stage } : client)));
    const response = await fetch(`/api/clients/${clientId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (!response.ok) await loadClients();
  }

  function handleDrop(stage: Stage) {
    if (!draggedClientId) return;
    const client = clients.find((item) => item.id === draggedClientId);
    setDropStage(null);
    setDraggedClientId(null);
    if (client && client.stage !== stage) void moveStage(draggedClientId, stage);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mr-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0344F0]">Pipeline</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Da oportunidade ao cliente ativo</h2>
          <p className="mt-1 text-xs text-slate-500">Acompanhe aquisição, fechamento e implantação no mesmo fluxo.</p>
        </div>
        <input
          type="text"
          placeholder="Buscar oportunidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-600 placeholder:text-slate-400 focus:ring-2 sm:w-64"
        />
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Carregando...</p>
      ) : (
        <div className="flex snap-x gap-4 overflow-x-auto pb-3 pr-1">
          {STAGES.map((stage) => (
            <div
              key={stage.key}
              onDragOver={(event) => { event.preventDefault(); setDropStage(stage.key); }}
              onDragLeave={() => setDropStage(null)}
              onDrop={() => handleDrop(stage.key)}
              className={`flex w-[290px] min-w-[290px] snap-start flex-col gap-4 rounded-xl border p-4 shadow-sm transition-colors sm:w-[310px] sm:min-w-[310px] ${dropStage === stage.key ? "border-blue-400 bg-blue-50/70 ring-2 ring-blue-100" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-semibold text-slate-900">{stage.label}</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0344F0]">{grouped[stage.key].length}</span>
              </div>

              <div className="flex min-h-[120px] flex-col gap-3">
                {grouped[stage.key].map((client) => (
                  <div
                    key={client.id}
                    draggable
                    onDragStart={() => setDraggedClientId(client.id)}
                    onDragEnd={() => { setDraggedClientId(null); setDropStage(null); }}
                    className={`cursor-grab rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition active:cursor-grabbing ${draggedClientId === client.id ? "opacity-50" : ""}`}
                  >
                    <Link href={`/clients/${client.id}`} className="block font-semibold leading-5 text-slate-900 hover:text-[#0344F0] hover:underline">{client.name}</Link>
                    {client.category && <p className="mt-2 text-xs text-slate-500">{client.category}</p>}
                    {client.phone && <p className="mt-1 text-xs text-slate-500">📞 {client.phone}</p>}
                    {client.city && <p className="mt-1 text-xs text-slate-500">📍 {client.city}</p>}
                    {client.phone && <a href={buildWhatsappLink(client.phone)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-green-700 hover:underline">WhatsApp</a>}
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                      <button
                        disabled={!PREV_STAGE[client.stage as Stage]}
                        onClick={() => PREV_STAGE[client.stage as Stage] && moveStage(client.id, PREV_STAGE[client.stage as Stage]!)}
                        className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                      >← voltar</button>
                      {(["PROPOSTA_ENVIADA", "NEGOCIACAO"] as Stage[]).includes(client.stage as Stage) && (
                        <button onClick={() => moveStage(client.id, "FECHADO_PERDIDO")} className="rounded-md border border-red-300 px-2 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50">perdido</button>
                      )}
                      <button
                        disabled={!NEXT_STAGE[client.stage as Stage]}
                        onClick={() => NEXT_STAGE[client.stage as Stage] && moveStage(client.id, NEXT_STAGE[client.stage as Stage]!)}
                        className="rounded-md bg-[#0344F0] px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0239c9] disabled:cursor-not-allowed disabled:opacity-30"
                      >avançar →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
