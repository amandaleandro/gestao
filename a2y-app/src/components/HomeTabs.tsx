"use client";

import { useState } from "react";
import ClientList from "@/components/ClientList";
import ProspeccaoBoard from "@/components/ProspeccaoBoard";
import Dashboard from "@/components/Dashboard";
import OverdueBanner from "@/components/OverdueBanner";

type Tab = "lista" | "kanban" | "dashboard";

const TABS: { key: Tab; label: string }[] = [
  { key: "lista", label: "Lista de clientes" },
  { key: "kanban", label: "Kanban de prospecção" },
  { key: "dashboard", label: "Dashboard" },
];

export default function HomeTabs() {
  const [tab, setTab] = useState<Tab>("lista");

  return (
    <div className="flex flex-col gap-5">
      <OverdueBanner />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-teal-700 text-teal-800"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
        </div>
        <span className="hidden pb-3 text-xs text-slate-400 sm:block">Acompanhe o time em um só lugar</span>
      </div>

      {tab === "lista" && <ClientList />}
      {tab === "kanban" && <ProspeccaoBoard />}
      {tab === "dashboard" && <Dashboard />}
    </div>
  );
}
