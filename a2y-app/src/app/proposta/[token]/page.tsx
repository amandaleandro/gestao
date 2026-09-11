import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicProposalAcceptance from "@/components/PublicProposalAcceptance";

function money(value: number | null): string {
  return value === null
    ? "A definir"
    : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-200 py-8">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#0344F0]">{title}</h2>
      <div className="mt-3 whitespace-pre-line text-[15px] leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: token },
    include: { client: { select: { name: true, category: true } } },
  });

  if (!proposal) notFound();

  const expired = Boolean(proposal.validUntil && proposal.validUntil < new Date() && !["ACEITA", "RECUSADA"].includes(proposal.status));
  const effectiveStatus = expired ? "EXPIRADA" : proposal.status;

  return (
    <main className="min-h-screen bg-[#f4f7f8] text-[#071827]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0344F0] text-sm font-black text-white">A2Y</span>
            <div><strong className="block text-sm">A2Y Tecnologia</strong><span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Proposta comercial</span></div>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">v{proposal.version}</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_340px] lg:items-start lg:py-14">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(7,24,39,0.06)]">
          <div className="border-b border-slate-200 p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0344F0]">Preparado para {proposal.client.name}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-[-0.045em] text-[#071827]">{proposal.title}</h1>
            {proposal.client.category && <p className="mt-3 text-sm text-slate-500">Segmento: {proposal.client.category}</p>}
          </div>

          <div className="px-7 sm:px-9">
            {proposal.context && <Section title="Contexto">{proposal.context}</Section>}
            {proposal.problems && <Section title="O que entendemos">{proposal.problems}</Section>}
            {proposal.solution && <Section title="Solução recomendada">{proposal.solution}</Section>}
            {proposal.scope && <Section title="Escopo">{proposal.scope}</Section>}
            {proposal.exclusions && <Section title="Não incluso">{proposal.exclusions}</Section>}
            {proposal.timeline && <Section title="Prazo e implantação">{proposal.timeline}</Section>}
          </div>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <div className="rounded-3xl bg-[#071827] p-6 text-white shadow-[0_20px_70px_rgba(7,24,39,0.14)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Investimento</p>
            <div className="mt-6 border-b border-white/10 pb-5">
              <p className="text-xs text-white/50">Implantação</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{money(proposal.setupPrice)}</p>
            </div>
            <div className="py-5">
              <p className="text-xs text-white/50">Recorrência mensal</p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{money(proposal.monthlyPrice)}</p>
            </div>
            <div className="border-t border-white/10 pt-4 text-xs leading-5 text-white/55">
              {proposal.validUntil ? `Proposta válida até ${proposal.validUntil.toLocaleDateString("pt-BR")}.` : "Validade conforme alinhamento comercial."}
            </div>
          </div>

          <PublicProposalAcceptance token={token} initialStatus={effectiveStatus} />
        </aside>
      </div>

      <footer className="border-t border-slate-200 bg-white py-7">
        <div className="mx-auto max-w-5xl px-5 text-xs leading-5 text-slate-500 sm:px-8">A2Y Tecnologia · Esta página apresenta a versão registrada da proposta comercial. Alterações relevantes de escopo ou valor devem gerar uma nova versão.</div>
      </footer>
    </main>
  );
}
