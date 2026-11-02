import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { reportService } from '../services/reportService';
import { CorruptionType, EvidenceItem, CreateReportInput } from '../types';
import { AudioRecorder } from '../components/AudioRecorder';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Upload,
  X,
  FileText,
  Music,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
  Phone,
  Calendar,
  MapPin,
  ArrowRight,
  EyeOff,
  UserCheck,
  Copy,
  Check,
  PhoneCall,
  Clock,
} from 'lucide-react';

const COMMON_OFFICES = [
  { am: 'የመሬት ልማትና አስተዳደር ጽ/ቤት', en: 'Land Administration & Management' },
  { am: 'የንግድና ገበያ ልማት ጽ/ቤት', en: 'Trade & Licensing Bureau' },
  { am: 'የቤቶች አስተዳደርና ልማት ኤጀንሲ', en: 'Housing Development Agency' },
  { am: 'የኮንስትራክሽን ፈቃድና ቁጥጥር', en: 'Construction & Building Permits' },
  { am: 'የወሳኝ ኩነትና መታወቂያ አገልግሎት', en: 'Vital Events & National ID' },
  { am: 'የትራፊክ ማኔጅመንትና ትራንስፖርት', en: 'Traffic Management & Transport' },
  { am: 'የፋይናንስና ኢኮኖሚ ልማት (ግዢ)', en: 'Finance & Procurement' },
  { am: 'የወረዳ ደንብ ማስከበር', en: 'Woreda Code Enforcement' },
];

export const PublicReportPage: React.FC = () => {
  const { t, lang } = useLanguage();

  // Form states
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [corruptionType, setCorruptionType] = useState<CorruptionType | ''>('');
  const [office, setOffice] = useState('');
  const [personInvolved, setPersonInvolved] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [honeypot, setHoneypot] = useState('');

  // UI / Submission states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Maximum allowed date is today
  const todayStr = new Date().toISOString().split('T')[0];

  const handleAnonymousChange = (anonymous: boolean) => {
    setIsAnonymous(anonymous);
    if (anonymous) {
      setReporterName('');
      setReporterPhone('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (evidenceList.length + files.length > 5) {
      setFileError(t('evidenceLimitReached'));
      return;
    }

    const validMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/m4a',
      'audio/mp4',
    ];

    Array.from(files).forEach((file) => {
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        setFileError(`${file.name}: ${t('fileSizeError')}`);
        return;
      }

      const isValidType = validMimes.some((mime) =>
        file.type.toLowerCase().includes(mime.split('/')[1]) || file.type === mime
      );

      if (!isValidType && !file.name.match(/\.(jpg|jpeg|png|webp|svg|pdf|mp3|wav|ogg|webm|m4a)$/i)) {
        setFileError(`${file.name}: ${t('fileTypeError')}`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newItem: EvidenceItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl,
        };
        setEvidenceList((prev) => [...prev, newItem].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!corruptionType) {
      newErrors.corruptionType = t('errorRequiredField');
    }
    if (!office.trim()) {
      newErrors.office = t('errorRequiredField');
    }
    if (!incidentDate) {
      newErrors.incidentDate = t('errorRequiredField');
    } else if (new Date(incidentDate) > new Date()) {
      newErrors.incidentDate = t('errorFutureDate');
    }
    if (!location.trim()) {
      newErrors.location = t('errorRequiredField');
    }
    if (!description.trim()) {
      newErrors.description = t('errorRequiredField');
    } else if (description.trim().length < 30) {
      newErrors.description = t('errorDescTooShort');
    }

    // Phone validation if entered
    if (!isAnonymous && reporterPhone.trim()) {
      const cleanPhone = reporterPhone.replace(/[\s-]/g, '');
      const etPhoneRegex = /^(?:\+2519|09|\+2517|07)\d{8}$/;
      if (!etPhoneRegex.test(cleanPhone)) {
        newErrors.reporterPhone = t('errorInvalidPhone');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitError(null);

    if (!validate()) {
      const firstError = document.querySelector('[aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    const inputData: CreateReportInput = {
      type: corruptionType as CorruptionType,
      office: office.trim(),
      personInvolved: personInvolved.trim() || undefined,
      incidentDate,
      location: location.trim(),
      description: description.trim(),
      isAnonymous,
      reporterName: isAnonymous ? undefined : reporterName.trim() || undefined,
      reporterPhone: isAnonymous ? undefined : reporterPhone.trim() || undefined,
      evidence: evidenceList,
      honeypot: honeypot.trim() || undefined,
    };

    setTimeout(() => {
      const result = reportService.submitReport(inputData);
      setIsSubmitting(false);

      if (result.success && result.report) {
        setSubmittedReportId(result.report.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (result.error === 'rateLimitWarning') {
          setRateLimitError(t('rateLimitWarning'));
        } else if (result.error === 'errorBotDetected') {
          setRateLimitError(t('errorBotDetected'));
        } else {
          setRateLimitError('ስህተት ተከስቷል፣ እባክዎ እንደገና ይሞክሩ።');
        }
      }
    }, 350);
  };

  const resetForm = () => {
    setSubmittedReportId(null);
    setIsAnonymous(true);
    setReporterName('');
    setReporterPhone('');
    setCorruptionType('');
    setOffice('');
    setPersonInvolved('');
    setIncidentDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setDescription('');
    setEvidenceList([]);
    setErrors({});
    setRateLimitError(null);
    setCopiedId(false);
  };

  const copyReportId = () => {
    if (!submittedReportId) return;
    navigator.clipboard.writeText(submittedReportId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedReportId) {
    return (
      <div className="w-full bg-white min-h-screen py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#F5B700]/15 flex items-center justify-center text-[#0B1F3A] ring-8 ring-[#F5B700]/10">
            <CheckCircle2 className="w-10 h-10 text-[#0B1F3A]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
              {t('successTitle')}
            </h1>
            <p className="text-sm sm:text-base text-slate-700 max-w-md mx-auto leading-relaxed">
              {t('successMessage')}
            </p>
          </div>

          <div className="p-5 bg-[#E8EEF7]/50 rounded-2xl border border-blue-200/80 inline-block min-w-[300px]">
            <div className="text-xs uppercase tracking-wider text-slate-600 font-bold mb-1">
              {t('successReferenceNote')}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#0B1F3A] tracking-wider">
                {submittedReportId}
              </span>
              <button
                type="button"
                onClick={copyReportId}
                aria-label="Copy reference ID"
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B1F3A] hover:bg-white transition-colors cursor-pointer"
                title="Copy ID"
              >
                {copiedId ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copiedId && (
              <span className="text-xs text-emerald-700 font-semibold block mt-1">
                {lang === 'am' ? 'መለያ ቁጥሩ ተገልብጧል' : 'Copied to clipboard'}
              </span>
            )}
          </div>

          <div className="p-4 bg-[#F8FAFC] text-slate-800 rounded-xl text-xs sm:text-sm max-w-md mx-auto flex items-start gap-3 text-left border border-slate-200">
            <Lock className="w-4 h-4 text-[#0B1F3A] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{t('successSecurityNote')}</p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-[#F5B700] hover:bg-[#e0a700] text-[#0B1F3A] transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
            >
              <span>{t('submitAnotherBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER AREA - Full width across max-w-7xl */}
        <div className="mb-8 pb-6 border-b border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#F5B700]" />
            <span>{t('cityGov')} • {t('subCityTitle')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT (FITS SCREEN NATURALLY, NOT A CONSTRAINED CARD) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* MAIN FORM FLOW */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* Honeypot field (hidden to real humans, catches automated bots) */}
              <div className="absolute opacity-0 -z-50 pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="nsl_bot_trap">Do not fill this field</label>
            <input
              type="text"
              id="nsl_bot_trap"
              name="nsl_bot_trap"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Rate limit warning banner */}
          {rateLimitError && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-sm font-semibold flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <span>{rateLimitError}</span>
            </div>
          )}

          {/* 1. ANONYMITY SELECTION (MINIMALIST) */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {lang === 'am' ? 'የጥቆማ አቀራረብ (ማንነት)' : 'Reporting Identity'}
              </span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleAnonymousChange(true)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isAnonymous
                      ? 'bg-[#0B1F3A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5 text-[#F5B700]" />
                  <span>{lang === 'am' ? 'በስውር (Anonymous)' : 'Anonymous'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAnonymousChange(false)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    !isAnonymous
                      ? 'bg-[#0B1F3A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#F5B700]" />
                  <span>{lang === 'am' ? 'ስም እና ስልክ በመግለጽ' : 'With Contact'}</span>
                </button>
              </div>
            </div>

            {/* Optional Contact fields when anonymity is turned off */}
            {!isAnonymous && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label htmlFor="reporter-name" className="block text-xs sm:text-sm font-bold text-[#0B1F3A]">
                    {t('fullNameLabel')} <span className="font-normal text-slate-500">(አማራጭ)</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reporter-name"
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder={t('fullNamePlaceholder')}
                      className="w-full pl-10 pr-3.5 min-h-[48px] rounded-xl border border-slate-300 bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-1 focus:ring-[#0B1F3A] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reporter-phone" className="block text-xs sm:text-sm font-bold text-[#0B1F3A]">
                    {t('phoneLabel')} <span className="font-normal text-slate-500">(አማራጭ)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reporter-phone"
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder={t('phonePlaceholder')}
                      aria-invalid={!!errors.reporterPhone}
                      className={`w-full pl-10 pr-3.5 min-h-[48px] rounded-xl border bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-1 focus:ring-[#0B1F3A] transition-colors ${
                        errors.reporterPhone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.reporterPhone && (
                    <p className="text-xs text-rose-700 font-bold">{errors.reporterPhone}</p>
                  )}
                  <p className="text-xs text-slate-500">{t('phoneHint')}</p>
                </div>
              </div>
            )}
          </div>

          {/* 2. INCIDENT & OFFICE DETAILS */}
          <div className="space-y-5 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#0B1F3A] text-white">
                01
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-[#0B1F3A]">
                {t('stepIncident')}
              </h2>
            </div>

            {/* Corruption Type */}
            <div className="space-y-1.5">
              <label htmlFor="corruption-type" className="block text-xs sm:text-sm font-bold text-[#0B1F3A]">
                {t('corruptionTypeLabel')} <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <select
                id="corruption-type"
                value={corruptionType}
                onChange={(e) => {
                  setCorruptionType(e.target.value as CorruptionType);
                  if (errors.corruptionType) setErrors((prev) => ({ ...prev, corruptionType: '' }));
                }}
                aria-invalid={!!errors.corruptionType}
                className={`w-full px-3.5 min-h-[48px] rounded-xl border bg-[#F8FAFC] focus:bg-white text-slate-900 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors ${
                  errors.corruptionType ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                }`}
              >
                <option value="">{t('selectCorruptionType')}</option>
                <option value="bribery">{t('bribery')}</option>
                <option value="illegal_land_housing">{t('illegal_land_housing')}</option>
                <option value="abuse_of_power">{t('abuse_of_power')}</option>
                <option value="fake_documents">{t('fake_documents')}</option>
                <option value="embezzlement">{t('embezzlement')}</option>
                <option value="favoritism">{t('favoritism')}</option>
                <option value="other">{t('other')}</option>
              </select>
              {errors.corruptionType && (
                <p className="text-xs text-rose-700 font-bold">{errors.corruptionType}</p>
              )}
            </div>

            {/* Office or Department */}
            <div className="space-y-2">
              <label htmlFor="office-input" className="block text-xs sm:text-sm font-bold text-[#0B1F3A]">
                {t('officeLabel')} <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="office-input"
                  type="text"
                  value={office}
                  onChange={(e) => {
                    setOffice(e.target.value);
                    if (errors.office) setErrors((prev) => ({ ...prev, office: '' }));
                  }}
                  placeholder={t('officePlaceholder')}
                  aria-invalid={!!errors.office}
                  className={`w-full pl-10 pr-3.5 min-h-[48px] rounded-xl border bg-[#F8FAFC] focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors ${
                    errors.office ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.office && <p className="text-xs text-rose-700 font-bold">{errors.office}</p>}

              {/* Department suggestions as clean chips */}
              <div className="pt-1 space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 block">
                  {t('quickOfficesLabel')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_OFFICES.map((item, idx) => {
                    const label = lang === 'am' ? item.am : item.en;
                    const isSelected = office === label;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setOffice(label);
                          if (errors.office) setErrors((prev) => ({ ...prev, office: '' }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-[#0B1F3A] text-[#F5B700] border-[#0B1F3A]'
                            : 'bg-[#E8EEF7]/50 hover:bg-[#E8EEF7] text-slate-700 hover:text-[#0B1F3A] border-transparent hover:border-blue-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Person Involved */}
            <div className="space-y-1.5">
              <label htmlFor="person-involved" className="block text-xs sm:text-sm font-bold text-[#0B1F3A]">
                {t('personInvolvedLabel')} <span className="font-normal text-slate-500">(አማራጭ)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="person-involved"
                  type="text"
                  value={personInvolved}
                  onChange={(e) => setPersonInvolved(e.target.value)}
                  placeholder={t('personInvolvedPlaceholder')}
                  className="w-full pl-10 pr-3.5 min-h-[48px] rounded-xl border border-slate-300 bg-[#F8FAFC] focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors"
                />
              </div>
            </div>

            {/* Date & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="incident-date" className="block text-xs sm:text-sm font-bold text-[#0B1F3A]">
                  {t('incidentDateLabel')} <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="incident-date"
                    type="date"
                    max={todayStr}
                    value={incidentDate}
                    onChange={(e) => {
                      setIncidentDate(e.target.value);
                      if (errors.incidentDate) setErrors((prev) => ({ ...prev, incidentDate: '' }));
                    }}
                    aria-invalid={!!errors.incidentDate}
                    className={`w-full pl-10 pr-3.5 min-h-[48px] rounded-xl border bg-[#F8FAFC] focus:bg-white text-slate-900 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors ${
                      errors.incidentDate ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.incidentDate && (
                  <p className="text-xs text-rose-700 font-bold">{errors.incidentDate}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="location-input" className="block text-xs sm:text-sm font-bold text-[#0B1F3A]">
                  {t('locationLabel')} <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="location-input"
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                    }}
                    placeholder={t('locationPlaceholder')}
                    aria-invalid={!!errors.location}
                    className={`w-full pl-10 pr-3.5 min-h-[48px] rounded-xl border bg-[#F8FAFC] focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors ${
                      errors.location ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-rose-700 font-bold">{errors.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. DETAILED DESCRIPTION */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#0B1F3A] text-white">
                  02
                </span>
                <label htmlFor="report-description" className="text-sm sm:text-base font-extrabold text-[#0B1F3A]">
                  {t('stepDescription')} <span className="text-rose-600 font-extrabold">*</span>
                </label>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  description.length < 30
                    ? 'text-amber-800 bg-amber-50 border border-amber-200'
                    : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                }`}
              >
                {description.length >= 30 ? '✓ ' : ''}
                {description.length} / 30+ {t('charCount')}
              </span>
            </div>

            <textarea
              id="report-description"
              rows={5}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder={t('descriptionPlaceholder')}
              aria-invalid={!!errors.description}
              className={`w-full p-4 rounded-xl border bg-[#F8FAFC] focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] leading-relaxed transition-colors ${
                errors.description ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-700 font-bold">{errors.description}</p>
            )}
          </div>

          {/* 4. EVIDENCE & VOICE NOTE ATTACHMENTS */}
          <div className="space-y-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#0B1F3A] text-white">
                03
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-[#0B1F3A]">
                {t('stepEvidence')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('evidenceSubtitle')}
            </p>

            {fileError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{fileError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label
                htmlFor="file-upload-input"
                className={`flex-1 flex items-center justify-center gap-2.5 p-4 border border-dashed rounded-xl cursor-pointer transition-colors text-xs sm:text-sm font-semibold ${
                  evidenceList.length >= 5
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                    : 'bg-[#F8FAFC] hover:bg-[#E8EEF7]/50 border-slate-300 hover:border-[#0B1F3A] text-slate-700 hover:text-[#0B1F3A]'
                }`}
              >
                <Upload className="w-4 h-4 text-[#0B1F3A]" />
                <span>
                  {t('dragDropText')} <strong className="text-blue-900 underline font-bold ml-1">{t('browseFiles')}</strong>
                </span>
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf,audio/*"
                  disabled={evidenceList.length >= 5}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="shrink-0 flex items-center">
                <AudioRecorder
                  disabled={evidenceList.length >= 5}
                  onAudioRecorded={(audioItem) => {
                    setEvidenceList((prev) => [...prev, audioItem].slice(0, 5));
                  }}
                />
              </div>
            </div>

            {/* Attached items list */}
            {evidenceList.length > 0 && (
              <div className="space-y-2 pt-1">
                {evidenceList.map((file) => {
                  const isAudio = file.type.startsWith('audio/');
                  const isPdf = file.type.includes('pdf');

                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isAudio ? (
                          <Music className="w-4 h-4 text-purple-700 shrink-0" />
                        ) : isPdf ? (
                          <FileText className="w-4 h-4 text-rose-700 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900 truncate max-w-xs">{file.name}</span>
                        <span className="text-slate-500 text-xs font-mono">({formatFileSize(file.size)})</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeEvidence(file.id)}
                        aria-label={`${t('removeFile')}: ${file.name}`}
                        className="text-slate-400 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. SUBMIT ACTION (MINIMALIST) */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 min-h-[50px] rounded-xl font-bold text-sm sm:text-base bg-[#F5B700] hover:bg-[#e0a700] active:scale-[0.99] text-[#0B1F3A] transition-all flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-[#0B1F3A] border-t-transparent rounded-full animate-spin" />
                  <span>{t('submittingBtn')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-[#0B1F3A]" />
                  <span>{t('submitReportBtn')}</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{lang === 'am' ? 'ጥቆማዎ በቀጥታ ለፀረ-ሙስና ክፍሉ ብቻ ይደርሳል፤ ሚስጥራዊነቱ በህግ የተጠበቀ ነው።' : 'Your report is sent directly and securely to the Anti-Corruption Directorate.'}</span>
            </div>
          </div>
        </form>
      </div>

      {/* RIGHT SIDEBAR: STATUTORY PROTECTION & CIVIC HOTLINES (MINIMALIST) */}
      <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
        {/* Whistleblower Legal Protection Block */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2.5 text-[#0B1F3A]">
            <div className="p-2 rounded-lg bg-[#0B1F3A] text-[#F5B700]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0B1F3A] leading-tight">
                {t('sidebarWhistleblowerTitle')}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {t('sidebarSecurityBadge')}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {t('sidebarWhistleblowerDesc')}
          </p>
        </div>

        {/* What Happens After Submission */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-[#0B1F3A] flex items-center gap-2 border-b border-slate-200/60 pb-2.5">
            <Clock className="w-4 h-4 text-[#F5B700]" />
            <span>{t('sidebarProcessTitle')}</span>
          </h3>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#0B1F3A] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0B1F3A] leading-tight">
                  {t('sidebarStep1Title')}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t('sidebarStep1Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#0B1F3A] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0B1F3A] leading-tight">
                  {t('sidebarStep2Title')}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t('sidebarStep2Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#0B1F3A] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0B1F3A] leading-tight">
                  {t('sidebarStep3Title')}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t('sidebarStep3Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#0B1F3A] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0B1F3A] leading-tight">
                  {t('sidebarStep4Title')}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t('sidebarStep4Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Hotlines & Sub-City Contacts */}
        <div className="p-5 rounded-2xl bg-[#0B1F3A] text-white space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#F5B700]" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">
              {t('sidebarHotlinesTitle')}
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#F5B700]" />
              <span className="font-bold text-white text-base">969</span>
              <span className="text-xs text-slate-300 font-medium">
                ({lang === 'am' ? 'ነፃ መስመር' : 'Toll-free'})
              </span>
            </li>
            <li className="flex items-center gap-2.5 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#F5B700]" />
              <span className="font-medium">+251 11 442 0123 / 011 442 0456</span>
            </li>
            <li className="flex items-start gap-2.5 text-slate-300 text-xs pt-1 border-t border-slate-700/80">
              <MapPin className="w-3.5 h-3.5 text-[#F5B700] shrink-0 mt-0.5" />
              <span>{t('sidebarLocationText')}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</div>
  );
};
