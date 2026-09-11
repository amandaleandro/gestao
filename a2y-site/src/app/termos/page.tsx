import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos gerais de uso do site institucional da A2Y Tecnologia.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F5F8FB] px-5 py-12 text-[#071827] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
        <a href="/" className="text-sm font-bold text-[#0344F0]">← Voltar</a>
        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.04em]">Termos de Uso</h1>
        <div className="mt-8 space-y-6 text-[15px] leading-7 text-slate-700">
          <p>O site institucional apresenta informações sobre a A2Y, seus serviços e produtos e permite solicitar contato ou diagnóstico comercial.</p>
          <p>O envio de um formulário não cria obrigação de contratação, garantia de aceite de projeto ou promessa de resultado. Escopo, valores, prazos e responsabilidades válidos para cada trabalho são os registrados na proposta e nos documentos comerciais aplicáveis.</p>
          <p>Conteúdos, marcas, interfaces e materiais próprios da A2Y não devem ser reproduzidos de forma indevida. Links e serviços de terceiros seguem as regras dos respectivos fornecedores.</p>
          <p>A A2Y pode atualizar o site, seus serviços e estes termos conforme a operação evoluir. A versão publicada nesta página é a referência vigente para uso do site.</p>
        </div>
      </article>
    </main>
  );
}
