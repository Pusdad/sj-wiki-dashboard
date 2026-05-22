"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PeopleByBUProps {
  peopleByBU: Record<string, number>;
}

const BU_COLORS: Record<string, string> = {
  "Heilind Corp": "#14b8a6",
  "Heilind Interconnect": "#38bdf8",
  "Interstate Connecting Components": "#8b5cf6",
  ICC: "#8b5cf6",
  "DB Roberts": "#f59e0b",
  "Heilind Europe": "#10b981",
  "Heilind APAC": "#06b6d4",
  "Trek Connect": "#a78bfa",
  "Maverick Electronics": "#fb923c",
  Unknown: "#475569",
};

function getBUColor(bu: string): string {
  return BU_COLORS[bu] || "#64748b";
}

// Shorten long BU names for the axis
function shortLabel(bu: string): string {
  const map: Record<string, string> = {
    "Heilind Corp": "Corp",
    "Heilind Interconnect": "HEI",
    "Interstate Connecting Components": "ICC",
    "DB Roberts": "DBR",
    "Heilind Europe": "Europe",
    "Heilind APAC": "APAC",
    "Trek Connect": "Trek",
    "Maverick Electronics": "Maverick",
  };
  return map[bu] || bu;
}

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
        <p className="text-slate-100 text-sm font-bold">{payload[0].value} people</p>
      </div>
    );
  }
  return null;
};

export default function PeopleByBU({ peopleByBU }: PeopleByBUProps) {
  const data = Object.entries(peopleByBU)
    .filter(([bu]) => bu !== "Unknown" && bu !== "")
    .sort(([, a], [, b]) => b - a)
    .map(([bu, count]) => ({ bu, label: shortLabel(bu), count }));

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg">
      <h2 className="text-slate-200 text-sm font-semibold uppercase tracking-wider mb-4">
        People by BU
      </h2>
      {data.length === 0 ? (
        <p className="text-slate-500 text-sm">No BU data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="label"
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell key={entry.bu} fill={getBUColor(entry.bu)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
