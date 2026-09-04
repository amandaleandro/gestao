import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const requester = await prisma.user.findUnique({ where: { id: session.userId } });
  const isAdmin = requester?.role === "ADMIN";

  const users = await prisma.user.findMany({
    select: isAdmin
      ? { id: true, name: true, email: true, role: true, createdAt: true }
      : { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}
