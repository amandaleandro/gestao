import TeamList from "@/components/TeamList";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    : null;

  if (user?.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Equipe
        </h1>
        <TeamList />
      </div>
    </div>
  );
}
