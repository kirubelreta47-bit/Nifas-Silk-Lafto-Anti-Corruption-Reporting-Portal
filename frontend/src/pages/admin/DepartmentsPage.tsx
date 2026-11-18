import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { reportService } from '../../services/reportService';
import {
  DepartmentDef,
  getAllDepartments,
  saveCustomDepartment,
  deleteCustomDepartment,
  matchReportToDepartment,
} from '../../constants/departments';
import {
  Building2,
  Plus,
  QrCode,
  Copy,
  Check,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  // Departments State
  const [departments, setDepartments] = useState<DepartmentDef[]>(() => getAllDepartments());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'standard' | 'custom'>('all');

  // Form State
  const [nameAm, setNameAm] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [descriptionAm, setDescriptionAm] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Copied QR Link State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync with backend on mount
  useEffect(() => {
    let isMounted = true;
    apiClient.getDepartments().then((remoteDepts) => {
      if (!isMounted || !remoteDepts || remoteDepts.length === 0) return;
      remoteDepts.forEach((rd) => {
        if (rd.isCustom) {
          saveCustomDepartment(rd);
        }
      });
      setDepartments(getAllDepartments());
    });

    const handleUpdate = () => {
      setDepartments(getAllDepartments());
    };
    window.addEventListener('nsl_departments_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('nsl_departments_updated', handleUpdate);
    };
  }, []);

  // Compute live report counts per department
  const reports = useMemo(() => reportService.getReports(), []);
  const reportCountsByDept = useMemo(() => {
    const counts: Record<string, number> = {};
    departments.forEach((d) => (counts[d.id] = 0));
    reports.forEach((r) => {
      const matched = matchReportToDepartment(r.office, departments);
      if (matched) {
        counts[matched.id] = (counts[matched.id] || 0) + 1;
      }
    });
    return counts;
  }, [departments, reports]);

  // Auto-generate code when English name changes if not manually set
  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    const suggested = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 20);
    setCode(suggested);
  };

  // Quick fill preset templates
  const handleApplyPreset = (am: string, en: string, c: string, descAm?: string, descEn?: string) => {
    setNameAm(am);
    setNameEn(en);
    setCode(c);
    setDescriptionAm(descAm || '');
    setDescriptionEn(descEn || '');
    setFormError(null);
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanAm = nameAm.trim();
    const cleanEn = nameEn.trim();
    let cleanCode = code.trim().toLowerCase();

    if (!cleanAm) {
      setFormError(lang === 'am' ? 'እባክዎ የመሥሪያ ቤቱን የአማርኛ ስም ያስገቡ' : 'Amharic department name is required');
      return;
    }
    if (!cleanEn) {
      setFormError(lang === 'am' ? 'እባክዎ የመሥሪያ ቤቱን የእንግሊዝኛ ስም ያስገቡ' : 'English department name is required');
      return;
    }

    if (!cleanCode) {
      cleanCode = cleanEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 20);
    }

    // Check duplicate ID / code
    const duplicate = departments.find(
      (d) => d.id.toLowerCase() === cleanCode || d.code.toLowerCase() === cleanCode
    );
    if (duplicate) {
      setFormError(
        lang === 'am'
          ? `ይህ የመሥሪያ ቤት መለያ (${cleanCode}) አስቀድሞ ተመዝግቧል። እባክዎ የተለየ ኮድ ይጠቀሙ።`
          : `Department code (${cleanCode}) already exists. Please choose a different code.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const newDept: DepartmentDef = {
        id: cleanCode,
        code: cleanCode,
        am: cleanAm,
        en: cleanEn,
        descriptionAm: descriptionAm.trim() || undefined,
        descriptionEn: descriptionEn.trim() || undefined,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      // 1. Save locally for instantaneous response
      saveCustomDepartment(newDept);

      // 2. Persist to Neon PostgreSQL via backend API
      try {
        await apiClient.createDepartment({
          nameAm: cleanAm,
          nameEn: cleanEn,
          code: cleanCode,
          descriptionAm: descriptionAm.trim() || undefined,
          descriptionEn: descriptionEn.trim() || undefined,
        });
      } catch (backendErr) {
        console.warn('Backend sync notice (saved locally):', backendErr);
      }

      setDepartments(getAllDepartments());
      setNameAm('');
      setNameEn('');
      setCode('');
      setDescriptionAm('');
      setDescriptionEn('');
      setFormSuccess(
        lang === 'am'
          ? `"${cleanAm}" መሥሪያ ቤት በተሳካ ሁኔታ ተፈጥሯል! አሁን በዳሽቦርድ፣ በQR ፖስተር እና በሪፖርቶች ላይ ሙሉ በሙሉ ይሰራል።`
          : `Department "${cleanEn}" successfully created! It is now active on dashboard, QR poster generator, and all reports.`
      );
    } catch (err: any) {
      setFormError(err.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmMsg =
      lang === 'am'
        ? `እርግጠኛ ነዎት "${name}" የተሰኘውን መሥሪያ ቤት መሰረዝ ይፈልጋሉ?`
        : `Are you sure you want to delete "${name}"?`;
    if (!window.confirm(confirmMsg)) return;

    deleteCustomDepartment(id);
    try {
      await apiClient.deleteDepartment(id);
    } catch (err) {
      console.warn('Backend delete sync notice:', err);
    }
    setDepartments(getAllDepartments());
  };

  const handleCopyLink = (deptId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/?dept=${encodeURIComponent(deptId)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(deptId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered department list
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      if (filterType === 'standard' && d.isCustom) return false;
      if (filterType === 'custom' && !d.isCustom) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.en.toLowerCase().includes(q) ||
        d.am.includes(searchQuery.trim()) ||
        d.code.toLowerCase().includes(q)
      );
    });
  }, [departments, filterType, searchQuery]);

  const customCount = useMemo(() => departments.filter((d) => d.isCustom).length, [departments]);
  const standardCount = useMemo(() => departments.filter((d) => !d.isCustom).length, [departments]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-[#0B1F3A] text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5B700]/15 text-[#F5B700] text-xs font-bold border border-[#F5B700]/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>{lang === 'am' ? 'የመሥሪያ ቤቶች መዋቅር' : 'Department Governance'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'am' ? 'የመሥሪያ ቤቶች አስተዳደርና መፍጠሪያ' : 'Create & Manage Departments'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {lang === 'am'
                ? 'አዲስ መሥሪያ ቤቶችን፣ ኤጀንሲዎችን ወይም የወረዳ ጽ/ቤቶችን እዚህ ይፍጠሩ። የተፈጠሩት መሥሪያ ቤቶች ወዲያውኑ በዜጎች QR ፖስተር መፍጠሪያ፣ በዳሽቦርድ ስታቲስቲክስ እና በሪፖርቶች መከታተያ ላይ ይካተታሉ።'
                : 'Create and configure municipal offices, agencies, or woreda desks. Newly created departments instantly become active across citizen QR posters, dashboard charts, case routing, and report filters.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="block text-xl sm:text-2xl font-black text-white">{departments.length}</span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-semibold">
                {lang === 'am' ? 'ጠቅላላ' : 'Total'}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="block text-xl sm:text-2xl font-black text-[#F5B700]">{customCount}</span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-semibold">
                {lang === 'am' ? 'አዲስ የተፈጠሩ' : 'Admin Created'}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="block text-xl sm:text-2xl font-black text-emerald-400">{reports.length}</span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-semibold">
                {lang === 'am' ? 'ሪፖርቶች' : 'Reports'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Create Department Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E8EEF7] text-[#0B1F3A]">
              <Plus className="w-5 h-5 text-[#0B1F3A]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0B1F3A]">
                {lang === 'am' ? 'አዲስ መሥሪያ ቤት መፍጠሪያ' : 'Register New Department / Bureau'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'am'
                  ? 'የመሥሪያ ቤቱን ስም በአማርኛ እና በእንግሊዝኛ በማስገባት አዲስ መሥሪያ ቤት ይመዝግቡ'
                  : 'Enter the department names to activate it portal-wide'}
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F5B700]" />
              {lang === 'am' ? 'አብነቶች፡' : 'Presets:'}
            </span>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'የውሃና ፍሳሽ ኤጀንሲ',
                  'Water & Sewerage Agency',
                  'water-sewerage',
                  'የውሃ አቅርቦትና ፍሳሽ መስመሮች ጥገና ጽ/ቤት',
                  'Municipal drinking water and drainage infrastructure'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer text-[11px]"
            >
              {lang === 'am' ? 'የውሃና ፍሳሽ' : 'Water Agency'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'የገቢዎችና ጉምሩክ ቅርንጫፍ ጽ/ቤት',
                  'Revenues & Customs Branch',
                  'revenues-customs',
                  'የግብርና ቀረጥ አሰባሰብ እና የታክስ ቁጥጥር',
                  'Tax collection, audits, and tariff assessments'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer text-[11px]"
            >
              {lang === 'am' ? 'ገቢዎችና ጉምሩክ' : 'Revenues'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'የጤና ጣቢያዎችና ክሊኒኮች አስተዳደር',
                  'Health Centers & Clinics Bureau',
                  'health-clinics',
                  'የሕዝብ ጤና አገልግሎት እና የመድኃኒት አቅርቦት',
                  'Public primary healthcare and dispensary oversight'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer text-[11px]"
            >
              {lang === 'am' ? 'የጤና ጣቢያዎች' : 'Health Bureau'}
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleCreateDepartment} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Amharic Name */}
            <div className="space-y-1.5">
              <label htmlFor="dept-name-am" className="block text-xs font-bold text-[#0B1F3A]">
                {lang === 'am' ? 'የመሥሪያ ቤቱ ስም (በአማርኛ)' : 'Department Name (Amharic)'}{' '}
                <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <input
                id="dept-name-am"
                type="text"
                value={nameAm}
                onChange={(e) => setNameAm(e.target.value)}
                placeholder="ለምሳሌ፡ የውሃና ፍሳሽ ኤጀንሲ ወይም ወረዳ 05 ንግድ ጽ/ቤት"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] focus:bg-white text-slate-900 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors"
              />
            </div>

            {/* English Name */}
            <div className="space-y-1.5">
              <label htmlFor="dept-name-en" className="block text-xs font-bold text-[#0B1F3A]">
                {lang === 'am' ? 'የመሥሪያ ቤቱ ስም (በእንግሊዝኛ)' : 'Department Name (English)'}{' '}
                <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <input
                id="dept-name-en"
                type="text"
                value={nameEn}
                onChange={(e) => handleNameEnChange(e.target.value)}
                placeholder="e.g. Water & Sewerage Agency or Woreda 05 Trade"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] focus:bg-white text-slate-900 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Code / Slug */}
            <div className="space-y-1.5 md:col-span-1">
              <label htmlFor="dept-code" className="block text-xs font-bold text-[#0B1F3A]">
                {lang === 'am' ? 'የመሥሪያ ቤት ኮድ / መለያ' : 'Department Code / Slug'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                  #
                </span>
                <input
                  id="dept-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="water-agency"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] focus:bg-white text-slate-900 font-mono font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'am' ? 'ለQR ኮድ ሊንክ የሚውል መለያ (በእንግሊዝኛ)' : 'Used in QR links (?dept=code)'}
              </p>
            </div>

            {/* Description Amharic */}
            <div className="space-y-1.5 md:col-span-1">
              <label htmlFor="dept-desc-am" className="block text-xs font-bold text-[#0B1F3A]">
                {lang === 'am' ? 'አጭር መግለጫ (አማርኛ)' : 'Brief Description (Amharic)'}
              </label>
              <input
                id="dept-desc-am"
                type="text"
                value={descriptionAm}
                onChange={(e) => setDescriptionAm(e.target.value)}
                placeholder="የአገልግሎቱ ወይም የተቋሙ ዋና የስራ ዘርፍ"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] focus:bg-white text-slate-900 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors"
              />
            </div>

            {/* Description English */}
            <div className="space-y-1.5 md:col-span-1">
              <label htmlFor="dept-desc-en" className="block text-xs font-bold text-[#0B1F3A]">
                {lang === 'am' ? 'አጭር መግለጫ (እንግሊዝኛ)' : 'Brief Description (English)'}
              </label>
              <input
                id="dept-desc-en"
                type="text"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Mandate and public services covered"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] focus:bg-white text-slate-900 font-medium text-sm focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#F5B700] transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-[#0B1F3A] hover:bg-[#122b4d] active:scale-98 text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#F5B700] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#F5B700]" />
                  <span>{lang === 'am' ? 'መሥሪያ ቤቱን መዝግብና አንቃ' : 'Create & Activate Department'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Department Directory Listing */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-900" />
              <span>{lang === 'am' ? 'የመሥሪያ ቤቶች ማውጫ' : 'Active Department Directory'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {filteredDepartments.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'am'
                ? 'በፖርታሉ ላይ የሚገኙ ሁሉም መሥሪያ ቤቶች። ከእያንዳንዱ መሥሪያ ቤት ጎን የQR ኮድ ማመንጨት ወይም ሊንክ መቅዳት ይችላሉ።'
                : 'All configured bureaus. Use quick actions to launch QR code poster or copy citizen reporting links.'}
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-[#0B1F3A] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'am' ? 'ሁሉም' : 'All'} ({departments.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('standard')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'standard'
                    ? 'bg-white text-[#0B1F3A] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'am' ? 'መደበኛ' : 'Standard'} ({standardCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('custom')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'custom'
                    ? 'bg-white text-[#0B1F3A] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'am' ? 'አዲስ የተጨመሩ' : 'Admin Created'} ({customCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'am' ? 'መሥሪያ ቤት ፈልግ...' : 'Search bureau...'}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-[#F8FAFC] focus:bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1F3A]"
              />
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => {
            const count = reportCountsByDept[dept.id] || 0;
            const isCustom = dept.isCustom;

            return (
              <div
                key={dept.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isCustom
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {isCustom
                        ? lang === 'am'
                          ? 'አዲስ የተፈጠረ'
                          : 'Admin Created'
                        : lang === 'am'
                        ? 'መደበኛ ቢሮ'
                        : 'Standard Bureau'}
                    </span>

                    <span className="font-mono text-[11px] text-slate-400 font-semibold">
                      #{dept.code || dept.id}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[#0B1F3A] text-sm sm:text-base leading-snug">
                    {lang === 'am' ? dept.am : dept.en}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {lang === 'am' ? dept.en : dept.am}
                  </p>

                  {(dept.descriptionAm || dept.descriptionEn) && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 pt-1">
                      {lang === 'am'
                        ? dept.descriptionAm || dept.descriptionEn
                        : dept.descriptionEn || dept.descriptionAm}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-700">{count}</span>
                    <span className="text-[11px] text-slate-400">
                      {lang === 'am' ? 'ጥቆማዎች' : 'reports'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(dept.id)}
                      title={lang === 'am' ? 'የዜጋ መመዝገቢያ ሊንክ ቅዳ' : 'Copy citizen form link'}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0B1F3A] hover:border-slate-300 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    >
                      {copiedId === dept.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 text-[10px]">{lang === 'am' ? 'ተቀድቷል' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    {/* QR Code Action */}
                    <Link
                      to={`/admin/qr?dept=${encodeURIComponent(dept.id)}`}
                      title={lang === 'am' ? 'የዚህ መሥሪያ ቤት QR ኮድ አዘጋጅ' : 'Generate QR poster for this bureau'}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0B1F3A] hover:bg-[#122b4d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#F5B700]" />
                      <span>{lang === 'am' ? 'QR ኮድ' : 'QR'}</span>
                    </Link>

                    {/* Delete Custom Department */}
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDelete(dept.id, lang === 'am' ? dept.am : dept.en)}
                        title={lang === 'am' ? 'መሥሪያ ቤቱን ሰርዝ' : 'Delete custom department'}
                        className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
