import HomeTabs from "@/components/HomeTabs";
import UserMenu from "@/components/UserMenu";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true, role: true },
      })
    : null;

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold tracking-tight text-white">
              A2Y
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">CRM comercial</p>
              <h1 className="truncate text-lg font-semibold text-slate-950 sm:text-xl">Prospecção &amp; fechamento</h1>
              <p className="hidden text-sm text-slate-500 sm:block">Organize contatos, acompanhe oportunidades e avance negociações.</p>
            </div>
          </div>
        <UserMenu userName={user?.name ?? null} isAdmin={user?.role === "ADMIN"} />
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <HomeTabs />
      </main>
    </div>
  );
}
