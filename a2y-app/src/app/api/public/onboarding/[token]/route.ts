import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_CHECKLIST = [
  { title: "Dia 1 — validar briefing e mapear processo", done: false },
  { title: "Dia 2 — configurar pipeline, usuários e campos", done: false },
  { title: "Dia 3 — conectar canais e organizar dados", done: false },
  { title: "Dia 4 — configurar follow-up e alertas", done: false },
  { title: "Dia 5 — implementar automações previstas no escopo", done: false },
  { title: "Dia 6 — validar dashboard e indicadores", done: false },
  { title: "Dia 7 — QA, treinamento e aceite da implantação", done: false },
];

const ALLOWED_FIELDS = [
  "team",
  "channels",
  "services",
  "salesStages",
  "faq",
  "tools",
  "integrations",
  "objective",
] as const;

function sanitizeData(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  const output: Record<string, string> = {};
  for (const field of ALLOWED_FIELDS) {
    const item = raw[field];
    output[field] = typeof item === "string" ? item.trim().slice(0, 5000) : "";
  }
  return output;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: token },
    select: { id: true, clientId: true, status: true },
  });

  if (!proposal) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
  if (proposal.status !== "ACEITA") {
    return NextResponse.json({ error: "O onboarding fica disponível após o aceite da proposta." }, { status: 403 });
  }

  const body = await request.json();
  const data = sanitizeData(body.data);
  const completed = body.completed === true;
  const now = new Date();

  const onboarding = await prisma.onboarding.upsert({
    where: { clientId: proposal.clientId },
    update: {
      status: completed ? "CONCLUIDO" : "EM_ANDAMENTO",
      data,
      completedAt: completed ? now : undefined,
    },
    create: {
      clientId: proposal.clientId,
      status: completed ? "CONCLUIDO" : "EM_ANDAMENTO",
      data,
      completedAt: completed ? now : null,
    },
  });

  if (completed) {
    await prisma.$transaction([
      prisma.client.update({
        where: { id: proposal.clientId },
        data: { stage: "IMPLANTACAO", nextContactAt: now },
      }),
      prisma.implementation.upsert({
        where: { clientId: proposal.clientId },
        update: {},
        create: {
          clientId: proposal.clientId,
          status: "PLANEJADA",
          checklist: DEFAULT_CHECKLIST,
        },
      }),
      prisma.activity.create({
        data: {
          clientId: proposal.clientId,
          type: "NOTA",
          content: "Onboarding concluído pelo cliente. Implantação liberada para planejamento.",
        },
      }),
    ]);
  } else {
    await prisma.client.update({ where: { id: proposal.clientId }, data: { stage: "ONBOARDING" } });
  }

  return NextResponse.json({ ok: true, status: onboarding.status });
}
