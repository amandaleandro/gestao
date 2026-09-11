import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Informações de privacidade do site da A2Y Tecnologia.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F5F8FB] px-5 py-12 text-[#071827] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
        <a href="/" className="text-sm font-bold text-[#0344F0]">← Voltar</a>
        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.04em]">Privacidade</h1>
        <div className="mt-8 space-y-6 text-[15px] leading-7 text-slate-700">
          <p>A A2Y utiliza os dados enviados pelo site para responder contatos, organizar diagnósticos, reuniões e propostas e executar serviços contratados.</p>
          <p>Podem ser tratados dados como nome, empresa, contato, segmento e informações fornecidas voluntariamente sobre a operação do negócio.</p>
          <p>Os dados podem ser processados por fornecedores necessários à operação, como infraestrutura, comunicação, agenda e pagamentos, sempre de acordo com a finalidade do serviço.</p>
          <p>Solicitações relacionadas a dados podem ser feitas pelos canais oficiais de contato da A2Y. Esta página será atualizada quando houver mudanças relevantes na operação.</p>
        </div>
      </article>
    </main>
  );
}
