"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function TeamList() {
  const [users, setUsers] = useState<TeamUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users").then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setUsers(data);
      }
    });
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        {error}{" "}
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          Voltar
        </Link>
      </div>
    );
  }

  if (!users) return <p className="text-sm text-zinc-500">Carregando...</p>;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2">Nome</th>
            <th className="px-3 py-2">E-mail</th>
            <th className="px-3 py-2">Papel</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
              <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">{u.name}</td>
              <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{u.email}</td>
              <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">
                {u.role === "ADMIN" ? "Administrador" : "Vendedor"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-3">
        <Link href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← Voltar
        </Link>
      </div>
    </div>
  );
}
