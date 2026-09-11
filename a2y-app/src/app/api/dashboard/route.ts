import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WON_STAGES = ["FECHADO_GANHO", "ONBOARDING", "IMPLANTACAO", "ATIVO"] as const;

export async function GET() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    byStage,
    byCategory,
    lostCount,
    closedWon,
    closedThisMonth,
    totalClients,
    overdueCount,
    revenue,
    receivedRevenue,
    activeClients,
    proposals,
  ] = await Promise.all([
    prisma.client.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.client.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { _count: { category: "desc" } },
      take: 10,
    }),
    prisma.client.count({ where: { stage: "FECHADO_PERDIDO" } }),
    prisma.client.count({ where: { stage: { in: [...WON_STAGES] } } }),
    prisma.client.count({
      where: {
        stage: { in: [...WON_STAGES] },
        closedAt: { gte: monthStart },
      },
    }),
    prisma.client.count(),
    prisma.client.count({
      where: {
        nextContactAt: { lt: new Date() },
        stage: { notIn: ["FECHADO_PERDIDO", "ATIVO"] },
      },
    }),
    prisma.client.aggregate({
      where: { stage: { in: [...WON_STAGES] } },
      _sum: { opportunityValue: true, recurringValue: true },
    }),
    prisma.proposal.aggregate({
      where: { status: "ACEITA", paidAt: { not: null } },
      _sum: { setupPrice: true },
    }),
    prisma.client.count({ where: { stage: "ATIVO" } }),
    prisma.proposal.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const totalDecided = closedWon + lostCount;
  const conversionRate = totalDecided > 0 ? (closedWon / totalDecided) * 100 : 0;

  return NextResponse.json({
    byStage: byStage.map((stage) => ({ stage: stage.stage, count: stage._count._all })),
    byCategory: byCategory
      .filter((category) => category.category)
      .map((category) => ({ category: category.category, count: category._count._all })),
    proposals: proposals.map((proposal) => ({ status: proposal.status, count: proposal._count._all })),
    conversionRate,
    closedWon,
    closedThisMonth,
    totalClients,
    activeClients,
    overdueCount,
    soldRevenue: revenue._sum.opportunityValue ?? 0,
    receivedRevenue: receivedRevenue._sum.setupPrice ?? 0,
    mrr: revenue._sum.recurringValue ?? 0,
  });
}
