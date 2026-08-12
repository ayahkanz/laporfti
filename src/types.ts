export enum ReporterRole {
  MAHASISWA = "Mahasiswa",
  DOSEN = "Dosen FTI",
  TENDIK = "Tenaga Kependidikan (Tendik)",
  ALUMNI = "Alumni"
}

export enum ReportCategory {
  AKADEMIK = "Akademik & Kurikulum",
  SARPRAS = "Fasilitas & Sarana Prasarana",
  PELAYANAN = "Layanan Administrasi & Staf",
  IT = "Sistem Informasi & IT Portal",
  KEMAHASISWAAN = "Kemahasiswaan, Minat & Beasiswa",
  KEUANGAN = "Keuangan & Biaya Kuliah",
  ETIKA = "Etika, Perundungan & Pelecehan",
  LAINNYA = "Lainnya"
}

export enum ReportStatus {
  MENUNGGU = "Menunggu Verifikasi",
  DIPROSES = "Sedang Diproses",
  SELESAI = "Selesai Ditindaklanjuti",
  DITOLAK = "Laporan Diarsipkan"
}

export type AdminRole = "SUPER_ADMIN" | "MODERATOR" | "PIMPINAN" | "STAFF";

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export enum UrgencyLevel {
  RENDAH = "Rendah",
  SEDANG = "Sedang",
  TINGGI = "Tinggi / Darurat"
}

export interface ReportComment {
  id: string;
  senderName: string;
  senderRole: "Admin" | "Mahasiswa";
  content: string;
  createdAt: string;
}

export interface Report {
  id: string; // Ticket Code: LH-YYYYMMDD-XXXX
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  urgency: UrgencyLevel;
  reporterName: string; // "Anonim" if anonymous
  reporterRole?: ReporterRole;
  reporterEmail: string;
  reporterWhatsapp?: string;
  isPublic: boolean; // can other users see this?
  moderationStatus?: ModerationStatus; // gates whether an isPublic report actually shows in the public feed
  createdAt: string;
  updatedAt: string;
  attachmentName?: string;
  attachmentPath?: string; // relative path served from /uploads
  disposedToEmail?: string; // staff account this ticket has been assigned to
  dispositionNote?: string;
  disposedBy?: string;
  disposedAt?: string;
  timeline: {
    status: ReportStatus;
    note: string;
    timestamp: string;
  }[];
  comments: ReportComment[];
}
