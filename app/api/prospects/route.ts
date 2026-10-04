import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { pipelineStages, type PipelineStage, type Priority, type Prospect } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StagedRecord = {
  source_file?: string;
  source_sheet?: string;
  source_row?: number;
  record_key?: string;
  company_name?: string;
  trade_name?: string;
  contact_name?: string;
  contact_raw?: string;
  emails?: string[];
  phones?: string[];
  websites?: string[];
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  industry?: string;
  priority?: string;
  stage?: string;
  suggested_stage?: string;
  stage_suggestion_reason?: string;
  status_raw?: string;
  next_follow_up_raw?: string;
  notes?: string;
  conversation_notes?: string;
  waiting_reason?: string;
};

const stagingPath = join(process.cwd(), "data", "staging", "prospects.ndjson");

function asPriority(value?: string): Priority { return value === "alta" || value === "baja" ? value : "media"; }
function asStage(value?: string, reason?: string): PipelineStage { return reason !== "default_needs_review" && pipelineStages.includes(value as PipelineStage) ? value as PipelineStage : "clientes recibidos"; }
function firstLine(value?: string) { return value?.split(/\r?\n/).map((part) => part.trim()).find(Boolean); }
function dateOnly(value?: string) { const match = value?.match(/\d{4}-\d{2}-\d{2}/); return match?.[0]; }
function location(record: StagedRecord) { return [record.address, record.city, record.state, record.postal_code].filter(Boolean).join(", ") || undefined; }
function companyKey(value: string | undefined, fallback: string) { if (!value) return `missing:${fallback}`; let key = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, " ").trim().toLowerCase(); const legalSuffixes = ["sociedad anonima de capital variable", "s de rl de cv", "s de rl", "sapi de cv", "sa de cv", "s de cv", "spr de rl", "s c p", "scp", "s c", "sa", "cv"]; for (let pass = 0; pass < 4; pass += 1) { const previous = key; for (const suffix of legalSuffixes) { if (key.endsWith(` ${suffix}`)) { key = key.slice(0, -(suffix.length + 1)).trim(); break; } } if (key === previous) break; } return key; }
function unique(values: (string | undefined)[]) { return Array.from(new Set(values.filter(Boolean) as string[])); }
function recordScore(record: Prospect) { return (record.email ? 4 : 0) + (record.phone ? 3 : 0) + (record.contact ? 2 : 0) + (record.notes ? 1 : 0) + (record.source.includes("Clientes potenciales") ? 2 : 0); }
function mapRecord(record: StagedRecord, index: number): Prospect {
  const source = [record.source_file, record.source_sheet].filter(Boolean).join(" · ");
  const industry = record.source_file?.startsWith("IMMEX_") ? (record.source_sheet === "PLANTAS IMMEX" ? "IMMEX / Planta" : "IMMEX / Programa") : record.industry || "Por clasificar";
  return {
    id: record.record_key || `staged-${index}`,
    company: record.company_name || "Empresa sin nombre",
    tradeName: record.trade_name || undefined,
    contact: record.contact_name || firstLine(record.contact_raw),
    email: record.emails?.[0],
    phone: record.phones?.[0],
    website: record.websites?.[0],
    location: location(record),
    industry,
    priority: asPriority(record.priority),
    stage: asStage(record.suggested_stage || record.stage, record.stage_suggestion_reason),
    nextFollowUp: dateOnly(record.next_follow_up_raw),
    lastInteraction: undefined,
    waitingReason: record.waiting_reason || (record.suggested_stage === "clientes en espera" ? record.status_raw || "Revisar motivo en notas" : undefined),
    notes: [record.notes, record.conversation_notes].filter(Boolean).join("\n\n") || undefined,
    source,
  };
}
function consolidate(records: Prospect[]) {
  const grouped = new Map<string, Prospect[]>();
  records.forEach((record) => { const key = companyKey(record.company, record.id); grouped.set(key, [...(grouped.get(key) || []), record]); });
  return Array.from(grouped.values()).map((group) => {
    const ranked = [...group].sort((left, right) => recordScore(right) - recordScore(left));
    const primary = ranked[0];
    const stages = group.filter((record) => record.stage !== "clientes recibidos").sort((left, right) => recordScore(right) - recordScore(left));
    const notes = unique(group.map((record) => record.notes)).slice(0, 3);
    const extraNote = group.length > 1 ? `Registros de origen consolidados: ${group.length}.` : undefined;
    return {
      ...primary,
      email: unique(group.map((record) => record.email))[0],
      phone: unique(group.map((record) => record.phone))[0],
      website: unique(group.map((record) => record.website))[0],
      priority: group.some((record) => record.priority === "alta") ? "alta" : group.some((record) => record.priority === "media") ? "media" : "baja",
      stage: stages[0]?.stage || primary.stage,
      notes: [...notes, extraNote].filter(Boolean).join("\n\n") || undefined,
      sourceCount: unique(group.map((record) => record.source)).length,
      recordCount: group.length,
      locationCount: unique(group.map((record) => record.location)).length,
    } satisfies Prospect;
  });
}

export function GET() {
  try {
    const stat = statSync(stagingPath);
    const sourceRecords = readFileSync(stagingPath, "utf8").split(/\r?\n/).filter(Boolean).map((line, index) => mapRecord(JSON.parse(line) as StagedRecord, index));
    const records = consolidate(sourceRecords);
    const stageCounts = Object.fromEntries(pipelineStages.map((stage) => [stage, records.filter((record) => record.stage === stage).length]));
    return NextResponse.json({ source: "local-staging", generatedAt: stat.mtime.toISOString(), total: records.length, sourceRows: sourceRecords.length, stageCounts, items: records });
  } catch {
    return NextResponse.json({ error: "No existe data/staging/prospects.ndjson. Ejecuta python scripts/import_workbooks.py." }, { status: 503 });
  }
}
