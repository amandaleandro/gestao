"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserMenu({
  userName,
  isAdmin,
}: {
  userName: string | null;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {userName && (
        <span className="hidden text-sm text-slate-600 sm:block">Olá, {userName}</span>
      )}
      {isAdmin && (
        <Link
          href="/team"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Equipe
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
      >
        Sair
      </button>
    </div>
  );
}
