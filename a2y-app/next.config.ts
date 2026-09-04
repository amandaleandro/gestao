import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // O proxy (src/proxy.ts) roda em toda requisição, incluindo uploads de
    // planilha e anexos. Por padrão o Next só bufferiza os primeiros 10MB do
    // corpo da requisição e trunca o resto silenciosamente (sem erro),
    // corrompendo o multipart de arquivos maiores. Ver:
    // node_modules/next/dist/docs/.../proxyClientMaxBodySize.md
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
