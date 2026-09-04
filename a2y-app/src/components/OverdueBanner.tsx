"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OverdueClient {
  id: string;
  name: string;
  nextContactAt: string;
}

export default function OverdueBanner() {
  const [clients, setClients] = useState<OverdueClient[]>([]);

  useEffect(() => {
    fetch("/api/clients?overdue=true")
      .then((res) => res.json())
      .then(setClients);
  }, []);

  if (clients.length === 0) return null;

  const visibleClients = clients.slice(0, 8);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="mb-2 text-sm font-semibold text-amber-900">
        Atenção: {clients.length} follow-up{clients.length > 1 ? "s" : ""} atrasado
        {clients.length > 1 ? "s" : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleClients.map((c) => (
          <Link
            key={c.id}
            href={`/clients/${c.id}`}
            className="rounded-md border border-amber-200 bg-white px-3 py-1.5 text-sm text-amber-900 hover:border-amber-400 hover:underline"
          >
            {c.name} — {new Date(c.nextContactAt).toLocaleDateString("pt-BR")}
          </Link>
        ))}
      </div>
      {clients.length > visibleClients.length && (
        <p className="mt-3 text-xs text-amber-800">
          Mostrando os 8 mais antigos. Use o filtro “Só atrasados” na lista para ver todos.
        </p>
      )}
    </div>
  );
}
