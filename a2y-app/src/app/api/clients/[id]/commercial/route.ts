import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireSession() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

function str(value: unknown, max = 5000): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().slice(0, max);
  return clean || null;
}

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function date(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      diagnosis: true,
      proposals: { orderBy: { createdAt: "desc" } },
      onboarding: true,
      implementation: true,
    },
  });

  if (!client) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

  return NextResponse.json({
    opportunity: {
      stage: client.stage,
      meetingAt: client.meetingAt,
      opportunityValue: client.opportunityValue,
      recurringValue: client.recurringValue,
      closedAt: client.closedAt,
      lostReason: client.lostReason,
      source: client.source,
    },
    diagnosis: client.diagnosis,
    proposals: client.proposals,
    onboarding: client.onboarding,
    implementation: client.implementation,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } });
  if (!client) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

  const body = await request.json();
  const section = body.section;

  if (section === "opportunity") {
    const updated = await prisma.client.update({
      where: { id },
      data: {
        meetingAt: body.meetingAt === undefined ? undefined : date(body.meetingAt),
        opportunityValue: body.opportunityValue === undefined ? undefined : num(body.opportunityValue),
        recurringValue: body.recurringValue === undefined ? undefined : num(body.recurringValue),
        lostReason: body.lostReason === undefined ? undefined : str(body.lostReason, 1200),
        closedAt: body.closedAt === undefined ? undefined : date(body.closedAt),
        stage: body.stage || undefined,
      },
    });
    return NextResponse.json(updated);
  }

  if (section === "diagnosis") {
    const diagnosis = await prisma.diagnosis.upsert({
      where: { clientId: id },
      update: {
        leadSource: str(body.leadSource, 300),
        monthlyLeadVolume: num(body.monthlyLeadVolume) === null ? null : Math.round(num(body.monthlyLeadVolume)!),
        channels: str(body.channels, 1000),
        teamSize: num(body.teamSize) === null ? null : Math.round(num(body.teamSize)!),
        currentControl: str(body.currentControl, 2000),
        quoteProcess: str(body.quoteProcess, 3000),
        followUpProcess: str(body.followUpProcess, 3000),
        averageTicket: num(body.averageTicket),
        bottlenecks: str(body.bottlenecks, 5000),
        priority: str(body.priority, 1000),
        recommendedSolution: str(body.recommendedSolution, 5000),
        completedAt: body.completed ? new Date() : undefined,
      },
      create: {
        clientId: id,
        leadSource: str(body.leadSource, 300),
        monthlyLeadVolume: num(body.monthlyLeadVolume) === null ? null : Math.round(num(body.monthlyLeadVolume)!),
        channels: str(body.channels, 1000),
        teamSize: num(body.teamSize) === null ? null : Math.round(num(body.teamSize)!),
        currentControl: str(body.currentControl, 2000),
        quoteProcess: str(body.quoteProcess, 3000),
        followUpProcess: str(body.followUpProcess, 3000),
        averageTicket: num(body.averageTicket),
        bottlenecks: str(body.bottlenecks, 5000),
        priority: str(body.priority, 1000),
        recommendedSolution: str(body.recommendedSolution, 5000),
        completedAt: body.completed ? new Date() : null,
      },
    });

    if (body.completed) {
      await prisma.client.update({ where: { id }, data: { stage: "DIAGNOSTICO_REALIZADO" } });
    }
    return NextResponse.json(diagnosis);
  }

  if (section === "proposal") {
    const proposalId = str(body.proposalId, 100);
    if (!proposalId) return NextResponse.json({ error: "proposalId é obrigatório." }, { status: 400 });

    const status = body.status as string | undefined;
    const now = new Date();
    const proposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        title: body.title === undefined ? undefined : str(body.title, 300) ?? "Proposta A2Y",
        context: body.context === undefined ? undefined : str(body.context),
        problems: body.problems === undefined ? undefined : str(body.problems),
        solution: body.solution === undefined ? undefined : str(body.solution),
        scope: body.scope === undefined ? undefined : str(body.scope),
        exclusions: body.exclusions === undefined ? undefined : str(body.exclusions),
        timeline: body.timeline === undefined ? undefined : str(body.timeline, 1500),
        setupPrice: body.setupPrice === undefined ? undefined : num(body.setupPrice),
        monthlyPrice: body.monthlyPrice === undefined ? undefined : num(body.monthlyPrice),
        validUntil: body.validUntil === undefined ? undefined : date(body.validUntil),
        status: status as never,
        sentAt: status === "ENVIADA" ? now : undefined,
        acceptedAt: status === "ACEITA" ? now : undefined,
        rejectedAt: status === "RECUSADA" ? now : undefined,
        rejectionNote: body.rejectionNote === undefined ? undefined : str(body.rejectionNote, 2000),
      },
    });

    if (status === "ENVIADA") await prisma.client.update({ where: { id }, data: { stage: "PROPOSTA_ENVIADA" } });
    if (status === "ACEITA") {
      await prisma.$transaction([
        prisma.client.update({
          where: { id },
          data: {
            stage: "FECHADO_GANHO",
            closedAt: now,
            opportunityValue: proposal.setupPrice,
            recurringValue: proposal.monthlyPrice,
          },
        }),
        prisma.onboarding.upsert({
          where: { clientId: id },
          update: { status: "EM_ANDAMENTO" },
          create: { clientId: id, status: "EM_ANDAMENTO", data: {} },
        }),
      ]);
    }
    return NextResponse.json(proposal);
  }

  if (section === "onboarding") {
    const onboarding = await prisma.onboarding.upsert({
      where: { clientId: id },
      update: {
        status: body.status || undefined,
        data: body.data ?? undefined,
        completedAt: body.status === "CONCLUIDO" ? new Date() : undefined,
      },
      create: {
        clientId: id,
        status: body.status || "EM_ANDAMENTO",
        data: body.data ?? {},
        completedAt: body.status === "CONCLUIDO" ? new Date() : null,
      },
    });
    await prisma.client.update({ where: { id }, data: { stage: body.status === "CONCLUIDO" ? "IMPLANTACAO" : "ONBOARDING" } });
    return NextResponse.json(onboarding);
  }

  if (section === "implementation") {
    const implementation = await prisma.implementation.upsert({
      where: { clientId: id },
      update: {
        status: body.status || undefined,
        checklist: body.checklist ?? undefined,
        metricsBefore: body.metricsBefore ?? undefined,
        metricsAfter: body.metricsAfter ?? undefined,
        caseConsent: body.caseConsent === undefined ? undefined : Boolean(body.caseConsent),
        caseAnonymous: body.caseAnonymous === undefined ? undefined : Boolean(body.caseAnonymous),
        caseNotes: body.caseNotes === undefined ? undefined : str(body.caseNotes, 4000),
        startedAt: body.startedAt === undefined ? undefined : date(body.startedAt),
        dueAt: body.dueAt === undefined ? undefined : date(body.dueAt),
        completedAt: body.status === "CONCLUIDA" ? new Date() : undefined,
      },
      create: {
        clientId: id,
        status: body.status || "PLANEJADA",
        checklist: body.checklist ?? [],
        metricsBefore: body.metricsBefore ?? null,
        metricsAfter: body.metricsAfter ?? null,
        caseConsent: body.caseConsent === undefined ? null : Boolean(body.caseConsent),
        caseAnonymous: Boolean(body.caseAnonymous),
        caseNotes: str(body.caseNotes, 4000),
        startedAt: date(body.startedAt),
        dueAt: date(body.dueAt),
        completedAt: body.status === "CONCLUIDA" ? new Date() : null,
      },
    });
    await prisma.client.update({ where: { id }, data: { stage: body.status === "CONCLUIDA" ? "ATIVO" : "IMPLANTACAO" } });
    return NextResponse.json(implementation);
  }

  return NextResponse.json({ error: "Seção inválida." }, { status: 400 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  if (body.action !== "create-proposal") {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id }, include: { diagnosis: true } });
  if (!client) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

  const last = await prisma.proposal.findFirst({ where: { clientId: id }, orderBy: { version: "desc" } });
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  const proposal = await prisma.proposal.create({
    data: {
      clientId: id,
      version: (last?.version ?? 0) + 1,
      title: `A2Y Atendimento & Vendas — ${client.name}`,
      context: client.diagnosis?.bottlenecks ?? client.notes,
      problems: client.diagnosis?.bottlenecks,
      solution: client.diagnosis?.recommendedSolution ?? "Organização de leads, orçamentos e follow-up com visibilidade da operação comercial.",
      scope: "Diagnóstico final, configuração do pipeline, organização de oportunidades, regras de follow-up, automações padrão, dashboard e treinamento inicial.",
      exclusions: "ERP completo, desenvolvimento de aplicativo próprio, integrações complexas ou funcionalidades exclusivas fora do escopo acordado.",
      timeline: "Implantação estimada em 7 a 10 dias úteis após onboarding e disponibilização dos acessos necessários.",
      setupPrice: 1490,
      monthlyPrice: 397,
      validUntil,
    },
  });

  return NextResponse.json(proposal, { status: 201 });
}
