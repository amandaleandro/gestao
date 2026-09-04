import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteAttachment, readAttachment } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attachment = await prisma.attachment.findUnique({ where: { id } });

  if (!attachment) {
    return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });
  }

  const buffer = await readAttachment(attachment.clientId, attachment.storedName);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attachment = await prisma.attachment.findUnique({ where: { id } });

  if (!attachment) {
    return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });
  }

  await prisma.attachment.delete({ where: { id } });
  await deleteAttachment(attachment.clientId, attachment.storedName);

  return NextResponse.json({ ok: true });
}
