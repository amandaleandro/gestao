import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "A2Y Tecnologia | Tecnologia aplicada a problemas reais de negócio",
    template: "%s | A2Y Tecnologia",
  },
  description:
    "A A2Y cria automações, sistemas e infraestrutura para eliminar gargalos operacionais, organizar vendas e dar mais controle à operação.",
  openGraph: {
    title: "A2Y Tecnologia",
    description:
      "Tecnologia aplicada a problemas reais de negócio: automação, sistemas, atendimento, vendas e infraestrutura.",
    type: "website",
    locale: "pt_BR",
    siteName: "A2Y Tecnologia",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
