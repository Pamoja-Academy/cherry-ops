export type MediaProfile = {
  keywords: string[];
  capabilities: string[];
  exclude: string[];
  issuers: string[];
  provinces: string[];
  minValueZar: number;
  maxValueZar: number;
};

export const RED_CHERRY_MEDIA_PROFILE: MediaProfile = {
  keywords: [
    "panel of service providers",
    "marketing and communications",
    "advertising agency",
    "media buying",
    "creative agency",
    "brand campaign",
    "public relations",
    "digital marketing",
    "social media",
    "events management",
    "activations",
    "audio visual",
    "video production",
    "gcis",
    "communications panel",
    "agency of record",
  ],
  capabilities: [
    "IMC",
    "creative design",
    "brand strategy",
    "media planning/buying",
    "PR",
    "digital",
    "social",
    "events",
    "activations",
    "AV/video production",
    "content marketing",
    "stakeholder engagement",
  ],
  exclude: [
    "laboratory",
    "lab chemicals",
    "glassware",
    "reagent",
    "calibration",
    "hplc",
    "construction",
    "civil engineering",
    "cidb",
    "toner",
    "fire extinguisher",
    "security guarding",
    "medical supplies",
  ],
  issuers: [
    "GCIS",
    "SETA",
    "W&RSETA",
    "Services SETA",
    "GEPF",
    "SABC",
    "SA Tourism",
    "National Treasury",
    "City of Johannesburg",
    "Gauteng",
  ],
  provinces: [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Northern Cape",
  ],
  minValueZar: 50_000,
  maxValueZar: 50_000_000,
};

export const COMPANY_IDENTITY = {
  legalName: "Red Cherry Media Holdings (Pty) Ltd t/a Red Cherry Interactive",
  location: "Rivonia / Sandton",
  beeLevel: "Level 1 BEE",
  phone: "+27 11 807 2531",
};
