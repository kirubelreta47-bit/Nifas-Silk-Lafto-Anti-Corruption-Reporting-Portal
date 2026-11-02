import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Report, CorruptionType, ReportStatus } from '../../types';
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

  // Stats and reports state
  const [stats, setStats] = useState(() => reportService.getReportStats(30));
  const [reports, setReports] = useState<Report[]>(() => reportService.getReports());

  const refreshData = (days: 7 | 30 | 90 = timeRange) => {
    setLoading(true);
    setTimeout(() => {
      setStats(reportService.getReportStats(days));
      setReports(reportService.getReports());
      setLoading(false);
    }, 150);
  };

  useEffect(() => {
    refreshData(timeRange);
  }, [timeRange]);

  const handleToggleUrgent = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    reportService.toggleUrgent(id);
    refreshData(timeRange);
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

        <Link
          to="/admin/reports"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#0B1F3A] hover:bg-[#122b4d] text-white shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#F5B700] self-start sm:self-auto cursor-pointer"
        >
          <span>{t('viewAllReports')}</span>
          <ArrowRight className="w-4 h-4 text-[#F5B700]" />
        </Link>
      </div>

      {/* 1. SUMMARY CARDS (ROW) */}
      <section aria-label="Status Summary Cards">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const linkUrl = card.statusParam === 'all' ? '/admin/reports' : `/admin/reports?status=${card.statusParam}`;
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

      {/* 2. URGENT SECTION (PINNED LIST OF REPORTS MARKED URGENT) */}
      {stats.urgentReports.length > 0 && (
        <section
          aria-label="Urgent Priority Reports"
          className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300/80 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#F5B700] text-[#0B1F3A] shrink-0">
                <Star className="w-5 h-5 fill-[#0B1F3A]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0B1F3A] flex items-center gap-2">
                  <span>{t('urgentSectionTitle')}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F5B700] text-[#0B1F3A]">
                    {stats.urgentReports.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-medium">{t('urgentSectionSubtitle')}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              {t('urgentBadge')} Priority
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.urgentReports.map((report) => (
              <Link
                key={report.id}
                to={`/admin/reports/${report.id}`}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0B1F3A] hover:shadow-md transition-all flex flex-col justify-between gap-3 group relative"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#0B1F3A] group-hover:text-blue-700">
                      {report.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={report.status} />
                      {/* Interactive star toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleUrgent(e, report.id)}
                        className="p-1 rounded-md text-[#F5B700] hover:scale-110 transition-transform cursor-pointer"
                        title={t('unmarkUrgent')}
                        aria-label={t('unmarkUrgent')}
                      >
                        <Star className="w-4 h-4 fill-[#F5B700]" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {getCorruptionTypeLabel(report.type)}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                    {report.office}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  <span className="text-[#0B1F3A] font-bold group-hover:underline flex items-center gap-0.5">
                    {t('viewDetail')} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. CHARTS GRID */}
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
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#0B1F3A] text-white p-3 rounded-xl shadow-lg border border-[#F5B700]/40 text-xs">
                            <p className="font-bold text-[#F5B700]">{item.fullName}</p>
                            <p className="mt-1 text-slate-200">
                              {t('reportsCount')}: <span className="font-bold text-white">{item.count}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#0B1F3A" radius={[6, 6, 0, 0]} activeBar={{ fill: '#F5B700' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Reports Over Time (Line Chart with 7 / 30 / 90 Days selector) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-[#0B1F3A] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#F5B700]" />
              <span>{t('reportsOverTimeChart')}</span>
            </h2>

            {/* 7 / 30 / 90 Day Selector Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {([7, 30, 90] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTimeRange(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeRange === days
                      ? 'bg-[#0B1F3A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {days === 7 ? t('timeRange7') : days === 30 ? t('timeRange30') : t('timeRange90')}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="timeRangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5B700" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#F5B700" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={timeRange === 7 ? 0 : timeRange === 30 ? 4 : 12}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#0B1F3A] text-white p-3 rounded-xl shadow-lg border border-[#F5B700]/40 text-xs">
                          <p className="font-bold text-[#F5B700]">{item.fullDate}</p>
                          <p className="mt-1 text-slate-200">
                            {t('reportsCount')}: <span className="font-bold text-white">{item.count}</span>
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
                  stroke="#F5B700"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#timeRangeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: Top Reported Offices & Kebele Hotspots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Offices (Ranked Horizontal Bars) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-[#0B1F3A] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#F5B700]" />
                <span>{t('topOfficesChart')}</span>
              </h2>
              <span className="text-xs text-slate-500 font-semibold">Top 5</span>
            </div>

            {stats.topOffices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('noReportsFound')}</div>
            ) : (
              <div className="space-y-3.5">
                {stats.topOffices.map((office, idx) => (
                  <div key={office.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#0B1F3A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800 truncate" title={office.name}>
                          {office.name}
                        </span>
                      </div>
                      <span className="font-bold text-[#0B1F3A] shrink-0 ml-2">
                        {office.count} ({office.percentage}%)
                      </span>
                    </div>
                    {/* Horizontal Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#0B1F3A] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(8, office.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kebele Hotspots (Ranked List with Small Bars) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-[#0B1F3A] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#F5B700]" />
                <span>{t('hotspotsByKebele')}</span>
              </h2>
              <span className="text-xs text-slate-500 font-semibold">Hotspots</span>
            </div>

            {stats.byKebele.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">{t('noReportsFound')}</div>
            ) : (
              <div className="space-y-3.5">
                {stats.byKebele.map((item, idx) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="font-bold text-slate-800 truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0 ml-2">
                        {item.count} {t('reportsCount')}
                      </span>
                    </div>
                    {/* Small Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#F5B700] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(10, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. "NEEDS ATTENTION" LIST (REPORTS STILL NEW/UNDER REVIEW > 7 DAYS) */}
      <section aria-label="Reports Needing Attention" className="bg-white rounded-3xl border border-[#E8EEF7] shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-[#0B1F3A] flex items-center gap-2">
                <span>{t('needsAttentionTitle')}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                  {stats.needsAttentionReports.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">{t('needsAttentionSubtitle')}</p>
            </div>
          </div>
        </div>

        {stats.needsAttentionReports.length === 0 ? (
          <div className="p-6 text-center text-xs sm:text-sm text-slate-500 italic flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{t('noAttentionReports')}</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.needsAttentionReports.map((report) => (
              <Link
                key={report.id}
                to={`/admin/reports/${report.id}`}
                className="py-3.5 px-3 rounded-xl hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-extrabold text-[#0B1F3A] group-hover:text-blue-700">
                      {report.id}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      • {getCorruptionTypeLabel(report.type)}
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {report.office} — {report.location}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{t('waitingDays', { days: report.daysWaiting })}</span>
                  </span>
                  <span className="text-xs font-bold text-[#0B1F3A] group-hover:underline">
                    {t('viewDetail')} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. RECENT REPORTS (LATEST 5 WITH STAR TOGGLE ON ROWS) */}
      <section aria-label="Recent Reports" className="bg-white rounded-3xl border border-[#E8EEF7] shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-base sm:text-lg text-[#0B1F3A] flex items-center gap-2">
            <span>{t('recentReportsTitle')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8EEF7] text-[#0B1F3A] font-bold">
              5
            </span>
          </h2>
          <Link
            to="/admin/reports"
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
                  {/* Star toggle button on row */}
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

                  {/* Unread indicator */}
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
