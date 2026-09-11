import { NextResponse } from "next/server";

interface LeadPayload {
  name?: string;
  company?: string;
  contact?: string;
  segment?: string;
  bottleneck?: string;
  source?: string;
}

function clean(value: unknown, max = 1000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const payload = {
    name: clean(body.name, 160),
    company: clean(body.company, 200),
    contact: clean(body.contact, 200),
    segment: clean(body.segment, 200),
    bottleneck: clean(body.bottleneck, 1600),
    source: "SITE_A2Y",
    receivedAt: new Date().toISOString(),
  };

  if (!payload.name || !payload.company || !payload.contact || !payload.bottleneck) {
    return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
  }

  const webhookUrl = process.env.A2Y_CRM_LEAD_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.error("[site] A2Y_CRM_LEAD_WEBHOOK_URL não configurado.");
    return NextResponse.json({ error: "Canal de contato temporariamente indisponível." }, { status: 503 });
  }

  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = process.env.A2Y_CRM_WEBHOOK_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`[site] CRM webhook respondeu ${response.status}.`);
    return NextResponse.json({ error: "Não foi possível registrar o contato." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
