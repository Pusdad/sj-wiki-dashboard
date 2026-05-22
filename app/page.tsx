"use client";

import { useState, useCallback } from "react";
import wikiData from "./data/wiki_data.json";
import { WikiData, Person } from "./types/wiki";
import KPICards from "./components/KPICards";
import SourceTimeline from "./components/SourceTimeline";
import PeopleByBU from "./components/PeopleByBU";
import OrgChart from "./components/OrgChart";
import PersonPanel from "./components/PersonPanel";
import RecentSources from "./components/RecentSources";

const data = wikiData as WikiData;

export default function DashboardPage() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const handleSelectPerson = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedPerson(null);
  }, []);

  const generatedAt = new Date(data.generated_at);
  const relativeTime = (() => {
    const diffMs = Date.now() - generatedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  })();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">SJ</span>
            </div>
            <div>
              <h1 className="text-slate-100 font-semibold text-base leading-none">
                Wiki Dashboard
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">Heilind · ICC · DB Roberts</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs">
              Updated {relativeTime}
            </p>
            <p className="text-slate-600 text-[10px]">
              {generatedAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">
        {/* KPI row */}
        <section>
          <KPICards kpis={data.kpis} />
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SourceTimeline sourcesByMonth={data.kpis.sources_by_month} />
          <PeopleByBU peopleByBU={data.kpis.people_by_bu} />
        </section>

        {/* Org chart (full width) */}
        <section>
          <OrgChart people={data.people} onSelectPerson={handleSelectPerson} />
        </section>

        {/* Recent sources */}
        <section>
          <RecentSources sources={data.sources} />
        </section>

        {/* Footer */}
        <footer className="text-center text-slate-700 text-xs pb-4">
          SJ Wiki Dashboard · {data.kpis.total_pages.toLocaleString()} pages ·{" "}
          {data.vault_path}
        </footer>
      </main>

      {/* Person detail panel */}
      <PersonPanel person={selectedPerson} onClose={handleClosePanel} />
    </div>
  );
}
