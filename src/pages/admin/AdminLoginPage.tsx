import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService, DEMO_ADMIN } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { OfficialEmblem } from '../../components/OfficialEmblem';
import { Lock, Mail, KeyRound, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect straight to /admin
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const dest = (location.state as any)?.from || '/admin';
      navigate(dest, { replace: true });
    }
  }, [navigate, location]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(t('errorRequiredField'));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = authService.login(email, password);
      setLoading(false);
      if (res.success) {
        const dest = (location.state as any)?.from || '/admin';
        navigate(dest, { replace: true });
      } else {
        setError(t('invalidCredentials'));
      }
    }, 300);
  };

  const handleFillDemo = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Portal Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#E8EEF7] space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <OfficialEmblem size={64} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0B1F3A]">
              {t('loginTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('loginSubtitle')}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A]"
              >
                {t('emailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nsl.gov.et"
                  autoComplete="email"
                  required
                  className="w-full pl-11 pr-4 min-h-[48px] rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5B700] text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-[#0B1F3A]"
              >
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-11 pr-4 min-h-[48px] rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5B700] text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] mt-2 rounded-xl font-bold text-sm bg-[#0B1F3A] hover:bg-[#122b4d] active:scale-98 text-white shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#F5B700] cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#F5B700]" />
                  <span>{t('signInBtn')}</span>
                  <ArrowRight className="w-4 h-4 text-[#F5B700]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Button */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0B1F3A] bg-[#E8EEF7] hover:bg-[#dbe4f3] transition-colors focus:outline-none focus:ring-1 focus:ring-[#F5B700]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5B700]" />
              <span>{t('fillDemoCreds')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
