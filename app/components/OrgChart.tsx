"use client";

import { useState, useCallback } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import { Person, OrgNode } from "../types/wiki";

// BU color mapping for node borders
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
};

function getBUColor(bu: string | null): string {
  if (!bu) return "#64748b";
  return BU_COLORS[bu] || "#64748b";
}

function NodeCard({
  node,
  onSelect,
}: {
  node: OrgNode;
  onSelect: (person: Person) => void;
}) {
  const color = getBUColor(node.bu);
  return (
    <div
      className="inline-block text-left cursor-pointer"
      onClick={() => onSelect(node)}
    >
      <div
        className="bg-slate-800 border rounded-lg px-3 py-2 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-150 min-w-[120px] max-w-[180px]"
        style={{ borderColor: color, borderTopWidth: 3, borderTopStyle: "solid" }}
      >
        <p className="text-slate-100 text-xs font-semibold leading-tight truncate">
          {node.name}
        </p>
        {node.role && (
          <p className="text-slate-400 text-[10px] mt-0.5 leading-tight line-clamp-2">
            {node.role}
          </p>
        )}
        {node.bu && (
          <p className="text-[10px] mt-1 font-medium" style={{ color }}>
            {node.bu === "Interstate Connecting Components" ? "ICC" : node.bu}
          </p>
        )}
      </div>
    </div>
  );
}

function OrgTreeNode({
  node,
  depth,
  onSelect,
}: {
  node: OrgNode;
  depth: number;
  onSelect: (person: Person) => void;
}) {
  if (depth > 3) return null; // Cap at 3 levels deep

  return (
    <TreeNode label={<NodeCard node={node} onSelect={onSelect} />}>
      {node.children
        .slice(0, 8) // Cap sibling count to avoid overflow
        .map((child) => (
          <OrgTreeNode key={child.name} node={child} depth={depth + 1} onSelect={onSelect} />
        ))}
    </TreeNode>
  );
}

function buildOrgTree(people: Person[]): OrgNode[] {
  const byName: Record<string, OrgNode> = {};
  const roots: OrgNode[] = [];

  // Build lookup
  people.forEach((p) => {
    byName[p.name] = { ...p, children: [] };
  });

  // Assign children
  people.forEach((p) => {
    if (p.reports_to && byName[p.reports_to]) {
      byName[p.reports_to].children.push(byName[p.name]);
    } else if (!p.reports_to) {
      roots.push(byName[p.name]);
    }
  });

  // Sort each level by name
  const sortNode = (node: OrgNode) => {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    node.children.forEach(sortNode);
  };
  roots.sort((a, b) => a.name.localeCompare(b.name));
  roots.forEach(sortNode);

  return roots;
}

interface OrgChartProps {
  people: Person[];
  onSelectPerson: (person: Person) => void;
}

const BU_OPTIONS = [
  { value: "", label: "All BUs" },
  { value: "Heilind Corp", label: "Heilind Corp" },
  { value: "Heilind Interconnect", label: "HEI" },
  { value: "Interstate Connecting Components", label: "ICC" },
  { value: "DB Roberts", label: "DB Roberts" },
  { value: "Heilind Europe", label: "Europe" },
  { value: "Trek Connect", label: "Trek Connect" },
  { value: "Heilind APAC", label: "APAC" },
];

export default function OrgChart({ people, onSelectPerson }: OrgChartProps) {
  const [selectedBU, setSelectedBU] = useState("");
  const [search, setSearch] = useState("");

  const filtered = people.filter((p) => {
    const matchBU = selectedBU ? p.bu === selectedBU : true;
    const matchSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.role || "").toLowerCase().includes(search.toLowerCase());
    return matchBU && matchSearch;
  });

  const tree = buildOrgTree(filtered);

  const handleSelect = useCallback(
    (person: Person) => {
      onSelectPerson(person);
    },
    [onSelectPerson]
  );

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-slate-200 text-sm font-semibold uppercase tracking-wider flex-1">
          Org Chart
        </h2>

        {/* BU filter */}
        <select
          value={selectedBU}
          onChange={(e) => setSelectedBU(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          {BU_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search name or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded-lg px-3 py-1.5 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 w-40"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {Object.entries(BU_COLORS).slice(0, 6).map(([bu, color]) => (
          <div key={bu} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-slate-400 text-[10px]">
              {bu === "Interstate Connecting Components" ? "ICC" : bu}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto overflow-y-auto max-h-[500px] pb-4">
        {tree.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No results for current filters.
          </p>
        ) : (
          <div className="min-w-max py-2">
            {tree.slice(0, 5).map((root) => (
              <div key={root.name} className="mb-6">
                <Tree
                  lineWidth="2px"
                  lineColor="#334155"
                  lineBorderRadius="6px"
                  label={<NodeCard node={root} onSelect={handleSelect} />}
                >
                  {root.children.slice(0, 8).map((child) => (
                    <OrgTreeNode
                      key={child.name}
                      node={child}
                      depth={1}
                      onSelect={handleSelect}
                    />
                  ))}
                </Tree>
              </div>
            ))}
            {tree.length > 5 && (
              <p className="text-slate-500 text-xs text-center mt-2">
                +{tree.length - 5} more root nodes — filter by BU to explore
              </p>
            )}
          </div>
        )}
      </div>

      <p className="text-slate-600 text-xs mt-3">
        Showing {filtered.length} of {people.length} people. Click any node for details.
      </p>
    </div>
  );
}
