import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveAttachment } from "@/lib/storage";

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que 15MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storedName = await saveAttachment(id, file.name, buffer);

  const attachment = await prisma.attachment.create({
    data: {
      clientId: id,
      fileName: file.name,
      storedName,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}
