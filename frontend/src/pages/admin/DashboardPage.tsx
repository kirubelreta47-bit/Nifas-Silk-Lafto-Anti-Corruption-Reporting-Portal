import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Report, CorruptionType, ReportStatus } from '../../types';
import { COMMON_DEPARTMENTS, DepartmentDef } from '../../constants/departments';
import {
  FileText,
  AlertCircle,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Building2,
  MapPin,
  Star,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Layers,
  Flame,
  Check,
  ShieldAlert,
  QrCode,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  // Selected time range for the line chart (7, 30, or 90 days)
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(false);

  // Department Drilldown Filter state
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  // Stats and reports state
  const [stats, setStats] = useState(() => reportService.getReportStats(30));
  const [reports, setReports] = useState<Report[]>(() => reportService.getReports());

  const selectedDeptDef = useMemo(() => {
    if (selectedDeptId === 'all') return null;
    return COMMON_DEPARTMENTS.find((d) => d.id === selectedDeptId) || null;
  }, [selectedDeptId]);

  const refreshData = (days: 7 | 30 | 90 = timeRange, deptId: string = selectedDeptId) => {
    setLoading(true);
    setTimeout(() => {
      const officeParam = deptId === 'all' ? undefined : COMMON_DEPARTMENTS.find((d) => d.id === deptId)?.en;
      setStats(reportService.getReportStats(days, officeParam));
      setReports(reportService.getReports(officeParam ? { office: officeParam } : undefined));
      setLoading(false);
    }, 100);
  };

  useEffect(() => {
    reportService.syncWithBackend().then((synced) => {
      if (synced) refreshData(timeRange, selectedDeptId);
    });
  }, []);

  useEffect(() => {
    refreshData(timeRange, selectedDeptId);
  }, [timeRange, selectedDeptId]);

  const handleToggleUrgent = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    reportService.toggleUrgent(id);
    refreshData(timeRange, selectedDeptId);
  };

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

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'new':
        return t('status_new');
      case 'under_review':
        return t('status_under_review');
      case 'investigating':
        return t('status_investigating');
      case 'resolved':
        return t('status_resolved');
      case 'rejected':
        return t('status_rejected');
      default:
        return status;
    }
  };

  // Recent 5 reports
  const recentReports = useMemo(() => reports.slice(0, 5), [reports]);

  // Formatted data for Donut Chart (Reports by Status)
  const donutData = useMemo(() => {
    return stats.byStatus.map((item) => ({
      name: getStatusLabel(item.status as ReportStatus),
      status: item.status,
      value: item.count,
      color: item.color,
    }));
  }, [stats.byStatus, lang]);

  // Formatted data for Bar Chart (Reports by Type)
  const barData = useMemo(() => {
    return stats.byType.map((item) => ({
      type: item.type,
      name:
        lang === 'am'
          ? getCorruptionTypeLabel(item.type).split(' ')[0]
          : item.type.replace(/_/g, ' '),
      fullName: getCorruptionTypeLabel(item.type),
      count: item.count,
    }));
  }, [stats.byType, lang]);

  // Formatted data for Over Time Line Chart
  const timeData = useMemo(() => {
    return stats.overTime.map((item) => {
      const parts = item.date.split('-');
      return {
        date: `${parts[1]}/${parts[2]}`,
        fullDate: item.date,
        count: item.count,
      };
    });
  }, [stats.overTime]);

  // Summary KPI Cards Definition
  const summaryCards = [
    {
      statusKey: 'all',
      statusParam: 'all',
      label: t('totalReports'),
      count: stats.total,
      thisWeek: stats.thisWeek.total,
      icon: FileText,
      border: 'border-slate-200 hover:border-[#0B1F3A]',
      bg: 'bg-white',
      badgeBg: 'bg-[#0B1F3A] text-white',
      accentColor: 'text-[#0B1F3A]',
    },
    {
      statusKey: 'new',
      statusParam: 'new',
      label: t('newReports'),
      count: stats.new,
      thisWeek: stats.thisWeek.new,
      icon: AlertCircle,
      border: 'border-amber-200 hover:border-[#F5B700]',
      bg: 'bg-amber-50/40',
      badgeBg: 'bg-[#F5B700] text-[#0B1F3A]',
      accentColor: 'text-amber-900',
    },
    {
      statusKey: 'under_review',
      statusParam: 'under_review',
      label: t('underReviewReports'),
      count: stats.underReview,
      thisWeek: stats.thisWeek.underReview,
      icon: Clock,
      border: 'border-blue-200 hover:border-blue-600',
      bg: 'bg-blue-50/40',
      badgeBg: 'bg-blue-600 text-white',
      accentColor: 'text-blue-900',
    },
    {
      statusKey: 'investigating',
      statusParam: 'investigating',
      label: t('investigatingReports'),
      count: stats.investigating,
      thisWeek: stats.thisWeek.investigating,
      icon: Search,
      border: 'border-purple-200 hover:border-purple-600',
      bg: 'bg-purple-50/40',
      badgeBg: 'bg-purple-700 text-white',
      accentColor: 'text-purple-900',
    },
    {
      statusKey: 'resolved',
      statusParam: 'resolved',
      label: t('resolvedReports'),
      count: stats.resolved,
      thisWeek: stats.thisWeek.resolved,
      icon: CheckCircle,
      border: 'border-emerald-200 hover:border-emerald-600',
      bg: 'bg-emerald-50/40',
      badgeBg: 'bg-emerald-600 text-white',
      accentColor: 'text-emerald-900',
    },
    {
      statusKey: 'rejected',
      statusParam: 'rejected',
      label: t('rejectedReports'),
      count: stats.rejected,
      thisWeek: stats.thisWeek.rejected,
      icon: XCircle,
      border: 'border-rose-200 hover:border-rose-600',
      bg: 'bg-rose-50/40',
      badgeBg: 'bg-rose-600 text-white',
      accentColor: 'text-rose-900',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {t('adminDashboard')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t('subCityTitle')} • {t('subCitySubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/qr-code"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            <QrCode className="w-4 h-4 text-[#0B1F3A]" />
            <span>{t('adminQrCode')}</span>
          </Link>

          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#0B1F3A] hover:bg-[#122b4d] text-white shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#F5B700] cursor-pointer"
          >
            <span>{t('viewAllReports')}</span>
            <ArrowRight className="w-4 h-4 text-[#F5B700]" />
          </Link>
        </div>
      </div>

      {/* 1. PRIMARY DEPARTMENT SELECTOR / DRILLDOWN BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#0B1F3A] text-[#F5B700]">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-[#0B1F3A]">
                {t('departmentAnalyticsTitle')}
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">
                {lang === 'am' ? 'በመሥሪያ ቤት ለይቶ የመመርመሪያ ሰሌዳ' : 'Interactive Department Filter'}
              </span>
            </div>
          </div>

          {/* Clean Dropdown Selector */}
          <div className="relative w-full sm:w-80">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-[#F8FAFC] hover:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] cursor-pointer shadow-xs appearance-none"
            >
              <option value="all">
                {lang === 'am'
                  ? `🏛️ ሁሉም መሥሪያ ቤቶች (ጠቅላላ ${stats.total})`
                  : `🏛️ All Departments (Total ${stats.total})`}
              </option>
              {COMMON_DEPARTMENTS.map((dept) => {
                const count = stats.departmentBreakdown?.find((d) => d.id === dept.id)?.totalCount || 0;
                const label = lang === 'am' ? dept.am : dept.en;
                return (
                  <option key={dept.id} value={dept.id}>
                    {`[${dept.code.toUpperCase()}] ${label} (${count})`}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Responsive Wrap Department Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedDeptId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
              selectedDeptId === 'all'
                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#F5B700]" />
            <span>{t('allDepartmentsView')}</span>
          </button>

          {stats.departmentBreakdown?.map((dept) => {
            const isSelected = selectedDeptId === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDeptId(dept.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs ring-2 ring-[#F5B700]'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-[#0B1F3A] font-extrabold">
                  {dept.code.toUpperCase()}
                </span>
                <span className="line-clamp-1">{lang === 'am' ? dept.nameAm : dept.nameEn}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                    isSelected
                      ? 'bg-[#F5B700] text-[#0B1F3A]'
                      : dept.totalCount > 0
                      ? 'bg-blue-100 text-blue-900 font-mono'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {dept.totalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE DEPARTMENT PROFILE BANNER (IF A SPECIFIC DEPARTMENT IS SELECTED) */}
      {selectedDeptDef && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0B1F3A] via-[#122b4d] to-[#0B1F3A] text-white border-2 border-[#F5B700] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F5B700] text-[#0B1F3A]">
                {selectedDeptDef.code.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-[#F5B700]">
                {t('activeDepartmentFilter')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'am' ? selectedDeptDef.am : selectedDeptDef.en}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {lang === 'am' ? selectedDeptDef.en : selectedDeptDef.am}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/admin/reports?office=${encodeURIComponent(selectedDeptDef.en)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#F5B700] hover:bg-[#e0a700] text-[#0B1F3A] shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{t('viewDepartmentReports')}</span>
            </Link>

            <Link
              to="/admin/qr-code"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-xs transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#F5B700]" />
              <span>{t('generateQrForDepartment')}</span>
            </Link>

            <button
              type="button"
              onClick={() => setSelectedDeptId('all')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 transition-colors cursor-pointer"
            >
              <span>✕ Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. SUMMARY CARDS (ROW) */}
      <section aria-label="Status Summary Cards">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const officeParam = selectedDeptDef ? `&office=${encodeURIComponent(selectedDeptDef.en)}` : '';
            const linkUrl = card.statusParam === 'all' 
              ? `/admin/reports?${officeParam.replace(/^&/, '')}` 
              : `/admin/reports?status=${card.statusParam}${officeParam}`;
            return (
              <Link
                key={card.statusKey}
                to={linkUrl}
                title={t('clickToFilter')}
                className={`p-4 rounded-2xl border-2 ${card.border} ${card.bg} shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-[#0B1F3A]">
                    {card.label}
                  </span>
                  <div className={`p-1.5 rounded-lg ${card.badgeBg} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-3">
                  <div className={`text-2xl sm:text-3xl font-extrabold ${card.accentColor}`}>
                    {card.count}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                    <span className="text-emerald-700 font-bold">+{card.thisWeek}</span>
                    <span>{t('thisWeekChange', { diff: '' }).trim()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. PROMINENT DEPARTMENT HEATMAP & COMPARISON SECTION (KEY USER REQUIREMENT) */}
      {selectedDeptId === 'all' && stats.departmentBreakdown && (
        <section aria-label="Department Ranking and Heatmap" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Spotlighting #1 Most Reported Office */}
            {stats.highestRiskDepartment && (
              <div className="lg:col-span-5 bg-gradient-to-br from-rose-50 via-white to-amber-50/50 p-6 rounded-3xl border-2 border-rose-300 shadow-sm flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-rose-600 text-white shadow-xs">
                      <Flame className="w-3.5 h-3.5" />
                      <span>#1 {t('mostReportedDepartment')}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      {stats.highestRiskDepartment.percentage}% {t('departmentShare')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#0B1F3A] leading-snug">
                      {lang === 'am'
                        ? stats.highestRiskDepartment.nameAm
                        : stats.highestRiskDepartment.nameEn}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                      {lang === 'am'
                        ? stats.highestRiskDepartment.nameEn
                        : stats.highestRiskDepartment.nameAm}
                    </p>
                  </div>

                  {stats.highestRiskDepartment.topCorruptionType && (
                    <div className="p-3 rounded-2xl bg-white border border-rose-200/80 text-xs space-y-1">
                      <span className="font-bold text-slate-500 block text-[11px] uppercase tracking-wider">
                        {lang === 'am' ? 'ተደጋጋሚ የጥሰት ዓይነት' : 'Primary Violation Reported'}
                      </span>
                      <span className="font-extrabold text-[#0B1F3A] text-sm flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>{getCorruptionTypeLabel(stats.highestRiskDepartment.topCorruptionType)}</span>
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-bold block">{t('totalReports')}</span>
                      <span className="text-lg font-black text-[#0B1F3A]">{stats.highestRiskDepartment.totalCount}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-[11px] text-amber-900 font-bold block">{t('newReports')}</span>
                      <span className="text-lg font-black text-amber-900">{stats.highestRiskDepartment.newCount}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[11px] text-emerald-900 font-bold block">{t('resolvedReports')}</span>
                      <span className="text-lg font-black text-emerald-700">{stats.highestRiskDepartment.resolvedCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to={`/admin/reports?office=${encodeURIComponent(stats.highestRiskDepartment.nameEn)}`}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#0B1F3A] hover:bg-[#122b4d] text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{t('viewDepartmentReports')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F5B700]" />
                  </Link>
                </div>
              </div>
            )}

            {/* Department Comparison Horizontal Ranked Bars */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#F5B700]" />
                  <h3 className="font-extrabold text-base text-[#0B1F3A]">
                    {t('topOfficesChart')}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {lang === 'am' ? 'በብዛት ቅደም-ተከተል' : 'Ranked by Volume'}
                </span>
              </div>

              <div className="space-y-3.5">
                {stats.departmentBreakdown.map((dept, idx) => {
                  const maxCount = stats.departmentBreakdown[0]?.totalCount || 1;
                  const barWidth = Math.max(10, Math.round((dept.totalCount / (maxCount || 1)) * 100));

                  return (
                    <div
                      key={dept.id}
                      onClick={() => setSelectedDeptId(dept.id)}
                      className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                      title={t('clickToFilter')}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              idx === 0
                                ? 'bg-rose-600 text-white'
                                : idx === 1
                                ? 'bg-amber-500 text-white'
                                : 'bg-[#0B1F3A] text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-800 group-hover:text-blue-900 truncate">
                            {lang === 'am' ? dept.nameAm : dept.nameEn}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold hidden sm:inline">
                            [{dept.code.toUpperCase()}]
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {dept.newCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              {dept.newCount} New
                            </span>
                          )}
                          <span className="font-extrabold text-[#0B1F3A]">
                            {dept.totalCount} ({dept.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Colored Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            idx === 0
                              ? 'bg-rose-600'
                              : idx === 1
                              ? 'bg-amber-500'
                              : idx === 2
                              ? 'bg-[#0B1F3A]'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{lang === 'am' ? 'ለዝርዝር መሥሪያ ቤቱን ይጫኑ' : 'Click any bureau row to isolate its data'}</span>
                <span className="text-blue-700 font-bold">{stats.departmentBreakdown.length} Bureaus Ranked</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. CHARTS GRID */}
      <section aria-label="Analytics and Charts Grid" className="space-y-6">
        {/* Row 1: Donut (Status) & Bar (Type) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Reports by Status (Donut Chart) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8EEF7] shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-[#0B1F3A] flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#F5B700]" />
                <span>{t('reportsByStatusChart')}</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8EEF7] text-[#0B1F3A]">
                {stats.total} {t('reportsCount')}
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full flex items-center justify-center">
              {donutData.length === 0 ? (
                <div className="text-xs text-slate-400">{t('noReportsFound')}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          const pct = Math.round((item.value / (stats.total || 1)) * 100);
                          return (
                            <div className="bg-[#0B1F3A] text-white p-3 rounded-xl shadow-lg border border-[#F5B700]/40 text-xs">
                              <p className="font-bold text-[#F5B700]">{item.name}</p>
                              <p className="mt-1 text-slate-200">
                                {item.value} {t('reportsCount')} ({pct}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Reports by Type (Bar Chart) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8EEF7] shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-[#0B1F3A] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#F5B700]" />
                <span>{t('reportsByTypeChart')}</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">በዓይነት ድልድል</span>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#0B1F3A] text-white p-3 rounded-xl shadow-lg border border-[#F5B700]/40 text-xs">
                            <p className="font-bold text-[#F5B700]">{item.fullName}</p>
                            <p className="mt-1 text-slate-200">
                              {item.count} {t('reportsCount')}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#0B1F3A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Over Time Timeline */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-base text-[#0B1F3A] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#F5B700]" />
                <span>{t('reportsOverTimeChart')}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('timelineSubtitle')}</p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTimeRange(7)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === 7 ? 'bg-white text-[#0B1F3A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('range7Days')}
              </button>
              <button
                type="button"
                onClick={() => setTimeRange(30)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === 30 ? 'bg-white text-[#0B1F3A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('range30Days')}
              </button>
              <button
                type="button"
                onClick={() => setTimeRange(90)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === 90 ? 'bg-white text-[#0B1F3A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('range90Days')}
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="timeRangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B1F3A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0B1F3A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#0B1F3A] text-white p-2.5 rounded-xl shadow-lg border border-[#F5B700]/40 text-xs">
                          <p className="font-bold text-[#F5B700]">{item.fullDate}</p>
                          <p className="mt-1 text-slate-200">
                            {item.count} {t('reportsCount')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0B1F3A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#timeRangeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 5. RECENT REPORTS LIST */}
      <section aria-label="Recent Reports" className="bg-white rounded-3xl border border-[#E8EEF7] shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-base sm:text-lg text-[#0B1F3A] flex items-center gap-2">
            <span>{t('recentReportsTitle')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8EEF7] text-[#0B1F3A] font-bold">
              {recentReports.length}
            </span>
          </h2>
          <Link
            to={selectedDeptDef ? `/admin/reports?office=${encodeURIComponent(selectedDeptDef.en)}` : '/admin/reports'}
            className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>{t('viewAllReports')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
            {t('noReportsFound')}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="py-3 px-3 rounded-xl hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleToggleUrgent(e, report.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors shrink-0 mt-0.5 sm:mt-0 cursor-pointer"
                    title={report.urgent ? t('unmarkUrgent') : t('markUrgent')}
                    aria-label={report.urgent ? t('unmarkUrgent') : t('markUrgent')}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        report.urgent
                          ? 'fill-[#F5B700] text-[#F5B700]'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                    />
                  </button>

                  {!report.seen && (
                    <span
                      title="New / Unseen"
                      className="w-2.5 h-2.5 rounded-full bg-[#F5B700] ring-4 ring-[#F5B700]/20 shrink-0 mt-1 sm:mt-0"
                    />
                  )}

                  <Link to={`/admin/reports/${report.id}`} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-[#0B1F3A] group-hover:text-blue-700">
                        {report.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        • {getCorruptionTypeLabel(report.type)}
                      </span>
                      {report.urgent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          {t('urgentBadge')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">
                      {report.office} — {report.location}
                    </div>
                  </Link>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <StatusBadge status={report.status} />
                  <Link
                    to={`/admin/reports/${report.id}`}
                    className="p-1 rounded text-slate-400 group-hover:text-[#0B1F3A] transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
