"use client";

import { Person } from "../types/wiki";
import { X, MapPin, Building2, Users, FileText } from "lucide-react";

interface PersonPanelProps {
  person: Person | null;
  onClose: () => void;
}

function Badge({ label, color = "slate" }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-700 text-slate-300",
    teal: "bg-teal-900/60 text-teal-300",
    violet: "bg-violet-900/60 text-violet-300",
    amber: "bg-amber-900/60 text-amber-300",
    sky: "bg-sky-900/60 text-sky-300",
    emerald: "bg-emerald-900/60 text-emerald-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[color] || colors.slate}`}>
      {label}
    </span>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-700/60">
      <span className="text-slate-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-slate-200 text-sm break-words">{value}</p>
      </div>
    </div>
  );
}

export default function PersonPanel({ person, onClose }: PersonPanelProps) {
  if (!person) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-slate-800 border-l border-slate-700 z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-700">
          <div className="pr-3 min-w-0">
            <h3 className="text-slate-100 font-semibold text-base leading-tight truncate">
              {person.name}
            </h3>
            {person.role && (
              <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{person.role}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* BU badge */}
          {person.bu && (
            <div className="mb-4">
              <Badge label={person.bu} color="teal" />
            </div>
          )}

          {/* Fields */}
          <div className="space-y-0">
            {person.department && (
              <Row
                icon={<Building2 size={14} />}
                label="Department"
                value={person.department}
              />
            )}
            {person.reports_to && (
              <Row
                icon={<Users size={14} />}
                label="Reports To"
                value={person.reports_to}
              />
            )}
            {person.location && (
              <Row
                icon={<MapPin size={14} />}
                label="Location"
                value={person.location}
              />
            )}
            {person.sources !== undefined && person.sources > 0 && (
              <Row
                icon={<FileText size={14} />}
                label="Sources"
                value={`${person.sources} document${person.sources !== 1 ? "s" : ""}`}
              />
            )}
          </div>

          {/* Tags */}
          {person.tags && person.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {person.tags.map((tag) => (
                  <Badge key={tag} label={tag} color="slate" />
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 space-y-1.5">
            {person.created && (
              <p className="text-slate-600 text-xs">
                Created: {new Date(person.created).toLocaleDateString()}
              </p>
            )}
            {person.updated && (
              <p className="text-slate-600 text-xs">
                Updated: {new Date(person.updated).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
