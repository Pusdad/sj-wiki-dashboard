export interface Person {
  name: string;
  type: string;
  role: string | null;
  bu: string | null;
  department: string | null;
  reports_to: string | null;
  location: string | null;
  sources: number;
  tags: string[];
  created: string | null;
  updated: string | null;
  path: string;
}

export interface Company {
  name: string;
  type: string;
  tags: string[];
  sources: number;
  created: string | null;
  updated: string | null;
  path: string;
}

export interface Source {
  name: string;
  type: string;
  date: string | null;
  classification: string | null;
  tags: string[];
  sources: number;
  created: string | null;
  updated: string | null;
  path: string;
}

export interface KPIs {
  total_pages: number;
  people_pages: number;
  source_pages: number;
  company_pages: number;
  topic_pages: number;
  concept_pages: number;
  people_by_bu: Record<string, number>;
  sources_by_month: Record<string, number>;
  sources_this_month: number;
  sources_last_month: number;
}

export interface WikiData {
  generated_at: string;
  vault_path: string;
  kpis: KPIs;
  people: Person[];
  companies: Company[];
  sources: Source[];
  topics: { name: string; [k: string]: unknown }[];
  concepts: { name: string; [k: string]: unknown }[];
  customers: { name: string; [k: string]: unknown }[];
}

export interface OrgNode extends Person {
  children: OrgNode[];
}
