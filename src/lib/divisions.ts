import { ReportCategory } from "../types";

export const DIVISIONS = [
  "ADMINISTRASI_AKADEMIK",
  "ADMINISTRASI_UMUM_RT",
  "TEKNOLOGI_INFORMASI",
  "ADMINISTRASI_KEUANGAN",
  "KEMAHASISWAAN",
] as const;

export type Division = (typeof DIVISIONS)[number];

export const DIVISION_LABELS: Record<Division, string> = {
  ADMINISTRASI_AKADEMIK: "Administrasi Akademik",
  ADMINISTRASI_UMUM_RT: "Administrasi Umum & Rumah Tangga",
  TEKNOLOGI_INFORMASI: "Teknologi Informasi",
  ADMINISTRASI_KEUANGAN: "Administrasi Keuangan",
  KEMAHASISWAAN: "Kemahasiswaan (Wakil Dekan)",
};

// Maps each report category to the division responsible for handling it.
// ReportCategory.LAINNYA is intentionally unmapped: it has no single owning
// division in the org structure, so only SUPER_ADMIN/PIMPINAN can see it
// until a Super Admin manually routes it.
export const CATEGORY_TO_DIVISION: Partial<Record<ReportCategory, Division>> = {
  [ReportCategory.AKADEMIK]: "ADMINISTRASI_AKADEMIK",
  [ReportCategory.SARPRAS]: "ADMINISTRASI_UMUM_RT",
  [ReportCategory.PELAYANAN]: "ADMINISTRASI_UMUM_RT",
  [ReportCategory.IT]: "TEKNOLOGI_INFORMASI",
  [ReportCategory.KEUANGAN]: "ADMINISTRASI_KEUANGAN",
  [ReportCategory.KEMAHASISWAAN]: "KEMAHASISWAAN",
  [ReportCategory.ETIKA]: "KEMAHASISWAAN",
};

export function divisionForCategory(category: ReportCategory): Division | null {
  return CATEGORY_TO_DIVISION[category] ?? null;
}

export function categoriesForDivision(division: Division | undefined | null): ReportCategory[] {
  if (!division) return [];
  return (Object.keys(CATEGORY_TO_DIVISION) as ReportCategory[]).filter(
    (category) => CATEGORY_TO_DIVISION[category] === division
  );
}
