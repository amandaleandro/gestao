import Link from "next/link";
import ProposalManager from "@/components/ProposalManager";

export default async function ClientProposalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#f4f7f8] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <Link href={`/clients/${id}`} className="text-sm font-semibold text-slate-500 transition hover:text-[#0344F0]">← Voltar para o cliente</Link>
        <div className="mt-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0344F0]">A2Y Comercial</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950">Propostas</h1>
          <p className="mt-2 text-sm text-slate-500">Edite a versão, revise o escopo e compartilhe um link profissional para aceite.</p>
        </div>
        <ProposalManager clientId={id} />
      </div>
    </main>
  );
}
