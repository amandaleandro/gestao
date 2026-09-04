import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StageStatus } from "@/generated/prisma/enums";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const requester = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  const isAdmin = requester?.role === "ADMIN";
  const stage = request.nextUrl.searchParams.get("stage");
  const search = request.nextUrl.searchParams.get("q");
  const overdue = request.nextUrl.searchParams.get("overdue") === "true";

  const clients = await prisma.client.findMany({
    where: {
      AND: [
        { stage: stage && stage in StageStatus ? (stage as StageStatus) : undefined },
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { phone: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
                { city: { contains: search, mode: "insensitive" as const } },
                { category: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        overdue
          ? {
              nextContactAt: { lt: new Date() },
              NOT: { stage: { in: ["FECHADO_GANHO", "FECHADO_PERDIDO"] } },
            }
          : {},
        !isAdmin ? { OR: [{ assignedToId: session.userId }, { assignedToId: null }] } : {},
      ],
    },
    orderBy: overdue ? { nextContactAt: "asc" } : { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      name: body.name,
      category: body.category,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      website: body.website,
      googleMapsUrl: body.googleMapsUrl,
      notes: body.notes,
      assignedToId: body.assignedToId || null,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
