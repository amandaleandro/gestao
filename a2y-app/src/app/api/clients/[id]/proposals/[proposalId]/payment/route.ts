import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function canAccess(clientId: string, userId: string): Promise<boolean> {
  const [user, client] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.client.findUnique({ where: { id: clientId }, select: { assignedToId: true } }),
  ]);
  if (!user || !client) return false;
  return user.role === "ADMIN" || !client.assignedToId || client.assignedToId === userId;
}

function cleanUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString().slice(0, 1000) : null;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id, proposalId } = await params;
  if (!(await canAccess(id, session.userId))) {
    return NextResponse.json({ error: "Cliente não encontrado ou sem acesso." }, { status: 404 });
  }

  const proposal = await prisma.proposal.findFirst({
    where: { id: proposalId, clientId: id },
  });
  if (!proposal) return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });

  const body = await request.json();
  const markPaid = body.markPaid === true;
  const paymentUrl = body.paymentUrl === undefined ? undefined : cleanUrl(body.paymentUrl);

  if (body.paymentUrl && !paymentUrl) {
    return NextResponse.json({ error: "Use um link HTTPS válido para pagamento." }, { status: 400 });
  }

  if (markPaid && proposal.status !== "ACEITA") {
    return NextResponse.json({ error: "O pagamento só deve ser confirmado após o aceite da proposta." }, { status: 409 });
  }

  const now = new Date();
  const updated = await prisma.proposal.update({
    where: { id: proposal.id },
    data: {
      paymentUrl,
      paidAt: markPaid ? now : undefined,
    },
  });

  if (markPaid) {
    await prisma.$transaction([
      prisma.client.update({
        where: { id },
        data: { stage: "ONBOARDING", nextContactAt: now },
      }),
      prisma.onboarding.upsert({
        where: { clientId: id },
        update: { status: "EM_ANDAMENTO" },
        create: { clientId: id, status: "EM_ANDAMENTO", data: {} },
      }),
      prisma.activity.create({
        data: {
          clientId: id,
          type: "NOTA",
          content: `Pagamento da implantação confirmado para a proposta v${proposal.version}. Onboarding liberado.`,
        },
      }),
    ]);
  }

  return NextResponse.json(updated);
}
