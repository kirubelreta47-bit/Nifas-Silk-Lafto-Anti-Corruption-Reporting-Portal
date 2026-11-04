import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { OfficialEmblem } from './OfficialEmblem';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { Globe, ShieldCheck, Lock } from 'lucide-react';

export const Header: React.FC = () => {
  const { lang, toggleLang, t } = useLanguage();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isAuthenticated = authService.isAuthenticated();

  return (
    <header className="sticky top-0 z-40 bg-[#0B1F3A] text-white shadow-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Sub-City Name */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-[#F5B700] rounded-lg p-1 transition-all min-w-0"
            aria-label="Nifas Silk-Lafto Anti-Corruption Portal Home"
          >
            <OfficialEmblem size={38} className="sm:w-11 sm:h-11 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white truncate">
                {lang === 'am' ? 'ንፋስ ስልክ ላፍቶ' : 'Nifas Silk-Lafto'}
                <span className="hidden sm:inline"> {lang === 'am' ? 'ክፍለ ከተማ' : 'Sub-City'}</span>
              </span>
              <span className="hidden sm:block text-xs text-slate-300 font-normal truncate">
                {t('subCitySubtitle')}
              </span>
            </div>
          </Link>

          {/* Action buttons & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher Button */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label="Toggle language between Amharic and English"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5B700]" />
              <span>{lang === 'am' ? 'EN' : 'አማ'}</span>
              <span className="hidden md:inline text-xs font-normal text-slate-300">
                ({lang === 'am' ? 'English' : 'አማርኛ'})
              </span>
            </button>

            {/* Portal navigation links */}
            {!isAdminPath ? (
              <Link
                to={isAuthenticated ? '/admin' : '/admin/login'}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 border border-slate-700 hover:border-[#F5B700]/60 text-slate-100 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5B700] shrink-0" />
                <span className="hidden sm:inline">
                  {isAuthenticated ? t('adminPortal') : t('adminLogin')}
                </span>
                <span className="sm:hidden">
                  {isAuthenticated ? 'ዳሽቦርድ' : 'መግቢያ'}
                </span>
              </Link>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 border border-slate-700 text-slate-100 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
              >
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5B700] shrink-0" />
                <span className="hidden sm:inline">{t('backToPublic')}</span>
                <span className="sm:hidden">ጥቆማ</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
