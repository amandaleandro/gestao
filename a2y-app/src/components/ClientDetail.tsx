"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { buildWhatsappLink } from "@/lib/whatsapp";

interface Activity {
  id: string;
  type: string;
  content: string | null;
  fromStage: string | null;
  toStage: string | null;
  createdAt: string;
}

interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  category: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  rating: number | null;
  reviewsCount: number | null;
  notes: string | null;
  stage: string;
  nextContactAt: string | null;
  assignedToId: string | null;
  assignedTo: { id: string; name: string } | null;
  activities: Activity[];
  attachments: Attachment[];
}

interface TeamMember {
  id: string;
  name: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ACTIVITY_LABELS: Record<string, string> = {
  NOTA: "Nota",
  LIGACAO: "Ligação",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  REUNIAO: "Reunião",
  MUDANCA_ETAPA: "Mudança de etapa",
};

const STAGE_LABELS: Record<string, string> = {
  IMPORTADO: "Importado",
  NOVO: "Novo",
  CONTATADO: "Contatado",
  INTERESSADO: "Interessado",
  PROPOSTA_ENVIADA: "Proposta enviada",
  FECHADO_GANHO: "Fechado (ganho)",
  FECHADO_PERDIDO: "Fechado (perdido)",
};

export default function ClientDetail({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteType, setNoteType] = useState("NOTA");
  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [nextContact, setNextContact] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [savingAssignee, setSavingAssignee] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/clients/${clientId}`);
    const data = await res.json();
    setClient(data);
    setNextContact(data.nextContactAt ? data.nextContactAt.slice(0, 10) : "");
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : []))
      .then(setTeam)
      .catch(() => setTeam([]));
  }, []);

  async function handleAssigneeChange(assignedToId: string) {
    setSavingAssignee(true);
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: assignedToId || null }),
      });
      await load();
    } finally {
      setSavingAssignee(false);
    }
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/clients/${clientId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: noteType, content: noteContent }),
      });
      setNoteContent("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(`/api/clients/${clientId}/attachments`, {
        method: "POST",
        body: formData,
      });
      await load();
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    await fetch(`/api/attachments/${attachmentId}`, { method: "DELETE" });
    await load();
  }

  async function handleSaveNextContact() {
    await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nextContactAt: nextContact ? new Date(nextContact).toISOString() : null,
      }),
    });
    await load();
  }

  if (loading || !client) {
    return <p className="text-sm text-zinc-500">Carregando...</p>;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-teal-800">
        ← Voltar
      </Link>

      <div className="rounded-2xl border border-slate-200 border-l-4 border-l-teal-700 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Detalhes do cliente</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{client.category ?? "Sem categoria"}</p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
            {STAGE_LABELS[client.stage] ?? client.stage}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 sm:grid-cols-2">
          <p className="rounded-lg bg-slate-50 px-3 py-2">📞 {client.phone ?? "Telefone não informado"}</p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">
            ⭐ {client.rating ?? "—"}{" "}
            {client.reviewsCount ? `(${client.reviewsCount} avaliações)` : ""}
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">
            📍{" "}
            {[client.address, client.city, client.state].filter(Boolean).join(", ") ||
              "Endereço não informado"}
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">
            🌐{" "}
            {client.website ? (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                site
              </a>
            ) : (
              "Site não informado"
            )}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {client.phone && (
            <a
              href={buildWhatsappLink(
                client.phone,
                `Olá ${client.name}, aqui é da A2Y Tecnologia!`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              Chamar no WhatsApp
            </a>
          )}
          {client.googleMapsUrl && (
            <a
              href={client.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              Ver no Google Maps
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Responsável
        </h2>
        <select
          value={client.assignedToId ?? ""}
          onChange={(e) => handleAssigneeChange(e.target.value)}
          disabled={savingAssignee}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-teal-600 focus:ring-2"
        >
          <option value="">Sem responsável</option>
          {team.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Próximo contato
        </h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={nextContact}
            onChange={(e) => setNextContact(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-teal-600 focus:ring-2"
          />
          <button
            onClick={handleSaveNextContact}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Salvar
          </button>
        </div>
      </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Adicionar atividade
        </h2>
        <form onSubmit={handleAddActivity} className="flex flex-col gap-2">
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-teal-600 focus:ring-2"
          >
            {Object.entries(ACTIVITY_LABELS)
              .filter(([key]) => key !== "MUDANCA_ETAPA")
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="O que aconteceu?"
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-teal-600 placeholder:text-slate-400 focus:ring-2"
          />
          <button
            type="submit"
            disabled={saving}
            className="self-start rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar atividade"}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Anexos
          </h2>
          <label className="cursor-pointer rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
            {uploadingFile ? "Enviando..." : "Anexar arquivo"}
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploadingFile}
            />
          </label>
        </div>
        <div className="flex flex-col gap-2">
          {client.attachments.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhum arquivo anexado ainda.</p>
          )}
          {client.attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
            >
              <a
                href={`/api/attachments/${att.id}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {att.fileName}
              </a>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{formatFileSize(att.size)}</span>
                <button
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="text-red-600 hover:underline"
                >
                  remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Histórico
        </h2>
        <div className="flex flex-col gap-3">
          {client.activities.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhuma atividade registrada ainda.</p>
          )}
          {client.activities.map((activity) => (
            <div
              key={activity.id}
              className="border-l-2 border-zinc-200 pl-3 text-sm dark:border-zinc-700"
            >
              <p className="font-medium text-zinc-800 dark:text-zinc-100">
                {ACTIVITY_LABELS[activity.type] ?? activity.type}
                {activity.type === "MUDANCA_ETAPA" &&
                  ` — ${STAGE_LABELS[activity.fromStage ?? ""] ?? activity.fromStage} → ${
                    STAGE_LABELS[activity.toStage ?? ""] ?? activity.toStage
                  }`}
              </p>
              {activity.content && (
                <p className="text-zinc-600 dark:text-zinc-300">{activity.content}</p>
              )}
              <p className="text-xs text-zinc-400">
                {new Date(activity.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
