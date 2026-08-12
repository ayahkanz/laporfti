import { AdminRole } from "../types";
import { Division } from "./divisions";

// Static snapshot of FTI's organizational directory (from Role.xlsx), used to
// speed up inviting admin accounts with a sensible suggested role/division
// instead of typing everything by hand. The Super Admin can still override
// any field before submitting — this is a convenience default, not a source
// of truth enforced by the backend.
export interface OrgDirectoryEntry {
  email: string;
  name: string;
  title: string;
  suggestedRole: AdminRole;
  suggestedDivision?: Division;
}

export const ORG_DIRECTORY: OrgDirectoryEntry[] = [
  { email: "945230102@uii.ac.id", name: "Prof. Dr. Sri Kusumadewi, S.Si., M.T.", title: "Dekan", suggestedRole: "PIMPINAN" },
  { email: "985240104@uii.ac.id", name: "Dr. Ir. Wahyudi Budi Pramono, S.T., M.Eng., IPM.", title: "Wakil Dekan Bidang Keuangan dan Sumber Daya", suggestedRole: "PIMPINAN" },
  { email: "145250101@uii.ac.id", name: "Dr. Ir. Muhammad Khafidh, S.T., M.T., IPP.", title: "Wakil Dekan Bidang Akademik, Riset, dan Rekognisi", suggestedRole: "PIMPINAN" },
  { email: "985220102@uii.ac.id", name: "Dr. Ir. Agus Mansur, S.T., M.Eng.Sc., IPU., ASEAN Eng.", title: "Wakil Dekan Bidang Kemahasiswaan, Keislaman, dan Kealumnian", suggestedRole: "MODERATOR", suggestedDivision: "KEMAHASISWAAN" },
  { email: "041002459@uii.ac.id", name: "Ervin Yulianita Indriyani", title: "Kepala Divisi Administrasi Umum dan Rumah Tangga", suggestedRole: "MODERATOR", suggestedDivision: "ADMINISTRASI_UMUM_RT" },
  { email: "011002442@uii.ac.id", name: "Sukirna", title: "Kepala Urusan Rumah Tangga", suggestedRole: "STAFF", suggestedDivision: "ADMINISTRASI_UMUM_RT" },
  { email: "091002116@uii.ac.id", name: "Nurlatifah Risti Julianingrum", title: "Kepala Divisi Administrasi Akademik", suggestedRole: "MODERATOR", suggestedDivision: "ADMINISTRASI_AKADEMIK" },
  { email: "131002104@uii.ac.id", name: "Erry Satya Panunggal", title: "Kepala Urusan Data Akademik", suggestedRole: "STAFF", suggestedDivision: "ADMINISTRASI_AKADEMIK" },
  { email: "051002451@uii.ac.id", name: "Diana", title: "Kepala Divisi Administrasi Keuangan", suggestedRole: "MODERATOR", suggestedDivision: "ADMINISTRASI_KEUANGAN" },
  { email: "235202602@uii.ac.id", name: "Bayu Nugroho", title: "Staff Divisi Keuangan", suggestedRole: "STAFF", suggestedDivision: "ADMINISTRASI_KEUANGAN" },
  { email: "071002231@uii.ac.id", name: "Zulfahmi", title: "Kepala Divisi Teknologi Informasi", suggestedRole: "MODERATOR", suggestedDivision: "TEKNOLOGI_INFORMASI" },
  { email: "981002110@uii.ac.id", name: "Sukamdi", title: "Staff Divisi Teknologi Informasi", suggestedRole: "STAFF", suggestedDivision: "TEKNOLOGI_INFORMASI" },
  { email: "131002218@uii.ac.id", name: "Tri Wahyono", title: "Staff Divisi Teknologi Informasi", suggestedRole: "STAFF", suggestedDivision: "TEKNOLOGI_INFORMASI" },
];
