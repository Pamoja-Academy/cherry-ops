import { scoreBrief, type ScoreInput } from "./scorer";

export type BriefSeed = ScoreInput & {
  external_id: string;
  reference: string;
  source?: string;
  category?: string;
  closingDaysOut: number;
  briefingDaysOut?: number;
  source_url?: string;
  estimatedValue: number;
};

function isoDaysOut(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(17, 0, 0, 0);
  return d.toISOString();
}

export function getDemoBriefs(): BriefSeed[] {
  return [
    {
      external_id: "brief:gcis-panel-2026",
      reference: "GCIS/MKT/2026/041",
      source: "etenders",
      title: "Panel of Service Providers — Marketing and Communications",
      description:
        "GCIS seeks accredited agencies for marketing and communications, public relations, digital marketing, social media, and stakeholder engagement on the national communications panel.",
      issuer: "GCIS",
      province: "National",
      category: "Marketing & Communications",
      closingDaysOut: 28,
      briefingDaysOut: 14,
      estimatedValue: 12_000_000,
      source_url: "https://www.etenders.gov.za/",
    },
    {
      external_id: "brief:wrseta-comms-2026",
      reference: "W&RSETA/COM/2026/018",
      source: "etenders",
      title: "Communications and Creative Agency Services",
      description:
        "W&RSETA requires a creative agency for brand campaign development, digital marketing, and content marketing across stakeholder channels.",
      issuer: "W&RSETA",
      province: "Gauteng",
      category: "Communications",
      closingDaysOut: 18,
      estimatedValue: 2_400_000,
      source_url: "https://www.etenders.gov.za/",
    },
    {
      external_id: "brief:gepf-brand-2026",
      reference: "GEPF/BRD/2026/007",
      source: "etenders",
      title: "Brand Campaign — Creative Agency of Record",
      description:
        "GEPF brand campaign including IMC, creative design, media planning/buying, and activations for member engagement.",
      issuer: "GEPF",
      province: "Gauteng",
      category: "Brand & Creative",
      closingDaysOut: 35,
      estimatedValue: 8_500_000,
      source_url: "https://www.etenders.gov.za/",
    },
    {
      external_id: "brief:satourism-av-2026",
      reference: "SAT/AV/2026/012",
      source: "etenders",
      title: "Audio Visual and Video Production Services",
      description:
        "SA Tourism requires AV/video production, events management, and activations for domestic travel campaigns.",
      issuer: "SA Tourism",
      province: "Gauteng",
      category: "Production",
      closingDaysOut: 22,
      briefingDaysOut: 10,
      estimatedValue: 3_200_000,
      source_url: "https://www.etenders.gov.za/",
    },
    {
      external_id: "brief:noise-lab-chemicals-2026",
      reference: "RFQ/LAB/2026/099",
      source: "etenders",
      title: "Supply of Lab Chemicals and Laboratory Consumables",
      description:
        "RFQ for laboratory reagents, glassware, calibration standards, and HPLC consumables for regional depot.",
      issuer: "Unknown Municipality",
      province: "Limpopo",
      category: "Laboratory Supplies",
      closingDaysOut: 12,
      estimatedValue: 180_000,
      source_url: "https://www.etenders.gov.za/",
    },
  ];
}

export function briefToOpportunityRow(brief: BriefSeed) {
  const now = new Date().toISOString();
  const scored = scoreBrief(brief);
  return {
    external_id: brief.external_id,
    source: brief.source ?? "media-ingest",
    reference: brief.reference,
    title: brief.title,
    description: brief.description ?? null,
    issuer: brief.issuer ?? null,
    province: brief.province ?? null,
    category: brief.category ?? null,
    status: "open",
    published_at: now,
    closing_at: isoDaysOut(brief.closingDaysOut),
    briefing_at: brief.briefingDaysOut != null ? isoDaysOut(brief.briefingDaysOut) : null,
    estimated_value: brief.estimatedValue,
    currency: "ZAR",
    source_url: brief.source_url ?? null,
    fit_score: scored.score,
    score_breakdown: JSON.stringify(scored.breakdown),
    triage_status: "pending" as const,
    triage_note: null,
    triaged_at: null,
    triaged_by: null,
    ingested_at: now,
    updated_at: now,
  };
}

export function scorePendingBriefs<T extends ScoreInput>(items: T[]) {
  return items.map((item) => ({
    ...item,
    ...scoreBrief(item),
  }));
}
