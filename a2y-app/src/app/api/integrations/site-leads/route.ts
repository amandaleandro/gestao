import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function text(value: unknown, max = 1000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function authorized(request: NextRequest): boolean {
  const expected = process.env.A2Y_SITE_WEBHOOK_TOKEN?.trim();
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${expected}`;
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

  const name = text(body.name, 160);
  const company = text(body.company, 200);
  const contact = text(body.contact, 200);
  const segment = text(body.segment, 200);
  const bottleneck = text(body.bottleneck, 1600);
  const source = text(body.source, 80) || "SITE_A2Y";

  if (!name || !company || !contact || !bottleneck) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  const isEmail = contact.includes("@");
  const phone = isEmail ? null : contact;
  const email = isEmail ? contact.toLowerCase() : null;

  const existing = await prisma.client.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }, { whatsapp: phone }] : []),
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    const updated = await prisma.client.update({
      where: { id: existing.id },
      data: {
        name: existing.name || company,
        category: segment || existing.category,
        source,
        stage: existing.stage === "IMPORTADO" ? "NOVO" : existing.stage,
        notes: [existing.notes, `Contato pelo site — ${name}: ${bottleneck}`].filter(Boolean).join("\n\n"),
        nextContactAt: existing.nextContactAt ?? new Date(),
      },
    });

    await prisma.activity.create({
      data: {
        clientId: existing.id,
        type: "NOTA",
        content: `Novo diagnóstico recebido pelo site (${name}). Gargalo informado: ${bottleneck}`,
      },
    });

    return NextResponse.json({ ok: true, clientId: updated.id, deduplicated: true });
  }

  const client = await prisma.client.create({
    data: {
      name: company,
      category: segment || null,
      phone,
      whatsapp: phone,
      email,
      source,
      stage: "NOVO",
      nextContactAt: new Date(),
      notes: `Contato pelo site — responsável: ${name}\nGargalo informado: ${bottleneck}`,
      activities: {
        create: {
          type: "NOTA",
          content: `Diagnóstico solicitado pelo site. Responsável: ${name}. Gargalo informado: ${bottleneck}`,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, clientId: client.id, deduplicated: false }, { status: 201 });
}
