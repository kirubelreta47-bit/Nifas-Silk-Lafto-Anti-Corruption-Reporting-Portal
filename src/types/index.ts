export type CorruptionType =
  | 'bribery'
  | 'abuse_of_power'
  | 'fake_documents'
  | 'embezzlement'
  | 'favoritism'
  | 'illegal_land_housing'
  | 'other';

export type ReportStatus =
  | 'new'
  | 'under_review'
  | 'investigating'
  | 'resolved'
  | 'rejected';

export interface EvidenceItem {
  id: string;
  name: string;
  type: string; // mime type
  size: number; // in bytes
  dataUrl: string;
}

export interface DecisionLog {
  id: string;
  action: 'created' | 'status_change' | 'note_added' | 'marked_seen';
  fromStatus?: ReportStatus;
  toStatus?: ReportStatus;
  note?: string;
  adminEmail: string;
  timestamp: string; // ISO string
}

export interface Report {
  id: string; // e.g. "NSL-2026-0842"
  type: CorruptionType;
  office: string;
  personInvolved?: string;
  incidentDate: string; // YYYY-MM-DD
  location: string;
  description: string;
  isAnonymous: boolean;
  reporterName?: string;
  reporterPhone?: string;
  evidence: EvidenceItem[];
  status: ReportStatus;
  adminNotes?: string;
  seen: boolean;
  urgent?: boolean;
  createdAt: string; // ISO string
  log: DecisionLog[];
}

export interface CreateReportInput {
  type: CorruptionType;
  office: string;
  personInvolved?: string;
  incidentDate: string;
  location: string;
  description: string;
  isAnonymous: boolean;
  reporterName?: string;
  reporterPhone?: string;
  evidence: EvidenceItem[];
  honeypot?: string;
}

export interface FilterOptions {
  status?: string;
  type?: string;
  search?: string;
  anonymousOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin';
}
