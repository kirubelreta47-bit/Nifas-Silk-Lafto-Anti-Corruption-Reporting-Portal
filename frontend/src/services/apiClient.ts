import {
  Report,
  CreateReportInput,
  FilterOptions,
  ReportStatus,
  EvidenceItem,
  AdminUser,
} from '../types';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';

/**
 * Resolves relative file URLs (e.g. /api/upload/file/...) to the full backend endpoint
 */
export const resolveFileUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('nsl_admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiClient = {
  // 1. Health check
  async checkHealth(): Promise<{ status: string; database?: any } | null> {
    try {
      const res = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // 2. Fetch Reports
  async getReports(filters: FilterOptions = {}): Promise<Report[]> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.anonymousOnly) params.append('anonymousOnly', 'true');
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const url = `${API_BASE_URL}/reports?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch reports: ${res.statusText}`);
    const data = await res.json();
    return data.data;
  },

  // 3. Fetch Single Report
  async getReportById(id: string): Promise<Report | null> {
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch report ${id}`);
    const data = await res.json();
    return data.data;
  },

  // 4. Create Report (Citizen submission - no auth required)
  async submitReport(input: CreateReportInput): Promise<{ success: boolean; data?: Report; error?: string }> {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to submit report' };
    }
    return { success: true, data: data.data };
  },

  // 5. Update Status (Requires Admin Auth)
  async updateStatus(
    id: string,
    status: ReportStatus,
    note?: string,
    adminEmail: string = 'admin@nsl.gov.et'
  ): Promise<Report | null> {
    const res = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status, note, adminEmail }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  },

  // 6. Update Notes (Requires Admin Auth)
  async updateNotes(
    id: string,
    notes: string,
    adminEmail: string = 'admin@nsl.gov.et'
  ): Promise<Report | null> {
    const res = await fetch(`${API_BASE_URL}/reports/${id}/notes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ notes, adminEmail }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  },

  // 7. Toggle Urgent (Requires Admin Auth)
  async toggleUrgent(id: string): Promise<Report | null> {
    const res = await fetch(`${API_BASE_URL}/reports/${id}/urgent`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  },

  // 8. Get Stats
  async getStats(daysRange: 7 | 30 | 90 = 30): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reports/stats?days=${daysRange}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return data.data;
  },

  // 9. Upload File to Backend & Cloudflare R2
  async uploadFile(file: File, reportId?: string): Promise<EvidenceItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (reportId) {
      formData.append('reportId', reportId);
    }

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }

    const data = await res.json();
    return data.item;
  },

  // 10. Admin Login (Generates secure signed JWT)
  async login(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; token?: string; error?: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'invalidCredentials' };
    }

    if (data.token && typeof localStorage !== 'undefined') {
      localStorage.setItem('nsl_admin_token', data.token);
    }

    return { success: true, user: data.user, token: data.token };
  },
};
