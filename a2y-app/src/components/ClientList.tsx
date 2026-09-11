"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildWhatsappLink } from "@/lib/whatsapp";

interface Client {
  id: string;
  name: string;
  category: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  rating: number | null;
  reviewsCount: number | null;
  stage: string;
  createdAt: string;
  assignedToId: string | null;
  assignedTo: { id: string; name: string } | null;
  activities: { createdAt: string }[];
}

interface TeamMember {
  id: string;
  name: string;
}

const STAGE_FILTERS = [
  ["", "Todos os status"],
  ["IMPORTADO", "Importado"],
  ["NOVO", "Novo"],
  ["CONTATADO", "Contatado"],
  ["INTERESSADO", "Interessado"],
  ["REUNIAO_MARCADA", "Reunião marcada"],
  ["DIAGNOSTICO_REALIZADO", "Diagnóstico realizado"],
  ["PROPOSTA_ENVIADA", "Proposta enviada"],
  ["NEGOCIACAO", "Negociação"],
  ["FECHADO_GANHO", "Fechado (ganho)"],
  ["FECHADO_PERDIDO", "Fechado (perdido)"],
  ["ONBOARDING", "Onboarding"],
  ["IMPLANTACAO", "Implantação"],
  ["ATIVO", "Cliente ativo"],
] as const;

const STAGE_LABELS: Record<string, string> = Object.fromEntries(STAGE_FILTERS.filter(([key]) => key));

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (stageFilter) params.set("stage", stageFilter);
    if (overdueOnly) params.set("overdue", "true");
    const res = await fetch(`/api/clients?${params.toString()}`);
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }, [overdueOnly, search, stageFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadClients(), 0);
    return () => window.clearTimeout(timer);
  }, [loadClients]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : []))
      .then(setTeam)
      .catch(() => setTeam([]));
  }, []);

  async function handleAssign(clientId: string, assignedToId: string) {
    setAssigningId(clientId);
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: assignedToId || null }),
      });
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? {
                ...c,
                assignedToId: assignedToId || null,
                assignedTo: team.find((t) => t.id === assignedToId) ?? null,
              }
            : c
        )
      );
    } finally {
      setAssigningId(null);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setImportMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setImportMessage(`Erro: ${data.error}`);
      } else {
        setImportMessage(
          `Importado: ${data.importedRows} de ${data.totalRows} linhas. ${
            data.duplicatesSkipped > 0 ? `${data.duplicatesSkipped} duplicadas. ` : ""
          }${data.skippedRows > 0 ? `${data.skippedRows} ignoradas.` : ""}`
        );
        await loadClients();
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function sendToKanban(clientId: string) {
    setSendingId(clientId);
    try {
      await fetch(`/api/clients/${clientId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "NOVO" }),
      });
      await loadClients();
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mr-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">Base comercial</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Contatos, oportunidades e clientes</h2>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
          {uploading ? "Importando..." : "Importar planilha do Google Maps"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        <input
          type="text"
          placeholder="Buscar por empresa, contato ou cidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-600 placeholder:text-slate-400 focus:ring-2 sm:w-64"
        />

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-teal-600 focus:ring-2 sm:w-52"
          aria-label="Filtrar por status"
        >
          {STAGE_FILTERS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
            className="h-4 w-4 accent-teal-700"
          />
          Só atrasados
        </label>

        {importMessage && <span className="basis-full text-sm text-slate-600">{importMessage}</span>}

        <a href="/api/export" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Exportar Excel</a>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Nome</th><th className="px-3 py-2">Categoria</th><th className="px-3 py-2">Telefone</th><th className="px-3 py-2"></th><th className="px-3 py-2">Endereço</th><th className="px-3 py-2">Avaliação</th><th className="px-3 py-2">Site</th><th className="px-3 py-2">Maps</th><th className="px-3 py-2">Responsável</th><th className="px-3 py-2">Último contato</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-zinc-900"><Link href={`/clients/${client.id}`} className="text-teal-800 hover:underline">{client.name}</Link></td>
                  <td className="px-3 py-2 text-zinc-600">{client.category ?? "—"}</td>
                  <td className="px-3 py-2 text-zinc-600">{client.phone ?? "—"}</td>
                  <td className="px-3 py-2">{client.phone ? <a href={buildWhatsappLink(client.phone)} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-green-600 hover:underline">WhatsApp</a> : "—"}</td>
                  <td className="px-3 py-2 text-zinc-600">{[client.address, client.city, client.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-3 py-2 text-zinc-600">{client.rating ? `⭐ ${client.rating}` : "—"}{client.reviewsCount ? ` (${client.reviewsCount})` : ""}</td>
                  <td className="px-3 py-2 text-zinc-600">{client.website ? <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">site</a> : "—"}</td>
                  <td className="px-3 py-2 text-zinc-600">{client.googleMapsUrl ? <a href={client.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">maps</a> : "—"}</td>
                  <td className="px-3 py-2">
                    <select value={client.assignedToId ?? ""} onChange={(e) => handleAssign(client.id, e.target.value)} disabled={assigningId === client.id} className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700">
                      <option value="">Sem responsável</option>{team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-zinc-600">{client.activities[0] ? new Date(client.activities[0].createdAt).toLocaleDateString("pt-BR") : "—"}</td>
                  <td className="px-3 py-2"><span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{STAGE_LABELS[client.stage] ?? client.stage.replaceAll("_", " ")}</span></td>
                  <td className="px-3 py-2">{client.stage === "IMPORTADO" ? <button onClick={() => sendToKanban(client.id)} disabled={sendingId === client.id} className="whitespace-nowrap rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50">{sendingId === client.id ? "Enviando..." : "Enviar para o Kanban"}</button> : <span className="text-xs text-zinc-400">No fluxo</span>}</td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan={12} className="px-3 py-6 text-center text-zinc-500">Nenhum contato encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
