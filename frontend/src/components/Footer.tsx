import React from 'react';
import { OfficialEmblem } from './OfficialEmblem';
import { useLanguage } from '../context/LanguageContext';
import { Shield, PhoneCall, MapPin, Lock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="no-print bg-[#0B1F3A] text-white border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Identity & Guarantee */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <OfficialEmblem size={44} />
              <div>
                <h3 className="font-bold text-base text-white">{t('subCityTitle')}</h3>
                <p className="text-xs text-[#E8EEF7]/80">{t('cityGov')}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('reassuranceDesc')}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E8EEF7]/10 text-xs text-[#F5B700] font-medium border border-[#F5B700]/30">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Confidential • No IP Logging</span>
            </div>
          </div>

          {/* Col 2: Emergency & Hotlines */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-2">
              <PhoneCall className="w-4 h-4 text-[#F5B700]" />
              የፀረ-ሙስና የስልክ መስመሮች | Hotlines
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F5B700]" />
                <span className="font-semibold text-white">969</span>
                <span className="text-xs text-slate-400">(Toll-free hotline / ነፃ የስልክ መስመር)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F5B700]" />
                <span>+251 11 442 0123 / 011 442 0456</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F5B700] shrink-0" />
                <span className="text-xs">ክፍለ ከተማው ዋና አስተዳደር ጽ/ቤት፣ ጎተራ / ሳሪስ መንገድ፣ አዲስ አበባ</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links & Transparency */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-2">
              <Shield className="w-4 h-4 text-[#F5B700]" />
              መረጃ እና አስተዳደር | Transparency
            </h4>
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <Link to="/" className="hover:text-[#F5B700] transition-colors flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                {t('backToPublic')}
              </Link>
              <div className="pt-2 text-xs text-slate-400">
                የፌዴራል ሥነ-ምግባርና ፀረ-ሙስና ኮሚሽን እና የአዲስ አበባ ከተማ አስተዳደር መመሪያ ቁጥር 21/2015 መሠረት የሚሰራ።
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {t('subCityTitle')} አስተዳደር። መብቱ በሕግ የተጠበቀ ነው።</p>
          <p className="text-slate-400">Designed for Nifas Silk-Lafto Sub-City Citizens & Integrity Officers</p>
        </div>
      </div>
    </footer>
  );
};
