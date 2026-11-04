import {
  Report,
  CreateReportInput,
  FilterOptions,
  ReportStatus,
  EvidenceItem,
  AdminUser,
} from '../types';

/**
 * Safely resolves the Backend API base URL.
 * Automatically prevents calling http://localhost when running on a live HTTPS site (which causes browser security warnings).
 */
export const getApiBaseUrl = (): string => {
  // 1. Check custom user-configured backend in localStorage (allows instant connection without rebuilding Vercel)
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('nsl_backend_api_url');
    if (saved && saved.trim()) {
      const clean = saved.trim().replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
  }

  // 2. Build-time environment variable from Vercel/Vite
  const envUrl =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL);

  if (envUrl && envUrl.trim() && !envUrl.includes('localhost:5000')) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // 3. Detect if running on a live remote host (e.g. *.vercel.app)
  if (typeof window !== 'undefined' && window.location) {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.');

    // If on a remote HTTPS site and no backend URL was supplied, DO NOT attempt to call localhost:5000!
    // That prevents the browser's Private Network Access security popup ("access other apps and services on this device").
    if (!isLocal) {
      if (envUrl && envUrl.trim()) {
        const clean = envUrl.trim().replace(/\/+$/, '');
        return clean.endsWith('/api') ? clean : `${clean}/api`;
      }
      return ''; // empty indicates backend not connected yet
    }
  }

  return envUrl || 'http://localhost:5000/api';
};

export const setApiBaseUrl = (url: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const clean = url.trim().replace(/\/+$/, '');
    const apiUrl = clean.endsWith('/api') ? clean : `${clean}/api`;
    window.localStorage.setItem('nsl_backend_api_url', apiUrl);
  }
};

export const clearApiBaseUrl = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('nsl_backend_api_url');
  }
};

/**
 * Backward-compatible constant getter
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Resolves relative file URLs (e.g. /api/upload/file/...) to the full backend endpoint
 */
export const resolveFileUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = getApiBaseUrl().replace(/\/api\/?$/, '');
  if (!base) return url;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('nsl_admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiClient = {
  // 1. Health check
  async checkHealth(targetUrl?: string): Promise<{ status: string; database?: any; storage?: any } | null> {
    const base = targetUrl ? targetUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '') : getApiBaseUrl().replace(/\/api\/?$/, '');
    if (!base) return null;

    try {
      const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // 2. Fetch Reports
  async getReports(filters: FilterOptions = {}): Promise<Report[]> {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error('Backend server is not connected. Please configure your Render backend URL.');
    }

    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.anonymousOnly) params.append('anonymousOnly', 'true');
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const url = `${baseUrl}/reports?${params.toString()}`;
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
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error('Backend server is not connected. Please configure your Render backend URL.');
    }

    const res = await fetch(`${baseUrl}/reports/${id}`, {
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
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        error: 'Backend server is not connected. Please connect your Render backend URL to submit.',
      };
    }

    const res = await fetch(`${baseUrl}/reports`, {
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
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) throw new Error('Backend server is not connected.');

    const res = await fetch(`${baseUrl}/reports/${id}/status`, {
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
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) throw new Error('Backend server is not connected.');

    const res = await fetch(`${baseUrl}/reports/${id}/notes`, {
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
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) throw new Error('Backend server is not connected.');

    const res = await fetch(`${baseUrl}/reports/${id}/urgent`, {
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
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) throw new Error('Backend server is not connected.');

    const res = await fetch(`${baseUrl}/reports/stats?days=${daysRange}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return data.data;
  },

  // 9. Upload File to Backend
  async uploadFile(file: File, reportId?: string): Promise<EvidenceItem> {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error('Backend server is not connected. Please connect your Render backend URL.');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (reportId) {
      formData.append('reportId', reportId);
    }

    const res = await fetch(`${baseUrl}/upload`, {
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
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      return { success: false, error: 'Backend server is not connected. Please configure your Render backend URL.' };
    }

    const res = await fetch(`${baseUrl}/auth/login`, {
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
