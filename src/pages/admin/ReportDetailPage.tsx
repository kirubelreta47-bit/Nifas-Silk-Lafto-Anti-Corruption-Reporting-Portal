import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { authService } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Report, ReportStatus, CorruptionType } from '../../types';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  User,
  Phone,
  Clock,
  ShieldAlert,
  FileText,
  Download,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  History,
  EyeOff,
  Music,
  ImageIcon,
  Star,
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const currentUser = authService.getCurrentUser();

  const [report, setReport] = useState<Report | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const current = reportService.getReportById(id);
    if (!current) {
      return;
    }

    // Auto mark as seen if unread
    if (!current.seen) {
      const updated = reportService.markAsSeen(id);
      setReport(updated || current);
    } else {
      setReport(current);
    }

    setSelectedStatus(current.status);
    setAdminNotes(current.adminNotes || '');
  }, [id]);

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0B1F3A]">የጥቆማ መዝገቡ አልተገኘም (Report Not Found)</h2>
        <Link
          to="/admin/reports"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1F3A] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToReports')}</span>
        </Link>
      </div>
    );
  }

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

  const handleSaveDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const email = currentUser?.email || 'admin@nsl.gov.et';

    // If status changed or notes changed
    let updated: Report | null = null;
    if (selectedStatus !== report.status) {
      updated = reportService.updateReportStatus(id, selectedStatus, adminNotes, email);
    } else if (adminNotes.trim() !== (report.adminNotes || '').trim()) {
      updated = reportService.updateReportNotes(id, adminNotes, email);
    }

    if (updated) {
      setReport(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-[#0B1F3A] bg-[#E8EEF7] hover:bg-[#F5B700] border border-blue-200/60 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToDashboard')}</span>
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
          >
            <span>{t('backToReports')}</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (id) {
                const updated = reportService.toggleUrgent(id);
                if (updated) setReport(updated);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              report.urgent
                ? 'bg-[#F5B700] text-[#0B1F3A] shadow-xs ring-2 ring-[#F5B700]/50'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
            aria-label={report.urgent ? t('unmarkUrgent') : t('markUrgent')}
            title={report.urgent ? t('unmarkUrgent') : t('markUrgent')}
          >
            <Star className={`w-4 h-4 ${report.urgent ? 'fill-[#0B1F3A] text-[#0B1F3A]' : 'text-slate-400'}`} />
            <span>{report.urgent ? t('urgentBadge') : t('markUrgent')}</span>
          </button>
          <span className="text-xs text-slate-500">የአሁን ሁኔታ:</span>
          <StatusBadge status={report.status} showDot />
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EEF7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#0B1F3A]">
              {report.id}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B1F3A] text-white">
              {getCorruptionTypeLabel(report.type)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>የቀረበበት ቀንና ሰዓት: {new Date(report.createdAt).toLocaleString()}</span>
          </p>
        </div>

        {/* Quick Identity Indicator */}
        <div className="p-3.5 rounded-2xl bg-[#E8EEF7] border border-blue-200/70 text-right self-start md:self-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t('tableReporter')}
          </div>
          <div className="font-bold text-sm text-[#0B1F3A] mt-0.5">
            {report.isAnonymous ? (
              <span className="flex items-center gap-1.5 text-slate-700">
                <EyeOff className="w-4 h-4 text-slate-500" />
                <span>{t('anonymousBadge')}</span>
              </span>
            ) : (
              <span className="text-blue-900">{report.reporterName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Details & Case Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Incident Details & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Fields Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-5">
            <h3 className="font-bold text-base text-[#0B1F3A] border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#F5B700]" />
              <span>{t('incidentInformation')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* Office */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  {t('officeLabel')}
                </span>
                <p className="font-bold text-slate-800">{report.office}</p>
              </div>

              {/* Location */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {t('locationLabel')}
                </span>
                <p className="font-bold text-slate-800">{report.location}</p>
              </div>

              {/* Date of incident */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {t('incidentDateLabel')}
                </span>
                <p className="font-bold text-slate-800">{report.incidentDate}</p>
              </div>

              {/* Person involved */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {t('personInvolvedLabel')}
                </span>
                <p className="font-bold text-slate-800">
                  {report.personInvolved || 'አልተጠቀሰም (Not specified)'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('descriptionLabel')}
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {report.description}
              </div>
            </div>
          </div>

          {/* Reporter Information Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#0B1F3A] border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#F5B700]" />
              <span>{t('reporterInformation')}</span>
            </h3>

            {report.isAnonymous ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                <EyeOff className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{t('reporterAnonymousNotice')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    {t('fullNameLabel')}
                  </span>
                  <p className="font-bold text-blue-900">{report.reporterName || '-'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    {t('phoneLabel')}
                  </span>
                  <p className="font-mono font-bold text-slate-800">
                    {report.reporterPhone || '-'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Section */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-[#0B1F3A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F5B700]" />
                <span>{t('evidenceSectionTitle')}</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8EEF7] text-[#0B1F3A]">
                {report.evidence.length}
              </span>
            </div>

            {report.evidence.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-400 italic py-3">
                {t('noEvidenceAttached')}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {report.evidence.map((ev) => {
                  const isImg = ev.type.startsWith('image/');
                  const isAudio = ev.type.startsWith('audio/');
                  const isPdf = ev.type.includes('pdf');

                  return (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        {isImg ? (
                          <button
                            type="button"
                            onClick={() => setSelectedImageModal(ev.dataUrl)}
                            className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300 hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={ev.dataUrl}
                              alt={ev.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : isAudio ? (
                          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <Music className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs text-slate-800 truncate" title={ev.name}>
                            {ev.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {formatFileSize(ev.size)} • {isImg ? t('imageEvidence') : isAudio ? t('audioEvidence') : t('pdfEvidence')}
                          </p>
                        </div>
                      </div>

                      {/* Embedded Audio Player */}
                      {isAudio && (
                        <div className="pt-1">
                          <audio controls src={ev.dataUrl} className="w-full h-8" />
                        </div>
                      )}

                      {/* Download link */}
                      <a
                        href={ev.dataUrl}
                        download={ev.name}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-[#0B1F3A] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#F5B700]" />
                        <span>{t('downloadFile')}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Case Management & Decision Log */}
        <div className="space-y-6">
          {/* Action Form */}
          <form
            onSubmit={handleSaveDecision}
            className="bg-white p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4 sticky top-24"
          >
            <h3 className="font-bold text-base text-[#0B1F3A] border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#F5B700]" />
              <span>{t('caseManagementTitle')}</span>
            </h3>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('decisionSavedNotice')}</span>
              </div>
            )}

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label htmlFor="case-status" className="block text-xs font-bold text-slate-700">
                {t('updateStatusLabel')}
              </label>
              <select
                id="case-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
              >
                <option value="new">{t('status_new')}</option>
                <option value="under_review">{t('status_under_review')}</option>
                <option value="investigating">{t('status_investigating')}</option>
                <option value="resolved">{t('status_resolved')}</option>
                <option value="rejected">{t('status_rejected')}</option>
              </select>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <label htmlFor="admin-notes" className="block text-xs font-bold text-slate-700">
                {t('adminNotesLabel')}
              </label>
              <textarea
                id="admin-notes"
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t('adminNotesPlaceholder')}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm bg-[#0B1F3A] hover:bg-[#122b4d] active:scale-98 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F5B700]"
            >
              <Save className="w-4 h-4 text-[#F5B700]" />
              <span>{t('saveDecisionBtn')}</span>
            </button>
          </form>

          {/* Decision Log Timeline */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8EEF7] shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#0B1F3A] border-b border-slate-100 pb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-[#F5B700]" />
              <span>{t('decisionLogTitle')}</span>
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {report.log.map((entry) => (
                <div key={entry.id} className="relative text-xs space-y-1">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#0B1F3A] ring-4 ring-white" />
                  <div className="font-bold text-slate-800">
                    {entry.action === 'created'
                      ? t('logCreated')
                      : entry.action === 'status_change'
                      ? `${t('logStatusChanged')}: ${entry.fromStatus || ''} → ${entry.toStatus || ''}`
                      : entry.action === 'note_added'
                      ? t('logNoteAdded')
                      : t('logMarkedSeen')}
                  </div>
                  {entry.note && (
                    <p className="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{entry.note}"
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    {entry.adminEmail} • {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Image Preview */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2">
            <img
              src={selectedImageModal}
              alt="Enlarged Evidence Preview"
              className="max-h-[80vh] w-auto mx-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setSelectedImageModal(null)}
              className="mt-2 block w-full py-2 bg-[#0B1F3A] text-white font-bold text-xs rounded-xl text-center"
            >
              ዝጋ (Close Preview)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
