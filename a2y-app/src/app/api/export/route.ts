import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

const STAGE_LABELS: Record<string, string> = {
  IMPORTADO: "Importado",
  NOVO: "Novo",
  CONTATADO: "Contatado",
  INTERESSADO: "Interessado",
  PROPOSTA_ENVIADA: "Proposta enviada",
  FECHADO_GANHO: "Fechado (ganho)",
  FECHADO_PERDIDO: "Fechado (perdido)",
};

export async function GET() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });

  const rows = clients.map((c) => ({
    Nome: c.name,
    Categoria: c.category ?? "",
    Telefone: c.phone ?? "",
    Email: c.email ?? "",
    Endereco: c.address ?? "",
    Cidade: c.city ?? "",
    Estado: c.state ?? "",
    Site: c.website ?? "",
    "Google Maps": c.googleMapsUrl ?? "",
    Avaliacao: c.rating ?? "",
    "Nº Avaliações": c.reviewsCount ?? "",
    Status: STAGE_LABELS[c.stage] ?? c.stage,
    "Próximo contato": c.nextContactAt ? c.nextContactAt.toISOString().slice(0, 10) : "",
    "Criado em": c.createdAt.toISOString().slice(0, 10),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="clientes_a2y_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`,
    },
  });
}
