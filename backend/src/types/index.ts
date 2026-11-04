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
  type: string;
  size: number;
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
  id: string;
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
  page?: number;
  limit?: number;
}

export interface AdminUser {
  id?: number | string;
  email: string;
  name: string;
  role: 'admin';
}

export interface ReportStats {
  total: number;
  new: number;
  underReview: number;
  investigating: number;
  resolved: number;
  rejected: number;
  anonymous: number;
  urgent: number;
  typeBreakdown: { type: CorruptionType; count: number }[];
  timeline: { date: string; count: number }[];
  officeBreakdown: { office: string; count: number }[];
}

