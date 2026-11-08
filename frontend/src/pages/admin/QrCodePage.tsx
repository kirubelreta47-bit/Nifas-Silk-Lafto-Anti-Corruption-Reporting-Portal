import React, { useRef, useState, useMemo } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useLanguage } from '../../context/LanguageContext';
import { OfficialEmblem } from '../../components/OfficialEmblem';
import {
  COMMON_DEPARTMENTS,
  DepartmentDef,
} from '../../constants/departments';
import {
  QrCode,
  Download,
  Printer,
  Shield,
  Lock,
  PhoneCall,
  ExternalLink,
  Smartphone,
  Globe,
  Settings2,
  FileDown,
  Building2,
  Check,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';

export const QrCodePage: React.FC = () => {
  const { t, lang } = useLanguage();
  const posterRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Default detected origin or fallback
  const defaultOrigin =
    typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://nsl.gov.et/';

  // Eventual Vercel production domain from env or default
  const vercelProdUrl = import.meta.env.VITE_APP_URL || 'https://nsl-portal.vercel.app';

  // Local network Wi-Fi address for testing on physical mobile phones
  const localWifiUrl =
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.origin}/`
      : 'http://10.190.121.3:3000/';

  // Base URL state
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    if (import.meta.env.PROD && import.meta.env.VITE_APP_URL) {
      return import.meta.env.VITE_APP_URL;
    }
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return localWifiUrl;
    }
    return defaultOrigin;
  });

  const [customUrlMode, setCustomUrlMode] = useState<boolean>(false);

  // Department Selection state
  const [selectedDeptId, setSelectedDeptId] = useState<string>('land-admin');
  const [customDeptName, setCustomDeptName] = useState<string>('');
  const [copiedDeptId, setCopiedDeptId] = useState<string | null>(null);

  // Active department resolution
  const activeDept = useMemo(() => {
    if (selectedDeptId === 'custom') {
      const name = customDeptName.trim() || 'Custom Office';
      return {
        id: 'custom',
        code: 'DESK',
        am: name,
        en: name,
      };
    }
    return COMMON_DEPARTMENTS.find((d) => d.id === selectedDeptId) || COMMON_DEPARTMENTS[0];
  }, [selectedDeptId, customDeptName]);

  // Compute final QR target destination URL with department parameter
  const computedQrUrl = useMemo(() => {
    const cleanBase = baseUrl.trim().replace(/\/+$/, '');
    if (selectedDeptId === 'custom') {
      return `${cleanBase}/?dept=${encodeURIComponent(customDeptName.trim() || 'Custom Office')}`;
    }
    return `${cleanBase}/?dept=${selectedDeptId}`;
  }, [baseUrl, selectedDeptId, customDeptName]);

  const handlePrint = () => {
    window.print();
  };

  // Helper to copy a link to clipboard
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedDeptId(id);
    setTimeout(() => setCopiedDeptId(null), 2500);
  };

  // 1. Download Standalone QR Code (PNG)
  const handleDownloadQrOnlyPng = () => {
    const qrCanvas = document.getElementById('standalone-qr-canvas') as HTMLCanvasElement;
    if (!qrCanvas) return;
    const pngUrl = qrCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `NSL_QR_${activeDept.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // 2. Download Standalone QR Code (SVG Vector)
  const handleDownloadQrOnlySvg = () => {
    if (!svgContainerRef.current) return;
    const svgElement = svgContainerRef.current.querySelector('svg');
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = `NSL_QR_${activeDept.id}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
  };

  // 3. Download Full Official Printable Poster (1200x1600 Canvas PNG)
  const handleDownloadPosterPng = () => {
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 1600;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Clean Navy & Gold Accent Line
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(0, 0, width, 14);
    ctx.fillStyle = '#F5B700';
    ctx.fillRect(0, 14, width, 6);

    // Header Background Navy Bar
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(50, 45, width - 100, 220);

    // Gold Accent border on Navy Bar
    ctx.strokeStyle = '#F5B700';
    ctx.lineWidth = 5;
    ctx.strokeRect(50, 45, width - 100, 220);

    // Sub-City Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ንፋስ ስልክ ላፍቶ ክፍለ ከተማ አስተዳደር', width / 2, 115);

    ctx.font = '600 28px "Inter", sans-serif';
    ctx.fillStyle = '#F5B700';
    ctx.fillText('Nifas Silk-Lafto Sub-City Administration', width / 2, 165);

    ctx.font = '300 22px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillStyle = '#E8EEF7';
    ctx.fillText('የሥነ-ምግባር እና የፀረ-ሙስና መጠቆሚያ ፖርታል | Anti-Corruption Portal', width / 2, 215);

    // Department Specific Highlight Box
    ctx.fillStyle = '#E8EEF7';
    ctx.fillRect(60, 285, width - 120, 140);
    ctx.strokeStyle = '#0B1F3A';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 285, width - 120, 140);

    // Department Title in Amharic & English
    ctx.fillStyle = '#0B1F3A';
    ctx.font = 'bold 36px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText(activeDept.am, width / 2, 340);

    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText(activeDept.en, width / 2, 385);

    // Poster Callout Header
    ctx.fillStyle = '#0B1F3A';
    ctx.font = '800 42px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText('ሙስናን ለመጠቆም ይህንን ይቃኙ', width / 2, 475);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = '700 28px "Inter", sans-serif';
    ctx.fillText('Scan to Report Misconduct & Corruption Directly', width / 2, 520);

    // Frame for QR
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(320, 560, 560, 560);
    ctx.strokeStyle = '#0B1F3A';
    ctx.lineWidth = 8;
    ctx.strokeRect(320, 560, 560, 560);

    // Get QR code from standalone canvas and draw it into poster center
    const qrCanvas = document.getElementById('standalone-qr-canvas') as HTMLCanvasElement;
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 360, 600, 480, 480);
    }

    // Portal Destination URL Text
    ctx.fillStyle = '#0B1F3A';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(computedQrUrl, width / 2, 1165);

    // Guarantees box
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(80, 1210, width - 160, 260);

    ctx.fillStyle = '#F5B700';
    ctx.font = 'bold 28px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText('★ 100% ሚስጥራዊ እና ስም-አልባ (Strictly Confidential & Anonymous) ★', width / 2, 1275);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 23px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText('የአይፒ (IP) አድራሻ ወይም የመሣሪያ መረጃ በጭራሽ አይመዘገብም', width / 2, 1330);

    ctx.fillStyle = '#E8EEF7';
    ctx.font = '500 21px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText('ጥቆማዎ በቀጥታ ለዚህ መሥሪያ ቤትና ለክፍለ ከተማው የፀረ-ሙስና ጽ/ቤት ይመዘገባል', width / 2, 1380);

    ctx.fillStyle = '#F5B700';
    ctx.font = 'bold 24px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText('የነፃ ጥሪ መስመር (Hotline): 969 / +251 11 442 0123', width / 2, 1430);

    // Bottom Decorative Bar
    ctx.fillStyle = '#F5B700';
    ctx.fillRect(0, height - 20, width, 20);

    // Export as PNG
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `Nifas_Silk_Lafto_${activeDept.id}_Poster_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight flex items-center gap-3">
            <QrCode className="w-7 h-7 text-[#F5B700]" />
            <span>{t('qrPageTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {t('qrPageSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadQrOnlyPng}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-300 transition-all cursor-pointer shadow-xs"
            title={t('downloadQrOnlyPng')}
          >
            <QrCode className="w-4 h-4 text-[#0B1F3A]" />
            <span>{t('downloadQrOnlyPng')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQrOnlySvg}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-300 transition-all cursor-pointer shadow-xs"
            title={t('downloadQrOnlySvg')}
          >
            <FileDown className="w-4 h-4 text-emerald-700" />
            <span>{t('downloadQrOnlySvg')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPosterPng}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#F5B700] hover:bg-[#e0a700] text-[#0B1F3A] shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#F5B700] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('downloadQrPng')}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#0B1F3A] hover:bg-[#122b4d] text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#F5B700] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#F5B700]" />
            <span>{t('printPosterBtn')}</span>
          </button>
        </div>
      </div>

      {/* 1. DEPARTMENT SELECTOR (CRITICAL REQUIREMENT) */}
      <div className="no-print bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#0B1F3A] text-[#F5B700]">
                <Building2 className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-[#0B1F3A]">
                {t('selectDeptLabel')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'am'
                ? 'የመረጡት መሥሪያ ቤት በQR ኮዱ ውስጥ በቀጥታ ይካተታል። ዜጎች ሲቃኙ ይህ መሥሪያ ቤት ተቆልፎ ይቀርብላቸዋል።'
                : 'Selecting a department pre-encodes it into the QR code. When citizens scan it, this department is locked on their form.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#0B1F3A] border border-blue-200">
              {activeDept.code.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 8 Official Departments + General + Custom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {COMMON_DEPARTMENTS.map((dept) => {
            const isSelected = selectedDeptId === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDeptId(dept.id)}
                className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-md ring-2 ring-[#F5B700]'
                    : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#F5B700] text-[#0B1F3A]'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {dept.code.toUpperCase()}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#F5B700] shrink-0" />}
                </div>
                <div className="mt-2">
                  <p
                    className={`text-xs font-bold leading-snug line-clamp-2 ${
                      isSelected ? 'text-white' : 'text-[#0B1F3A]'
                    }`}
                  >
                    {lang === 'am' ? dept.am : dept.en}
                  </p>
                  <p
                    className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {lang === 'am' ? dept.en : dept.am}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Custom Department Option */}
          <button
            type="button"
            onClick={() => setSelectedDeptId('custom')}
            className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
              selectedDeptId === 'custom'
                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-md ring-2 ring-[#F5B700]'
                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  selectedDeptId === 'custom'
                    ? 'bg-[#F5B700] text-[#0B1F3A]'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                CUSTOM
              </span>
              {selectedDeptId === 'custom' && (
                <Check className="w-4 h-4 text-[#F5B700] shrink-0" />
              )}
            </div>
            <div className="mt-2">
              <p
                className={`text-xs font-bold leading-snug ${
                  selectedDeptId === 'custom' ? 'text-white' : 'text-[#0B1F3A]'
                }`}
              >
                {t('customDeptOption')}
              </p>
              <p
                className={`text-[11px] font-medium mt-0.5 ${
                  selectedDeptId === 'custom' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Specific Woreda / Kebele
              </p>
            </div>
          </button>
        </div>

        {/* Custom Department Input (If Custom is selected) */}
        {selectedDeptId === 'custom' && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <label className="block text-xs font-bold text-[#0B1F3A]">
              {t('customDeptPlaceholder')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customDeptName}
                onChange={(e) => setCustomDeptName(e.target.value)}
                placeholder="e.g. Woreda 03 Trade Desk, Kebele 08 Service..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-amber-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. BASE URL CONFIGURATION TOOLBAR */}
      <div className="no-print p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#F5B700]" />
            <span>{t('qrTargetUrlLabel')}</span>
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setBaseUrl(vercelProdUrl);
                setCustomUrlMode(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                baseUrl === vercelProdUrl && !customUrlMode
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Production (Vercel)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBaseUrl(localWifiUrl);
                setCustomUrlMode(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                baseUrl === localWifiUrl && !customUrlMode
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('qrPresetLocal')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBaseUrl(defaultOrigin);
                setCustomUrlMode(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                baseUrl === defaultOrigin && !customUrlMode
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('qrPresetCurrent')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCustomUrlMode(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                customUrlMode
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{t('qrPresetCustom')}</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => {
              setBaseUrl(e.target.value);
              setCustomUrlMode(true);
            }}
            placeholder="https://example.com"
            className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t('qrScanHint')}</span>
            </span>
            <button
              type="button"
              onClick={() => handleCopyLink(computedQrUrl, 'active')}
              className="font-bold text-[#0B1F3A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedDeptId === 'active' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Final Scannable URL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden high-res canvas used for standalone & poster export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
        <QRCodeCanvas
          id="standalone-qr-canvas"
          value={computedQrUrl}
          size={500}
          level="H"
          includeMargin={true}
        />
      </div>

      {/* 3. PRINTABLE OFFICIAL POSTER PREVIEW */}
      <div
        ref={posterRef}
        className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-slate-200 text-center space-y-6 print:shadow-none print:border-none print:p-4 max-w-2xl mx-auto"
      >
        {/* Official Header */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-center">
            <OfficialEmblem size={80} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B1F3A] tracking-tight">
              {t('officialNoticeHeader')}
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-700">
              Nifas Silk-Lafto Sub-City Administration
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              የሥነ-ምግባርና ፀረ-ሙስና ዳይሬክቶሬት • Ethics & Anti-Corruption Directorate
            </p>
          </div>
        </div>

        {/* Prominent Department Banner on Poster */}
        <div className="p-4 rounded-2xl bg-[#0B1F3A] text-white border-2 border-[#F5B700] space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#F5B700]">
            <Building2 className="w-4 h-4" />
            <span>{t('qrDepartmentBadge')}</span>
            <span>[{activeDept.code.toUpperCase()}]</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            {activeDept.am}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#F5B700]">
            {activeDept.en}
          </p>
        </div>

        {/* Scan Callout */}
        <div className="space-y-1 py-1 border-y-2 border-slate-100">
          <h4 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
            {t('scanToReportEth')}
          </h4>
          <p className="text-sm sm:text-base font-bold text-[#b45309]">
            {t('scanToReportEng')}
          </p>
        </div>

        {/* Large QR Code Display & Live Preview */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            ref={svgContainerRef}
            className="p-6 rounded-3xl bg-[#E8EEF7] border-4 border-[#0B1F3A] shadow-inner inline-block"
          >
            <QRCodeSVG
              value={computedQrUrl}
              size={240}
              level="H"
              includeMargin={true}
              className="rounded-xl shadow-xs"
            />
          </div>

          <div className="font-mono text-xs font-bold text-[#0B1F3A] bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 break-all max-w-md">
            {computedQrUrl}
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto space-y-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900">{t('posterInstructionsEth')}</p>
          <p className="text-slate-600">{t('posterInstructionsEng')}</p>
        </div>

        {/* Confidential Reassurance & Helpline */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1F3A] text-white space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#F5B700]">
            <Lock className="w-4 h-4" />
            <span>{t('confidentialGuaranteed')}</span>
          </div>
          <div className="text-xs text-slate-300 flex items-center justify-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-[#F5B700]" />
            <span>{t('hotlineNotice')}</span>
          </div>
        </div>
      </div>

      {/* 4. ALL DEPARTMENTS QUICK BATCH GRID */}
      <div className="no-print bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0B1F3A]">
              <Layers className="w-5 h-5 text-[#0B1F3A]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0B1F3A]">
                {t('batchQrTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('batchQrSubtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMMON_DEPARTMENTS.map((dept) => {
            const cleanBase = baseUrl.trim().replace(/\/+$/, '');
            const deptUrl = `${cleanBase}/?dept=${dept.id}`;
            const isSelected = selectedDeptId === dept.id;

            return (
              <div
                key={dept.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-[#0B1F3A] bg-blue-50/40 ring-2 ring-[#0B1F3A]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#0B1F3A] text-[#F5B700]">
                    {dept.code.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(deptUrl, dept.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B1F3A] hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedDeptId === dept.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex justify-center py-2">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs inline-block">
                    <QRCodeSVG
                      value={deptUrl}
                      size={110}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-[#0B1F3A] line-clamp-1">
                    {lang === 'am' ? dept.am : dept.en}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {lang === 'am' ? dept.en : dept.am}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeptId(dept.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-slate-100 hover:bg-[#0B1F3A] hover:text-white text-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F5B700]" />
                  <span>{isSelected ? 'Active Poster' : 'Select Poster'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
