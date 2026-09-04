import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StageStatus } from "@/generated/prisma/enums";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const toStage = body.stage as string;

  if (!toStage || !(toStage in StageStatus)) {
    return NextResponse.json({ error: "Etapa inválida." }, { status: 400 });
  }

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const session = await getSession();
  const requester = session
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    : null;
  if (requester?.role !== "ADMIN" && existing.assignedToId && existing.assignedToId !== session?.userId) {
    return NextResponse.json({ error: "Você não tem acesso a este cliente." }, { status: 403 });
  }
  const shouldAssign = !existing.assignedToId && !!session?.userId;

  const [client] = await prisma.$transaction([
    prisma.client.update({
      where: { id },
      data: {
        stage: toStage as StageStatus,
        assignedToId: shouldAssign ? session!.userId : undefined,
      },
    }),
    prisma.activity.create({
      data: {
        clientId: id,
        type: "MUDANCA_ETAPA",
        fromStage: existing.stage,
        toStage: toStage as StageStatus,
      },
    }),
  ]);

  return NextResponse.json(client);
}
