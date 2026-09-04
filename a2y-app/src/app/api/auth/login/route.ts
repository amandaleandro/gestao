import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const genericError = NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });

  if (!user) return genericError;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return genericError;

  await createSession(user.id);

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
