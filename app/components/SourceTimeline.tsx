"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SourceTimelineProps {
  sourcesByMonth: Record<string, number>;
}

export default function SourceTimeline({ sourcesByMonth }: SourceTimelineProps) {
  // Build last-12-months array sorted chronologically
  const data = Object.entries(sourcesByMonth)
    .filter(([k]) => /^\d{4}-\d{2}$/.test(k))
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => {
      const [year, mo] = month.split("-");
      const label = new Date(Number(year), Number(mo) - 1).toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });
      return { month: label, count };
    });

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-slate-300 text-xs font-medium">{label}</p>
          <p className="text-violet-400 text-sm font-bold">{payload[0].value} sources</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg">
      <h2 className="text-slate-200 text-sm font-semibold uppercase tracking-wider mb-4">
        Source Ingestion Timeline
      </h2>
      {data.length === 0 ? (
        <p className="text-slate-500 text-sm">No monthly data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
