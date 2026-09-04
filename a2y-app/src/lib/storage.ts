import "server-only";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve("./uploads");

function safeClientDir(clientId: string): string {
  return path.join(UPLOAD_DIR, clientId);
}

export async function saveAttachment(
  clientId: string,
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const dir = safeClientDir(clientId);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(fileName);
  const storedName = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(dir, storedName), buffer);

  return storedName;
}

export async function readAttachment(clientId: string, storedName: string): Promise<Buffer> {
  return readFile(path.join(safeClientDir(clientId), storedName));
}

export async function deleteAttachment(clientId: string, storedName: string): Promise<void> {
  try {
    await unlink(path.join(safeClientDir(clientId), storedName));
  } catch {
    // arquivo já pode ter sido removido; ignorar
  }
}
