import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

type RawRow = Record<string, unknown>;

const COLUMN_ALIASES: Record<string, string[]> = {
  name: ["nome", "name", "empresa", "estabelecimento", "title"],
  category: ["categoria", "segmento", "category", "tipo", "type"],
  phone: ["telefone", "phone", "celular", "contato"],
  email: ["email", "e-mail"],
  address: ["endereco", "address", "full_address", "full address"],
  city: ["cidade", "city"],
  state: ["estado", "uf"],
  website: ["site", "website", "url do site"],
  googleMapsUrl: [
    "url do google maps",
    "google maps url",
    "maps url",
    "place link",
    "google_maps_url",
  ],
  rating: ["avaliacao", "avaliação", "rating", "nota"],
  reviewsCount: [
    "quantidade de avaliacoes",
    "quantidade de avaliações",
    "numero de avaliacoes",
    "reviews",
    "review_count",
    "reviews_count",
  ],
};

// Ordem de prioridade: campos que costumam colidir em substring (ex: "avaliacao"
// dentro de "quantidade de avaliacoes") são resolvidos processando os mais
// específicos primeiro e marcando colunas já usadas.
const FIELD_ORDER = [
  "name",
  "googleMapsUrl",
  "reviewsCount",
  "rating",
  "category",
  "phone",
  "email",
  "address",
  "city",
  "state",
  "website",
];

// Alguns scrapers exportam a planilha com o nome de classes CSS internas do
// Google Maps como cabeçalho (ex: "qBF1Pd", "MW4etd") em vez de nomes
// legíveis — nesses casos os aliases por nome de coluna não servem, então
// detectamos o conteúdo de cada campo pelo formato do próprio valor.
const VALUE_PATTERNS: { field: string; regex: RegExp }[] = [
  { field: "googleMapsUrl", regex: /^https:\/\/www\.google\.com\/maps\/place\// },
  { field: "phone", regex: /^\(\d{2}\)\s?\d{4,5}-\d{4}$/ },
  { field: "rating", regex: /^\d[.,]\d$/ },
  { field: "reviewsCount", regex: /^\(\d+\)$/ },
];

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normalizeKey(key: string): string {
  return stripDiacritics(
    key.toString().toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Exports raspados de páginas (ex: Google Maps via extensão) costumam salvar o
 * CSV com bytes UTF-8 lidos como Latin-1 e regravados ("Ã§" no lugar de "ç").
 * Detecta esse padrão e reverte para o texto original. Alguns exports vêm com
 * corrupção pontual (um byte perdido no meio do arquivo) — ainda assim vale
 * reparar o resto; um eventual caractere de substituição isolado é limpo
 * depois por normalizeKey/toStr.
 */
function repairMojibake(text: string): string {
  if (!/Ã[\x80-\xBF]|Â[\x80-\xBF ]/.test(text)) return text;
  try {
    return Buffer.from(text, "latin1").toString("utf8");
  } catch {
    return text;
  }
}

function buildFieldMapByHeader(headerRow: string[]): Record<string, string> {
  const normalizedHeaders = headerRow.map((h) => normalizeKey(h));
  const fieldMap: Record<string, string> = {};
  const usedIdx = new Set<number>();

  for (const field of FIELD_ORDER) {
    const aliases = COLUMN_ALIASES[field].map(normalizeKey);

    let idx = normalizedHeaders.findIndex(
      (h, i) => !usedIdx.has(i) && aliases.includes(h)
    );
    if (idx === -1) {
      idx = normalizedHeaders.findIndex(
        (h, i) => !usedIdx.has(i) && aliases.some((a) => h.includes(a))
      );
    }

    if (idx !== -1) {
      fieldMap[field] = headerRow[idx];
      usedIdx.add(idx);
    }
  }

  return fieldMap;
}

/**
 * Preenche campos que não foram encontrados por nome de cabeçalho,
 * verificando se os valores de alguma coluna ainda livre batem com um padrão
 * conhecido (URL do Maps, telefone, nota, nº de avaliações).
 */
function fillFieldMapByValuePattern(
  fieldMap: Record<string, string>,
  headerRow: string[],
  rows: RawRow[]
): void {
  const usedHeaders = new Set(Object.values(fieldMap));
  const sampleRows = rows.slice(0, 30);

  for (const { field, regex } of VALUE_PATTERNS) {
    if (fieldMap[field]) continue;

    let bestHeader: string | undefined;
    let bestRatio = 0;

    for (const header of headerRow) {
      if (usedHeaders.has(header)) continue;

      const values = sampleRows
        .map((r) => String(r[header] ?? "").trim())
        .filter((v) => v.length > 0);
      if (values.length === 0) continue;

      const matches = values.filter((v) => regex.test(v)).length;
      const ratio = matches / values.length;

      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestHeader = header;
      }
    }

    if (bestHeader && bestRatio >= 0.6) {
      fieldMap[field] = bestHeader;
      usedHeaders.add(bestHeader);
    }
  }
}

/**
 * Extrai o nome do estabelecimento diretamente da URL do Google Maps
 * (ex: ".../maps/place/Agro+Tam/data=..." → "Agro Tam"). É a fonte mais
 * confiável de nome quando o cabeçalho da planilha não tem uma coluna clara
 * de nome, e também evita sufixos de interface como "·Link acessado".
 */
function extractNameFromMapsUrl(url: string): string | undefined {
  const match = url.match(/\/maps\/place\/([^/]+)\//);
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1].replace(/\+/g, " "));
  } catch {
    return undefined;
  }
}

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const digitsOnly = String(value).replace(/[^\d,.-]/g, "").replace(",", ".");
  const n = Number(digitsOnly);
  return Number.isFinite(n) ? n : undefined;
}

function toStr(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).replace(/�/g, "").trim();
  return s.length > 0 ? s : undefined;
}

function normalizePhone(phone: string | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export interface ImportResult {
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  duplicatesSkipped: number;
  errors: string[];
}

export async function importClientsFromSpreadsheet(
  buffer: Buffer,
  fileName: string
): Promise<ImportResult> {
  const isCsv = fileName.toLowerCase().endsWith(".csv");

  const workbook = isCsv
    ? XLSX.read(repairMojibake(buffer.toString("utf8")), { type: "string" })
    : XLSX.read(buffer, { type: "buffer" });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: RawRow[] = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

  const errors: string[] = [];
  let importedRows = 0;
  let skippedRows = 0;
  let duplicatesSkipped = 0;

  if (rows.length === 0) {
    return {
      totalRows: 0,
      importedRows: 0,
      skippedRows: 0,
      duplicatesSkipped: 0,
      errors: ["Planilha vazia."],
    };
  }

  const headerRow = Object.keys(rows[0]);
  const fieldMap = buildFieldMapByHeader(headerRow);
  fillFieldMapByValuePattern(fieldMap, headerRow, rows);

  if (!fieldMap.name && !fieldMap.googleMapsUrl) {
    errors.push(
      "Não encontrei uma coluna de nome/empresa nem um link do Google Maps na planilha."
    );
    return {
      totalRows: rows.length,
      importedRows: 0,
      skippedRows: rows.length,
      duplicatesSkipped: 0,
      errors,
    };
  }

  const existingClients = await prisma.client.findMany({
    select: { phone: true, name: true },
  });
  const seenPhones = new Set(
    existingClients.map((c) => normalizePhone(c.phone ?? undefined)).filter(Boolean)
  );
  const seenNames = new Set(existingClients.map((c) => normalizeName(c.name)));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const googleMapsUrl = fieldMap.googleMapsUrl ? toStr(row[fieldMap.googleMapsUrl]) : undefined;
    const nameFromUrl = googleMapsUrl ? extractNameFromMapsUrl(googleMapsUrl) : undefined;
    const name = nameFromUrl ?? (fieldMap.name ? toStr(row[fieldMap.name]) : undefined);

    if (!name) {
      skippedRows++;
      continue;
    }

    const phone = fieldMap.phone ? toStr(row[fieldMap.phone]) : undefined;
    const normalizedPhone = normalizePhone(phone);
    const normalizedName = normalizeName(name);

    const isDuplicate =
      (normalizedPhone && seenPhones.has(normalizedPhone)) || seenNames.has(normalizedName);

    if (isDuplicate) {
      duplicatesSkipped++;
      continue;
    }

    if (normalizedPhone) seenPhones.add(normalizedPhone);
    seenNames.add(normalizedName);

    try {
      await prisma.client.create({
        data: {
          name,
          category: fieldMap.category ? toStr(row[fieldMap.category]) : undefined,
          phone,
          email: fieldMap.email ? toStr(row[fieldMap.email]) : undefined,
          address: fieldMap.address ? toStr(row[fieldMap.address]) : undefined,
          city: fieldMap.city ? toStr(row[fieldMap.city]) : undefined,
          state: fieldMap.state ? toStr(row[fieldMap.state]) : undefined,
          website: fieldMap.website ? toStr(row[fieldMap.website]) : undefined,
          googleMapsUrl,
          rating: fieldMap.rating ? toNumber(row[fieldMap.rating]) : undefined,
          reviewsCount: fieldMap.reviewsCount
            ? toNumber(row[fieldMap.reviewsCount])
            : undefined,
        },
      });
      importedRows++;
    } catch {
      skippedRows++;
      errors.push(`Linha ${i + 2}: erro ao salvar "${name}".`);
    }
  }

  await prisma.importBatch.create({
    data: {
      fileName,
      totalRows: rows.length,
      importedRows,
      skippedRows: skippedRows + duplicatesSkipped,
    },
  });

  return { totalRows: rows.length, importedRows, skippedRows, duplicatesSkipped, errors };
}
