import type { Prospect } from "./types";

export type NeglectReason = "seguimiento vencido" | "sin próxima acción" | "sin interacción reciente";

export function neglectedReason(prospect: Prospect, today = new Date("2026-10-03")): NeglectReason | null {
  if (prospect.stage === "clientes no interesados") return null;
  if (prospect.nextFollowUp && new Date(`${prospect.nextFollowUp}T23:59:59`) < today) return "seguimiento vencido";
  if (!prospect.nextFollowUp) return "sin próxima acción";
  if (prospect.lastInteraction && new Date(`${prospect.lastInteraction}T23:59:59`) < new Date(today.getTime() - 14 * 86400000)) return "sin interacción reciente";
  return null;
}

export function neglectedProspects(prospects: Prospect[]) {
  return prospects.map((prospect) => ({ prospect, reason: neglectedReason(prospect) })).filter((item): item is { prospect: Prospect; reason: NeglectReason } => Boolean(item.reason));
}
