"use client";

import { Source } from "../types/wiki";
import { FileText, Calendar } from "lucide-react";

interface RecentSourcesProps {
  sources: Source[];
}

function classTag(classification: string | null): string {
  if (!classification) return "bg-slate-700 text-slate-400";
  const c = classification.toLowerCase();
  if (c.includes("confidential")) return "bg-rose-900/60 text-rose-300";
  if (c.includes("internal")) return "bg-amber-900/60 text-amber-300";
  return "bg-slate-700 text-slate-400";
}

export default function RecentSources({ sources }: RecentSourcesProps) {
  const recent = [...sources]
    .sort((a, b) => {
      const da = a.created || a.date || "";
      const db = b.created || b.date || "";
      return db.localeCompare(da);
    })
    .slice(0, 12);

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg">
      <h2 className="text-slate-200 text-sm font-semibold uppercase tracking-wider mb-4">
        Recent Sources
      </h2>
      <div className="space-y-2">
        {recent.map((source) => (
          <div
            key={source.path}
            className="flex items-start gap-3 py-2.5 border-b border-slate-700/50 last:border-0"
          >
            <span className="text-violet-500 mt-0.5 flex-shrink-0">
              <FileText size={14} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-xs font-medium leading-snug truncate">
                {source.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {source.date && (
                  <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                    <Calendar size={10} />
                    {source.date}
                  </span>
                )}
                {source.classification && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${classTag(source.classification)}`}
                  >
                    {source.classification}
                  </span>
                )}
              </div>
            </div>
            {source.sources > 0 && (
              <span className="text-slate-600 text-[10px] flex-shrink-0 mt-0.5">
                {source.sources} links
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
