import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });

  const rows = clients.map((client) => ({
    Nome: client.name,
    Categoria: client.category ?? "",
    Telefone: client.phone ?? "",
    Email: client.email ?? "",
    Endereco: client.address ?? "",
    Cidade: client.city ?? "",
    Estado: client.state ?? "",
    Site: client.website ?? "",
    "Google Maps": client.googleMapsUrl ?? "",
    Avaliacao: client.rating ?? "",
    "Nº Avaliações": client.reviewsCount ?? "",
    Origem: client.source,
    Status: STAGE_LABELS[client.stage] ?? client.stage,
    "Reunião": client.meetingAt ? client.meetingAt.toISOString() : "",
    "Valor implantação": client.opportunityValue ?? "",
    "MRR": client.recurringValue ?? "",
    "Fechado em": client.closedAt ? client.closedAt.toISOString().slice(0, 10) : "",
    "Motivo de perda": client.lostReason ?? "",
    "Próximo contato": client.nextContactAt ? client.nextContactAt.toISOString().slice(0, 10) : "",
    "Criado em": client.createdAt.toISOString().slice(0, 10),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="clientes_a2y_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
