import { AdminUser } from '../types';

const ADMIN_STORAGE_KEY = 'nsl_admin_session';

export const DEMO_ADMIN: AdminUser = {
  email: 'admin@nsl.gov.et',
  name: 'Alemayehu Tadesse',
  role: 'admin',
};

export const authService = {
  login: (email: string, password: string): { success: boolean; user?: AdminUser; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin@nsl.gov.et' && password === 'admin123') {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
      return { success: true, user: DEMO_ADMIN };
    }
    return { success: false, error: 'invalidCredentials' };
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
  },
};
