export const pipelineStages = [
  "clientes recibidos",
  "clientes contactados",
  "clientes interesados",
  "clientes en espera",
  "clientes no interesados",
] as const;

export type PipelineStage = (typeof pipelineStages)[number];
export type Priority = "alta" | "media" | "baja";

export type Prospect = {
  id: string;
  company: string;
  tradeName?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  industry: string;
  priority: Priority;
  stage: PipelineStage;
  nextFollowUp?: string;
  lastInteraction?: string;
  waitingReason?: string;
  notes?: string;
  source: string;
  sourceCount?: number;
  recordCount?: number;
  locationCount?: number;
};
