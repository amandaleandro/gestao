import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: token },
    select: { id: true, status: true, viewedAt: true, validUntil: true },
  });

  if (!proposal) return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });

  const now = new Date();
  if (proposal.validUntil && proposal.validUntil < now && !["ACEITA", "RECUSADA"].includes(proposal.status)) {
    await prisma.proposal.update({ where: { id: proposal.id }, data: { status: "EXPIRADA" } });
    return NextResponse.json({ ok: true, status: "EXPIRADA" });
  }

  if (proposal.status === "ENVIADA") {
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "VISUALIZADA", viewedAt: proposal.viewedAt ?? now },
    });
    return NextResponse.json({ ok: true, status: "VISUALIZADA" });
  }

  return NextResponse.json({ ok: true, status: proposal.status });
}
