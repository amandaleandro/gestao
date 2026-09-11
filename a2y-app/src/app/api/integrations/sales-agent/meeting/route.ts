import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function clean(value: unknown, max = 1600): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function authorized(request: NextRequest): boolean {
  const expected = process.env.A2Y_AGENT_WEBHOOK_TOKEN?.trim();
  if (!expected) return false;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const leadId = clean(body.leadId, 160);
  const meetingId = clean(body.meetingId, 160);
  const company = clean(body.company, 240);
  const phone = clean(body.phone, 80);
  const email = clean(body.email, 220).toLowerCase();
  const segment = clean(body.segment, 240);
  const city = clean(body.city, 180);
  const decisionMaker = clean(body.decisionMaker, 240);
  const problemHypothesis = clean(body.problemHypothesis, 1600);
  const evidence = clean(body.evidence, 1600);
  const meetingAt = parseDate(body.startAt);

  if (!leadId || !company || !meetingId || !meetingAt || (!phone && !email)) {
    return NextResponse.json({ error: "leadId, meetingId, empresa, horário e contato são obrigatórios." }, { status: 400 });
  }

  const externalId = `sales-agent:${leadId}`;
  const contextLines = [
    `Reunião marcada automaticamente pelo A2Y Sales Agent. Meeting ID: ${meetingId}.`,
    decisionMaker ? `Decisor/contato: ${decisionMaker}.` : null,
    problemHypothesis ? `Hipótese comercial: ${problemHypothesis}` : null,
    evidence ? `Evidência de pesquisa: ${evidence}` : null,
  ].filter(Boolean) as string[];

  const existing = await prisma.client.findFirst({
    where: {
      OR: [
        { externalId },
        ...(phone ? [{ phone }, { whatsapp: phone }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
  });

  const client = existing
    ? await prisma.client.update({
        where: { id: existing.id },
        data: {
          externalId: existing.externalId ?? externalId,
          name: company || existing.name,
          category: segment || existing.category,
          phone: phone || existing.phone,
          whatsapp: phone || existing.whatsapp,
          email: email || existing.email,
          city: city || existing.city,
          source: "A2Y_SALES_AGENT",
          stage: "REUNIAO_MARCADA",
          meetingAt,
          nextContactAt: meetingAt,
          notes: [existing.notes, ...contextLines].filter(Boolean).join("\n\n"),
        },
      })
    : await prisma.client.create({
        data: {
          externalId,
          name: company,
          category: segment || null,
          phone: phone || null,
          whatsapp: phone || null,
          email: email || null,
          city: city || null,
          source: "A2Y_SALES_AGENT",
          stage: "REUNIAO_MARCADA",
          meetingAt,
          nextContactAt: meetingAt,
          notes: contextLines.join("\n\n"),
        },
      });

  await prisma.activity.create({
    data: {
      clientId: client.id,
      type: "REUNIAO",
      content: `Reunião marcada pelo Sales Agent para ${meetingAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}. Meeting ID externo: ${meetingId}.`,
    },
  });

  return NextResponse.json({ ok: true, clientId: client.id });
}
