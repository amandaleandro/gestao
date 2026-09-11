import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  ImplementationStatus,
  OnboardingStatus,
  ProposalStatus,
  StageStatus,
} from "@/generated/prisma/enums";

async function requireSession() {
  const session = await getSession();
  return session ?? null;
}

async function canAccessClient(clientId: string, userId: string): Promise<boolean> {
  const [user, client] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.client.findUnique({ where: { id: clientId }, select: { assignedToId: true } }),
  ]);
  if (!user || !client) return false;
  return user.role === "ADMIN" || !client.assignedToId || client.assignedToId === userId;
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

function integer(value: unknown): number | null {
  const parsed = num(value);
  return parsed === null ? null : Math.max(0, Math.round(parsed));
}

function date(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isEnumValue<T extends Record<string, string>>(enumObject: T, value: unknown): value is T[keyof T] {
  return typeof value === "string" && value in enumObject;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  if (!(await canAccessClient(id, session.userId))) {
    return NextResponse.json({ error: "Cliente não encontrado ou sem acesso." }, { status: 404 });
  }

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
  if (!(await canAccessClient(id, session.userId))) {
    return NextResponse.json({ error: "Cliente não encontrado ou sem acesso." }, { status: 404 });
  }

  const body = await request.json();
  const section = body.section;

  if (section === "opportunity") {
    if (body.stage !== undefined && !isEnumValue(StageStatus, body.stage)) {
      return NextResponse.json({ error: "Etapa inválida." }, { status: 400 });
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        meetingAt: body.meetingAt === undefined ? undefined : date(body.meetingAt),
        opportunityValue: body.opportunityValue === undefined ? undefined : num(body.opportunityValue),
        recurringValue: body.recurringValue === undefined ? undefined : num(body.recurringValue),
        lostReason: body.lostReason === undefined ? undefined : str(body.lostReason, 1200),
        closedAt: body.closedAt === undefined ? undefined : date(body.closedAt),
        stage: body.stage === undefined ? undefined : body.stage,
      },
    });
    return NextResponse.json(updated);
  }

  if (section === "diagnosis") {
    const monthlyLeadVolume = integer(body.monthlyLeadVolume);
    const teamSize = integer(body.teamSize);
    const diagnosisData = {
      leadSource: str(body.leadSource, 300),
      monthlyLeadVolume,
      channels: str(body.channels, 1000),
      teamSize,
      currentControl: str(body.currentControl, 2000),
      quoteProcess: str(body.quoteProcess, 3000),
      followUpProcess: str(body.followUpProcess, 3000),
      averageTicket: num(body.averageTicket),
      bottlenecks: str(body.bottlenecks, 5000),
      priority: str(body.priority, 1000),
      recommendedSolution: str(body.recommendedSolution, 5000),
    };

    const diagnosis = await prisma.diagnosis.upsert({
      where: { clientId: id },
      update: { ...diagnosisData, completedAt: body.completed ? new Date() : undefined },
      create: { clientId: id, ...diagnosisData, completedAt: body.completed ? new Date() : null },
    });

    if (body.completed) {
      await prisma.client.update({ where: { id }, data: { stage: "DIAGNOSTICO_REALIZADO" } });
    }
    return NextResponse.json(diagnosis);
  }

  if (section === "proposal") {
    const proposalId = str(body.proposalId, 100);
    if (!proposalId) return NextResponse.json({ error: "proposalId é obrigatório." }, { status: 400 });
    if (body.status !== undefined && !isEnumValue(ProposalStatus, body.status)) {
      return NextResponse.json({ error: "Status de proposta inválido." }, { status: 400 });
    }

    const belongsToClient = await prisma.proposal.findFirst({ where: { id: proposalId, clientId: id }, select: { id: true } });
    if (!belongsToClient) return NextResponse.json({ error: "Proposta não encontrada." }, { status: 404 });

    const status = body.status as ProposalStatus | undefined;
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
        status,
        sentAt: status === "ENVIADA" ? now : undefined,
        viewedAt: status === "VISUALIZADA" ? now : undefined,
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
    if (status === "RECUSADA") {
      await prisma.client.update({
        where: { id },
        data: { stage: "FECHADO_PERDIDO", lostReason: str(body.rejectionNote, 2000), closedAt: now },
      });
    }
    return NextResponse.json(proposal);
  }

  if (section === "onboarding") {
    if (body.status !== undefined && !isEnumValue(OnboardingStatus, body.status)) {
      return NextResponse.json({ error: "Status de onboarding inválido." }, { status: 400 });
    }
    const status = (body.status ?? "EM_ANDAMENTO") as OnboardingStatus;
    const onboarding = await prisma.onboarding.upsert({
      where: { clientId: id },
      update: {
        status,
        data: body.data ?? undefined,
        completedAt: status === "CONCLUIDO" ? new Date() : undefined,
      },
      create: {
        clientId: id,
        status,
        data: body.data ?? {},
        completedAt: status === "CONCLUIDO" ? new Date() : null,
      },
    });
    await prisma.client.update({ where: { id }, data: { stage: status === "CONCLUIDO" ? "IMPLANTACAO" : "ONBOARDING" } });
    return NextResponse.json(onboarding);
  }

  if (section === "implementation") {
    if (body.status !== undefined && !isEnumValue(ImplementationStatus, body.status)) {
      return NextResponse.json({ error: "Status de implantação inválido." }, { status: 400 });
    }
    const status = (body.status ?? "PLANEJADA") as ImplementationStatus;
    const implementation = await prisma.implementation.upsert({
      where: { clientId: id },
      update: {
        status,
        checklist: body.checklist ?? undefined,
        metricsBefore: body.metricsBefore ?? undefined,
        metricsAfter: body.metricsAfter ?? undefined,
        caseConsent: body.caseConsent === undefined ? undefined : Boolean(body.caseConsent),
        caseAnonymous: body.caseAnonymous === undefined ? undefined : Boolean(body.caseAnonymous),
        caseNotes: body.caseNotes === undefined ? undefined : str(body.caseNotes, 4000),
        startedAt: body.startedAt === undefined ? undefined : date(body.startedAt),
        dueAt: body.dueAt === undefined ? undefined : date(body.dueAt),
        completedAt: status === "CONCLUIDA" ? new Date() : undefined,
      },
      create: {
        clientId: id,
        status,
        checklist: body.checklist ?? [],
        metricsBefore: body.metricsBefore ?? null,
        metricsAfter: body.metricsAfter ?? null,
        caseConsent: body.caseConsent === undefined ? null : Boolean(body.caseConsent),
        caseAnonymous: Boolean(body.caseAnonymous),
        caseNotes: str(body.caseNotes, 4000),
        startedAt: date(body.startedAt),
        dueAt: date(body.dueAt),
        completedAt: status === "CONCLUIDA" ? new Date() : null,
      },
    });
    await prisma.client.update({ where: { id }, data: { stage: status === "CONCLUIDA" ? "ATIVO" : "IMPLANTACAO" } });
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
  if (!(await canAccessClient(id, session.userId))) {
    return NextResponse.json({ error: "Cliente não encontrado ou sem acesso." }, { status: 404 });
  }

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
