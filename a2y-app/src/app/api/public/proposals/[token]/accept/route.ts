import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function clean(value: unknown, max = 240): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const name = clean(body.name, 180);
  const email = clean(body.email, 220).toLowerCase();
  const acceptedTerms = body.acceptedTerms === true;

  if (name.length < 2 || !validEmail(email) || !acceptedTerms) {
    return NextResponse.json({ error: "Informe nome, e-mail válido e confirme o aceite." }, { status: 400 });
  }

  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: token },
    include: { client: true },
  });

  if (!proposal) return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });

  if (proposal.status === "ACEITA") {
    return NextResponse.json({
      ok: true,
      alreadyAccepted: true,
      acceptedAt: proposal.acceptedAt,
      paid: Boolean(proposal.paidAt),
      paymentUrl: proposal.paymentUrl,
    });
  }

  if (["RECUSADA", "EXPIRADA"].includes(proposal.status)) {
    return NextResponse.json({ error: "Esta proposta não está disponível para aceite." }, { status: 409 });
  }

  if (proposal.status === "RASCUNHO") {
    return NextResponse.json({ error: "Esta proposta ainda não foi enviada pela A2Y." }, { status: 409 });
  }

  const now = new Date();
  if (proposal.validUntil && proposal.validUntil < now) {
    await prisma.proposal.update({ where: { id: proposal.id }, data: { status: "EXPIRADA" } });
    return NextResponse.json({ error: "A validade desta proposta expirou. Fale com a A2Y para uma nova versão." }, { status: 410 });
  }

  await prisma.$transaction([
    prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        status: "ACEITA",
        acceptedAt: now,
        acceptedTermsAt: now,
        acceptanceName: name,
        acceptanceEmail: email,
      },
    }),
    prisma.client.update({
      where: { id: proposal.clientId },
      data: {
        stage: "FECHADO_GANHO",
        closedAt: now,
        opportunityValue: proposal.setupPrice,
        recurringValue: proposal.monthlyPrice,
        email: proposal.client.email ?? email,
      },
    }),
    prisma.activity.create({
      data: {
        clientId: proposal.clientId,
        type: "NOTA",
        content: `Proposta v${proposal.version} aceita por ${name} (${email}). Aguardando confirmação do pagamento da implantação.`,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    acceptedAt: now.toISOString(),
    paid: Boolean(proposal.paidAt),
    paymentUrl: proposal.paymentUrl,
  });
}
