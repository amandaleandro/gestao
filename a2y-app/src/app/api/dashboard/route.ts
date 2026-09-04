import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [byStage, byCategory, totalClosed, closedWon, closedThisMonth, totalClients, overdueCount] = await Promise.all([
    prisma.client.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.client.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { _count: { category: "desc" } },
      take: 10,
    }),
    prisma.client.count({
      where: { stage: { in: ["FECHADO_GANHO", "FECHADO_PERDIDO"] } },
    }),
    prisma.client.count({ where: { stage: "FECHADO_GANHO" } }),
    prisma.client.count({
      where: {
        stage: "FECHADO_GANHO",
        updatedAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
    prisma.client.count(),
    prisma.client.count({
      where: {
        nextContactAt: { lt: new Date() },
        stage: { notIn: ["FECHADO_GANHO", "FECHADO_PERDIDO"] },
      },
    }),
  ]);

  const conversionRate = totalClosed > 0 ? (closedWon / totalClosed) * 100 : 0;

  return NextResponse.json({
    byStage: byStage.map((s) => ({ stage: s.stage, count: s._count._all })),
    byCategory: byCategory
      .filter((c) => c.category)
      .map((c) => ({ category: c.category, count: c._count._all })),
    conversionRate,
    closedWon,
    closedThisMonth,
    totalClients,
    overdueCount,
  });
}
