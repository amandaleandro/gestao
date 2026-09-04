import { NextRequest, NextResponse } from "next/server";
import { importClientsFromSpreadsheet } from "@/lib/import";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const maxFileSize = 10 * 1024 * 1024;
  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: "O arquivo é muito grande. O limite é de 10 MB." },
      { status: 413 }
    );
  }

  const allowedExtensions = [".xlsx", ".xls", ".csv"];
  const isAllowed = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Formato inválido. Envie um arquivo .xlsx, .xls ou .csv." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const result = await importClientsFromSpreadsheet(buffer, file.name);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível processar a planilha. Verifique o arquivo e tente novamente." },
      { status: 422 }
    );
  }
}
