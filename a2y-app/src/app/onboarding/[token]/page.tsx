import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicOnboardingForm from "@/components/PublicOnboardingForm";

function Blocked({ title, description }: { title: string; description: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7f8] px-5">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-[#0344F0] text-sm font-black text-white">A2Y</span>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#071827]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </main>
  );
}

export default async function PublicOnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: token },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          category: true,
          onboarding: true,
        },
      },
    },
  });

  if (!proposal) notFound();

  if (proposal.status !== "ACEITA") {
    return <Blocked title="Onboarding ainda indisponível" description="O briefing de implantação é liberado depois que a proposta comercial for aceita." />;
  }

  if (!proposal.paidAt) {
    return <Blocked title="Aguardando confirmação de pagamento" description="O briefing de implantação será liberado assim que o pagamento da implantação for confirmado pela A2Y." />;
  }

  const rawData = proposal.client.onboarding?.data;
  const initialData = rawData && typeof rawData === "object" && !Array.isArray(rawData)
    ? Object.fromEntries(Object.entries(rawData).map(([key, value]) => [key, typeof value === "string" ? value : ""]))
    : {};

  return (
    <main className="min-h-screen bg-[#f4f7f8] text-[#071827]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-5 sm:px-8">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0344F0] text-sm font-black text-white">A2Y</span>
          <div><strong className="block text-sm">A2Y Tecnologia</strong><span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Onboarding de implantação</span></div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0344F0]">{proposal.client.name}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] text-[#071827]">Vamos preparar a implantação.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">As respostas abaixo ficam vinculadas ao projeto aprovado e servem como briefing para configuração, integrações e treinamento.</p>
        </div>

        <PublicOnboardingForm
          token={token}
          initialData={initialData}
          initialStatus={proposal.client.onboarding?.status ?? "EM_ANDAMENTO"}
        />
      </div>
    </main>
  );
}
