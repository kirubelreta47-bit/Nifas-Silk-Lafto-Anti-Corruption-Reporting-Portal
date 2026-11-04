import { AdminUser } from '../types';
import { apiClient } from './apiClient';

const ADMIN_STORAGE_KEY = 'nsl_admin_session';

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await apiClient.login(cleanEmail, password);
      if (res.success && res.user) {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'invalidCredentials' };
    } catch (err: any) {
      // In local dev offline mode ONLY, allow dev credential if backend is offline
      if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV) {
        if (cleanEmail === 'admin@nsl.gov.et' && password === 'admin123') {
          const devUser: AdminUser = {
            email: 'admin@nsl.gov.et',
            name: 'Alemayehu Tadesse (Dev Offline)',
            role: 'admin',
          };
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(devUser));
          return { success: true, user: devUser };
        }
      }
      return {
        success: false,
        error: `Could not connect to authentication server: ${err.message}`,
      };
    }
  },

  getCurrentUser: (): AdminUser | null => {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as AdminUser;
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },

  logout: (): void => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem('nsl_admin_token');
  },
};
