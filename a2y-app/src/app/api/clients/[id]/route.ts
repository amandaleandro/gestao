import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteAttachment } from "@/lib/storage";
import { getSession } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      attachments: { orderBy: { createdAt: "desc" } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const requester = session
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    : null;
  if (requester?.role !== "ADMIN" && client.assignedToId && client.assignedToId !== session?.userId) {
    return NextResponse.json({ error: "Você não tem acesso a este cliente." }, { status: 403 });
  }

  return NextResponse.json(client);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const session = await getSession();
  const existing = await prisma.client.findUnique({ where: { id }, select: { assignedToId: true } });
  const requester = session
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    : null;

  if (!existing) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  if (requester?.role !== "ADMIN" && existing.assignedToId && existing.assignedToId !== session?.userId) {
    return NextResponse.json({ error: "Você não tem acesso a este cliente." }, { status: 403 });
  }

  const client = await prisma.client.update({
    where: { id },
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
      assignedToId:
        body.assignedToId !== undefined ? body.assignedToId || null : undefined,
      nextContactAt:
        body.nextContactAt !== undefined
          ? body.nextContactAt
            ? new Date(body.nextContactAt)
            : null
          : undefined,
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const existing = await prisma.client.findUnique({ where: { id }, select: { assignedToId: true } });
  const requester = session
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    : null;
  if (!existing) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  if (requester?.role !== "ADMIN") {
    return NextResponse.json({ error: "Somente administradores podem excluir clientes." }, { status: 403 });
  }
  const attachments = await prisma.attachment.findMany({ where: { clientId: id } });
  await prisma.client.delete({ where: { id } });
  await Promise.all(attachments.map((a) => deleteAttachment(id, a.storedName)));
  return NextResponse.json({ ok: true });
}
