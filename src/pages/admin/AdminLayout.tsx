import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { reportService } from '../../services/reportService';
import { useLanguage } from '../../context/LanguageContext';
import { OfficialEmblem } from '../../components/OfficialEmblem';
import {
  LayoutDashboard,
  FileSpreadsheet,
  QrCode,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check auth
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const currentUser = authService.getCurrentUser();
  const stats = reportService.getReportStats();

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      to: '/admin',
      end: true,
      label: t('adminDashboard'),
      icon: LayoutDashboard,
    },
    {
      to: '/admin/reports',
      label: t('adminReports'),
      icon: FileSpreadsheet,
      badge: stats.new > 0 ? stats.new : undefined,
    },
    {
      to: '/admin/qr',
      label: t('adminQrCode'),
      icon: QrCode,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0B1F3A] text-white px-4 py-3 flex items-center justify-between border-b border-[#F5B700]/30 z-30">
        <div className="flex items-center gap-2.5">
          <OfficialEmblem size={32} />
          <span className="font-bold text-sm tracking-tight">{t('adminPortal')}</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          className="p-2 rounded-lg bg-[#E8EEF7]/10 hover:bg-[#E8EEF7]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-30 w-64 bg-[#0B1F3A] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } h-screen`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-5 border-b border-slate-800 hidden md:flex items-center gap-3">
            <OfficialEmblem size={40} />
            <div>
              <div className="font-bold text-sm text-white">{t('subCityTitle')}</div>
              <div className="text-[11px] text-[#F5B700] font-semibold">{t('adminPortal')}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Admin Sidebar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#F5B700] text-[#0B1F3A] shadow-md'
                        : 'text-slate-300 hover:bg-[#E8EEF7]/10 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {/* User profile snippet */}
          <div className="p-3 rounded-xl bg-[#E8EEF7]/5 border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F5B700] text-[#0B1F3A] flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser?.name.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name}
              </div>
              <div className="text-[11px] text-[#F5B700] truncate">
                {currentUser?.email}
              </div>
            </div>
          </div>

          {/* Public site link */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#E8EEF7]/10 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>{t('backToPublic')}</span>
            </span>
          </a>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 border border-rose-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('adminLogout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
