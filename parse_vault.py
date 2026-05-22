#!/usr/bin/env python3
"""
parse_vault.py — SJ Wiki Dashboard data extractor
Reads all wiki/*.md files from the Obsidian vault and outputs
app/data/wiki_data.json for the Next.js dashboard.

Usage:
  python3 parse_vault.py
  VAULT_PATH=/path/to/vault python3 parse_vault.py
"""

import os
import re
import json
import glob
import yaml
from pathlib import Path
from datetime import datetime, date
from collections import defaultdict

# ── Config ────────────────────────────────────────────────────────────────────

VAULT_PATH = os.environ.get(
    "VAULT_PATH",
    os.path.expanduser(
        "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/SJ_AI_Brain"
    ),
)
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "app", "data", "wiki_data.json")

# ── Helpers ────────────────────────────────────────────────────────────────────

def parse_frontmatter(content: str) -> dict:
    """Extract YAML frontmatter between --- delimiters."""
    match = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return {}
    try:
        data = yaml.safe_load(match.group(1))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def strip_wikilink(value):
    """Convert [[Name|alias]] or [[Name]] to Name. Returns None for empty."""
    if value is None:
        return None
    s = str(value).strip()
    if not s:
        return None
    m = re.match(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]", s)
    return m.group(1).strip() if m else s


def date_to_str(d):
    """Normalize date fields to YYYY-MM-DD string."""
    if d is None:
        return None
    if isinstance(d, (date, datetime)):
        return d.strftime("%Y-%m-%d")
    s = str(d).strip()
    # Accept YYYY-MM-DD
    if re.match(r"\d{4}-\d{2}-\d{2}", s):
        return s[:10]
    return s


def current_month() -> str:
    return datetime.now().strftime("%Y-%m")


def prev_month(ym: str) -> str:
    y, m = int(ym[:4]), int(ym[5:])
    m -= 1
    if m == 0:
        m = 12
        y -= 1
    return f"{y}-{m:02d}"


# ── Main extraction ────────────────────────────────────────────────────────────

def extract_all(vault_path: str) -> dict:
    wiki_path = os.path.join(vault_path, "wiki")
    if not os.path.isdir(wiki_path):
        print(f"ERROR: wiki directory not found at {wiki_path}")
        return {}

    pages = {"person": [], "company": [], "source": [], "topic": [],
             "concept": [], "customer": [], "market": [], "other": []}

    md_files = glob.glob(os.path.join(wiki_path, "**", "*.md"), recursive=True)
    print(f"  Found {len(md_files)} markdown files in wiki/")

    for fpath in md_files:
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception:
            continue

        fm = parse_frontmatter(content)
        if not fm:
            continue

        page_type = str(fm.get("type", "other")).lower()
        rel_path = os.path.relpath(fpath, vault_path)
        name = Path(fpath).stem  # filename without extension

        base = {
            "name": name,
            "type": page_type,
            "tags": fm.get("tags") or [],
            "sources": int(fm.get("sources", 0) or 0),
            "created": date_to_str(fm.get("created")),
            "updated": date_to_str(fm.get("updated")),
            "path": rel_path,
        }

        if page_type == "person":
            pages["person"].append({
                **base,
                "role": str(fm.get("role", "")) or None,
                "bu": str(fm.get("bu", "")) or None,
                "department": str(fm.get("department", "")) or None,
                "reports_to": strip_wikilink(fm.get("reports_to")),
                "location": str(fm.get("location", "")) or None,
            })
        elif page_type == "source":
            pages["source"].append({
                **base,
                "date": date_to_str(fm.get("date")),
                "classification": str(fm.get("classification", "")) or None,
            })
        elif page_type == "company":
            pages["company"].append({
                **base,
            })
        else:
            bucket = page_type if page_type in pages else "other"
            pages[bucket].append(base)

    return pages


def build_kpis(pages: dict) -> dict:
    all_pages = [p for bucket in pages.values() for p in bucket]
    people = pages["person"]
    sources = pages["source"]

    # People by BU
    bu_counts: dict[str, int] = defaultdict(int)
    for p in people:
        bu = p.get("bu") or "Unknown"
        bu_counts[bu] += 1

    # Sources by month
    month_counts: dict[str, int] = defaultdict(int)
    for s in sources:
        d = s.get("date") or s.get("created")
        if d and len(d) >= 7:
            month_counts[d[:7]] += 1

    this_month = current_month()
    last_month = prev_month(this_month)

    return {
        "total_pages": len(all_pages),
        "people_pages": len(people),
        "source_pages": len(sources),
        "company_pages": len(pages["company"]),
        "topic_pages": len(pages["topic"]),
        "concept_pages": len(pages["concept"]),
        "people_by_bu": dict(sorted(bu_counts.items(), key=lambda x: -x[1])),
        "sources_by_month": dict(sorted(month_counts.items())),
        "sources_this_month": month_counts.get(this_month, 0),
        "sources_last_month": month_counts.get(last_month, 0),
    }


def main():
    print(f"\n📂 Vault: {VAULT_PATH}")
    print(f"📄 Output: {OUTPUT_PATH}\n")

    if not os.path.isdir(VAULT_PATH):
        print(f"ERROR: Vault not found at {VAULT_PATH}")
        print("Set the VAULT_PATH environment variable to override.")
        return

    pages = extract_all(VAULT_PATH)
    kpis = build_kpis(pages)

    output = {
        "generated_at": datetime.now().isoformat(),
        "vault_path": VAULT_PATH,
        "kpis": kpis,
        "people": pages["person"],
        "companies": pages["company"],
        "sources": sorted(pages["source"], key=lambda s: s.get("date") or "", reverse=True),
        "topics": pages["topic"],
        "concepts": pages["concept"],
        "customers": pages["customer"],
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"✅ Done!")
    print(f"   {kpis['total_pages']} total pages")
    print(f"   {kpis['people_pages']} people · {kpis['source_pages']} sources · {kpis['company_pages']} companies")
    print(f"   {kpis['sources_this_month']} sources this month, {kpis['sources_last_month']} last month")
    print(f"\n📊 People by BU:")
    for bu, count in list(kpis["people_by_bu"].items())[:8]:
        print(f"   {bu}: {count}")
    print(f"\n📅 Sources by month (recent):")
    for month, count in sorted(kpis["sources_by_month"].items(), reverse=True)[:6]:
        print(f"   {month}: {count}")


if __name__ == "__main__":
    main()
