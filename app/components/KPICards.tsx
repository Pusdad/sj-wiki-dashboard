"use client";

import { KPIs } from "../types/wiki";

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  trend?: { value: number; label: string };
}

function KPICard({ label, value, sub, accent = "teal", trend }: KPICardProps) {
  const accentColors: Record<string, string> = {
    teal: "border-teal-500 text-teal-400",
    blue: "border-blue-500 text-blue-400",
    violet: "border-violet-500 text-violet-400",
    amber: "border-amber-500 text-amber-400",
    emerald: "border-emerald-500 text-emerald-400",
    sky: "border-sky-500 text-sky-400",
  };
  const cls = accentColors[accent] || accentColors.teal;
  const borderCls = cls.split(" ")[0];
  const textCls = cls.split(" ")[1];

  const trendPositive = trend && trend.value >= 0;
  const trendStr = trend
    ? `${trendPositive ? "▲" : "▼"} ${Math.abs(trend.value).toFixed(0)}% ${trend.label}`
    : null;

  return (
    <div
      className={`bg-slate-800 rounded-xl border-t-2 ${borderCls} p-5 flex flex-col gap-1 shadow-lg`}
    >
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-4xl font-bold ${textCls} leading-none mt-1`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      {trendStr && (
        <p
          className={`text-xs font-medium mt-1 ${trendPositive ? "text-emerald-400" : "text-rose-400"}`}
        >
          {trendStr}
        </p>
      )}
    </div>
  );
}

export default function KPICards({ kpis }: { kpis: KPIs }) {
  const monthTrend =
    kpis.sources_last_month > 0
      ? ((kpis.sources_this_month - kpis.sources_last_month) /
          kpis.sources_last_month) *
        100
      : kpis.sources_this_month > 0
      ? 100
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KPICard
        label="Wiki Pages"
        value={kpis.total_pages.toLocaleString()}
        sub="all types"
        accent="teal"
      />
      <KPICard
        label="People"
        value={kpis.people_pages}
        sub="documented"
        accent="blue"
      />
      <KPICard
        label="Sources"
        value={kpis.source_pages}
        sub="ingested docs"
        accent="violet"
      />
      <KPICard
        label="This Month"
        value={kpis.sources_this_month}
        sub="new sources"
        accent="emerald"
        trend={
          kpis.sources_last_month > 0 || kpis.sources_this_month > 0
            ? { value: monthTrend, label: "vs last month" }
            : undefined
        }
      />
      <KPICard
        label="Companies"
        value={kpis.company_pages}
        sub="own + vendors + competitors"
        accent="amber"
      />
      <KPICard
        label="Topics"
        value={(kpis.topic_pages || 0) + (kpis.concept_pages || 0)}
        sub="topics + concepts"
        accent="sky"
      />
    </div>
  );
}
