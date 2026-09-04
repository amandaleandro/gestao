import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@/generated/prisma/enums";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const type = (body.type as string) ?? "NOTA";

  if (!(type in ActivityType)) {
    return NextResponse.json({ error: "Tipo de atividade inválido." }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      clientId: id,
      type: type as ActivityType,
      content: body.content,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
