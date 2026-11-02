import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Report, CorruptionType, ReportStatus } from '../../types';
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
  Building,
  ArrowLeft,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const ReportsListPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const [searchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [anonymousOnly, setAnonymousOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Fetch reports from service
  const filteredReports = useMemo(() => {
    return reportService.getReports({
      search: search.trim() || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      anonymousOnly,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }, [search, statusFilter, typeFilter, anonymousOnly, dateFrom, dateTo]);

  // Pagination calculation
  const totalReports = filteredReports.length;
  const totalPages = Math.ceil(totalReports / ITEMS_PER_PAGE) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReports.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setAnonymousOnly(false);
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    anonymousOnly ||
    dateFrom !== '' ||
    dateTo !== '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#0B1F3A] bg-[#E8EEF7] hover:bg-[#F5B700] border border-blue-200/60 transition-colors shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>{t('backToDashboard')}</span>
        </Link>
        {statusFilter !== 'all' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <span>{t('filterByStatus')}:</span>
            <span className="font-bold text-[#0B1F3A] uppercase">{statusFilter}</span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="text-slate-400 hover:text-slate-800 ml-1 font-bold text-sm leading-none cursor-pointer"
              title="Clear filter"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="w-7 h-7 text-[#F5B700]" />
            <span>{t('adminReports')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('subCityTitle')} • የቀረቡ የሙስና ጥቆማዎች አጠቃላይ ሰንጠረዥ
          </p>
        </div>
        <div className="text-xs sm:text-sm font-semibold bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 shadow-xs self-start sm:self-auto">
          {t('paginationShowing', {
            from: totalReports === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1,
            to: Math.min(currentPage * ITEMS_PER_PAGE, totalReports),
            total: totalReports,
          })}
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4">
        {/* Top search & quick clear */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-11 pr-4 min-h-[44px] rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5B700] text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
              <span>{t('clearFilters')}</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
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

          {/* Date Range From & To */}
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

      {/* Reports Table (Desktop) & Cards (Mobile) */}
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
                      {/* ID with unread indicator */}
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

                      {/* Corruption Type */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-800">
                        <span className="line-clamp-1">{getCorruptionTypeLabel(report.type)}</span>
                      </td>

                      {/* Office & Kebele */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 line-clamp-1 text-xs">
                          {report.office}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {report.location}
                        </div>
                      </td>

                      {/* Date Submitted */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={report.status} />
                      </td>

                      {/* Reporter (Anonymous vs Named) */}
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

                      {/* Actions */}
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
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {report.office}
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
    </div>
  );
};
