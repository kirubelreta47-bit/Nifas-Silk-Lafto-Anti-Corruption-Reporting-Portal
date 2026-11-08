import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Report, CorruptionType, ReportStatus } from '../../types';
import { COMMON_DEPARTMENTS, matchReportToDepartment } from '../../constants/departments';
import {
  Search,
  Filter,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  ArrowLeft,
  QrCode,
  Layers,
  Table as TableIcon,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const ReportsListPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [officeFilter, setOfficeFilter] = useState<string>(() => searchParams.get('office') || 'all');
  const [anonymousOnly, setAnonymousOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [syncTrigger, setSyncTrigger] = useState(0);

  // View Mode: 'table' (classic) or 'grouped' (department-by-department cards)
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');

  React.useEffect(() => {
    reportService.syncWithBackend().then(() => setSyncTrigger((v) => v + 1));
  }, []);

  // Sync state if URL query params change
  React.useEffect(() => {
    const urlOffice = searchParams.get('office');
    if (urlOffice && urlOffice !== officeFilter) {
      setOfficeFilter(urlOffice);
    }
  }, [searchParams]);

  const getCorruptionTypeLabel = (type: CorruptionType) => {
    switch (type) {
      case 'bribery':
        return t('bribery');
      case 'illegal_land_housing':
        return t('illegal_land_housing');
      case 'abuse_of_power':
        return t('abuse_of_power');
      case 'fake_documents':
        return t('fake_documents');
      case 'embezzlement':
        return t('embezzlement');
      case 'favoritism':
        return t('favoritism');
      case 'other':
        return t('other');
      default:
        return type;
    }
  };

  // All reports from service (unfiltered by office for stats and tabs)
  const allReports = useMemo(() => {
    return reportService.getReports();
  }, [syncTrigger]);

  // Compute departmental distribution for the visual bar and tab counts
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    COMMON_DEPARTMENTS.forEach((d) => (counts[d.id] = 0));

    allReports.forEach((r) => {
      const matched = matchReportToDepartment(r.office);
      if (matched) {
        counts[matched.id] = (counts[matched.id] || 0) + 1;
      }
    });

    return counts;
  }, [allReports]);

  // Filtered reports for current selection
  const filteredReports = useMemo(() => {
    let reports = reportService.getReports({
      search: search.trim() || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      anonymousOnly,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });

    if (officeFilter !== 'all') {
      const q = officeFilter.toLowerCase();
      reports = reports.filter((r) => r.office.toLowerCase().includes(q));
    }

    return reports;
  }, [search, statusFilter, typeFilter, officeFilter, anonymousOnly, dateFrom, dateTo, syncTrigger]);

  // Grouped reports by department (for "Grouped by Department" view)
  const groupedDepartmentReports = useMemo(() => {
    return COMMON_DEPARTMENTS.map((dept) => {
      const deptReports = filteredReports.filter((r) => {
        const m = matchReportToDepartment(r.office);
        return (
          m?.id === dept.id ||
          r.office.toLowerCase().includes(dept.en.toLowerCase()) ||
          r.office.includes(dept.am)
        );
      });

      return {
        department: dept,
        reports: deptReports,
        total: deptReports.length,
        newCount: deptReports.filter((r) => r.status === 'new').length,
      };
    });
  }, [filteredReports]);

  // Pagination calculation
  const totalReports = filteredReports.length;
  const totalPages = Math.ceil(totalReports / ITEMS_PER_PAGE) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReports.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const handleSelectDepartmentTab = (deptEn: string | 'all') => {
    setOfficeFilter(deptEn);
    setCurrentPage(1);
    if (deptEn === 'all') {
      searchParams.delete('office');
    } else {
      searchParams.set('office', deptEn);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setOfficeFilter('all');
    setAnonymousOnly(false);
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    officeFilter !== 'all' ||
    anonymousOnly ||
    dateFrom !== '' ||
    dateTo !== '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#0B1F3A] bg-[#E8EEF7] hover:bg-[#F5B700] border border-blue-200/60 transition-colors shadow-2xs group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>{t('backToDashboard')}</span>
        </Link>

        {officeFilter !== 'all' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-bold text-[#0B1F3A]">{officeFilter}</span>
            <button
              type="button"
              onClick={() => handleSelectDepartmentTab('all')}
              className="text-slate-400 hover:text-slate-800 ml-1 font-bold text-sm leading-none cursor-pointer"
              title="Clear office filter"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Title & View Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="w-7 h-7 text-[#F5B700]" />
            <span>{t('adminReports')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('subCityTitle')} • የቀረቡ የሙስና ጥቆማዎች በመሥሪያ ቤት የተከፋፈለ ዝርዝር
          </p>
        </div>

        {/* View Mode Switcher: Table vs Grouped by Department */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-[#0B1F3A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{t('tableView')}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grouped')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grouped'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#F5B700]" />
            <span>{t('groupByDepartment')}</span>
          </button>
        </div>
      </div>

      {/* 1. DEPARTMENT VISUAL DISTRIBUTION HEAT STRIP */}
      {allReports.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#F5B700]" />
              <span>{t('departmentShare')} (Report Volume Distribution)</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {allReports.length} Total Reports
            </span>
          </div>

          {/* Segmented Distribution Bar */}
          <div className="w-full h-4 rounded-xl overflow-hidden flex bg-slate-100">
            {COMMON_DEPARTMENTS.map((dept, index) => {
              const count = departmentCounts[dept.id] || 0;
              if (count === 0) return null;
              const pct = Math.round((count / allReports.length) * 100);
              const colors = [
                'bg-rose-600 hover:bg-rose-700',
                'bg-amber-500 hover:bg-amber-600',
                'bg-[#0B1F3A] hover:bg-[#122b4d]',
                'bg-blue-600 hover:bg-blue-700',
                'bg-purple-600 hover:bg-purple-700',
                'bg-emerald-600 hover:bg-emerald-700',
                'bg-teal-600 hover:bg-teal-700',
                'bg-indigo-600 hover:bg-indigo-700',
              ];
              const barColor = colors[index % colors.length];

              return (
                <div
                  key={dept.id}
                  onClick={() => handleSelectDepartmentTab(dept.en)}
                  className={`${barColor} transition-all cursor-pointer relative group`}
                  style={{ width: `${Math.max(6, pct)}%` }}
                  title={`${dept.en}: ${count} reports (${pct}%)`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 2. DEPARTMENT TABS (CLICK TO ISOLATE REPORTS FOR EACH BUREAU) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => handleSelectDepartmentTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
            officeFilter === 'all'
              ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#F5B700]" />
          <span>{t('allOfficesFilter')}</span>
          <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-white/20 text-white font-extrabold">
            {allReports.length}
          </span>
        </button>

        {COMMON_DEPARTMENTS.map((dept) => {
          const isSelected = officeFilter.toLowerCase().includes(dept.en.toLowerCase());
          const count = departmentCounts[dept.id] || 0;

          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => handleSelectDepartmentTab(dept.en)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs ring-2 ring-[#F5B700]'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-[#0B1F3A] font-extrabold">
                {dept.code.toUpperCase()}
              </span>
              <span className="line-clamp-1">{lang === 'am' ? dept.am : dept.en}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  isSelected
                    ? 'bg-[#F5B700] text-[#0B1F3A]'
                    : count > 0
                    ? 'bg-blue-100 text-blue-900 font-mono'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4">
        {/* Top search & quick clear */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer self-end sm:self-auto"
            >
              <X className="w-4 h-4" />
              <span>{t('clearFilters')}</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Status filter */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">
              {t('filterByStatus')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
            >
              <option value="all">{t('filterAll')} (ሁሉም)</option>
              <option value="new">{t('status_new')}</option>
              <option value="under_review">{t('status_under_review')}</option>
              <option value="investigating">{t('status_investigating')}</option>
              <option value="resolved">{t('status_resolved')}</option>
              <option value="rejected">{t('status_rejected')}</option>
            </select>
          </div>

          {/* Type filter */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">
              {t('filterByType')}
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
            >
              <option value="all">{t('filterAll')} (ሁሉም)</option>
              <option value="bribery">{t('bribery')}</option>
              <option value="illegal_land_housing">{t('illegal_land_housing')}</option>
              <option value="abuse_of_power">{t('abuse_of_power')}</option>
              <option value="fake_documents">{t('fake_documents')}</option>
              <option value="embezzlement">{t('embezzlement')}</option>
              <option value="favoritism">{t('favoritism')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          {/* Department / Office filter */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">
              {t('filterByOffice')}
            </label>
            <select
              value={officeFilter}
              onChange={(e) => handleSelectDepartmentTab(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
            >
              <option value="all">{t('allOfficesFilter')}</option>
              {COMMON_DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.en}>
                  {lang === 'am' ? dept.am : dept.en}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range From */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">
              {t('dateFrom')}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
            />
          </div>

          {/* Date Range To */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">
              {t('dateTo')}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
            />
          </div>
        </div>

        {/* Anonymous Only Checkbox */}
        <div className="pt-2 flex items-center">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={anonymousOnly}
              onChange={(e) => {
                setAnonymousOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 rounded text-[#0B1F3A] focus:ring-[#F5B700] border-slate-300"
            />
            <span className="text-xs font-bold text-[#0B1F3A]">
              {t('filterAnonymousOnly')}
            </span>
          </label>
        </div>
      </div>

      {/* 3. GROUPED BY DEPARTMENT VIEW (KEY USER REQUIREMENT) */}
      {viewMode === 'grouped' ? (
        <div className="space-y-6">
          {groupedDepartmentReports.map(({ department, reports, total, newCount }) => {
            return (
              <div
                key={department.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4"
              >
                {/* Department Header Banner */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0B1F3A] text-[#F5B700] shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-[#0B1F3A] text-white">
                          {department.code.toUpperCase()}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-[#0B1F3A]">
                          {lang === 'am' ? department.am : department.en}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {lang === 'am' ? department.en : department.am}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    {newCount > 0 && (
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{newCount} New Reports</span>
                      </span>
                    )}

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0B1F3A] border border-blue-200">
                      {total} Reports Total
                    </span>

                    <Link
                      to="/admin/qr-code"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                      title={t('generateQrForDepartment')}
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#0B1F3A]" />
                      <span className="hidden sm:inline">QR Code</span>
                    </Link>
                  </div>
                </div>

                {/* Reports List for this Department */}
                {reports.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    {lang === 'am'
                      ? 'ለዚህ መሥሪያ ቤት እስካሁን የቀረበ የሙስና ጥቆማ የለም።'
                      : 'No reports recorded yet under this department desk.'}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 px-4 sm:px-6 pb-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-extrabold text-[#0B1F3A]">
                              {report.id}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              • {getCorruptionTypeLabel(report.type)}
                            </span>
                            <StatusBadge status={report.status} />
                            {report.urgent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">
                            {report.description}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {report.location} • {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <Link
                          to={`/admin/reports/${report.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0B1F3A] bg-[#E8EEF7] hover:bg-[#F5B700] transition-colors shrink-0 self-end sm:self-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('viewDetail')}</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. CLASSIC TABLE VIEW */
        <div className="bg-white rounded-3xl border border-[#E8EEF7] shadow-sm overflow-hidden">
          {paginatedReports.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#0B1F3A]">{t('noReportsFound')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{t('noReportsHint')}</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0B1F3A] bg-[#F5B700] hover:bg-[#e0a700]"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B1F3A] text-white text-xs font-bold uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-4">
                        {t('tableId')}
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        {t('tableType')}
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        {t('tableOffice')}
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        {t('tableDate')}
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        {t('tableStatus')}
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        {t('tableReporter')}
                      </th>
                      <th scope="col" className="py-3.5 px-4 text-right">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedReports.map((report: Report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-4 px-4 font-mono font-bold text-[#0B1F3A] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {!report.seen && (
                              <span
                                title="New / Unseen"
                                className="w-2.5 h-2.5 rounded-full bg-[#F5B700] ring-4 ring-[#F5B700]/30 shrink-0"
                              />
                            )}
                            <span>{report.id}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs font-medium text-slate-800">
                          <span className="line-clamp-1">{getCorruptionTypeLabel(report.type)}</span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-[#0B1F3A] line-clamp-1 text-xs flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#F5B700] shrink-0" />
                            <span>{report.office}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {report.location}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={report.status} />
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {report.isAnonymous ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                              {t('anonymousBadge')}
                            </span>
                          ) : (
                            <div className="text-xs">
                              <span className="font-semibold text-blue-900 block">
                                {report.reporterName || t('namedBadge')}
                              </span>
                              {report.reporterPhone && (
                                <span className="text-slate-500 font-mono text-[11px]">
                                  {report.reporterPhone}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <Link
                            to={`/admin/reports/${report.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0B1F3A] bg-[#E8EEF7] hover:bg-[#F5B700] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('viewDetail')}</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards View */}
              <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
                {paginatedReports.map((report: Report) => (
                  <Link
                    key={report.id}
                    to={`/admin/reports/${report.id}`}
                    className="block p-4 rounded-2xl bg-slate-50 hover:bg-[#E8EEF7]/50 border border-slate-200 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!report.seen && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F5B700] ring-4 ring-[#F5B700]/30 shrink-0" />
                        )}
                        <span className="font-mono text-xs font-bold text-[#0B1F3A]">
                          {report.id}
                        </span>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-slate-800">
                        {getCorruptionTypeLabel(report.type)}
                      </h4>
                      <p className="text-xs text-slate-600 font-bold mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#0B1F3A]" />
                        <span>{report.office}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {report.location} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                      <div>
                        {report.isAnonymous ? (
                          <span className="text-slate-500">{t('anonymousBadge')}</span>
                        ) : (
                          <span className="font-semibold text-blue-800">
                            {report.reporterName}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-[#0B1F3A] flex items-center gap-1">
                        {t('viewDetail')} →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B1F3A] bg-[#E8EEF7] hover:bg-[#dbe4f3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t('pagePrev')}</span>
                  </button>

                  <div className="text-xs font-medium text-slate-600">
                    {currentPage} / {totalPages}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B1F3A] bg-[#E8EEF7] hover:bg-[#dbe4f3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>{t('pageNext')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
