import React, { useRef, useState, useMemo } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useLanguage } from '../../context/LanguageContext';
import { OfficialEmblem } from '../../components/OfficialEmblem';
import { COMMON_DEPARTMENTS, DepartmentDef } from '../../constants/departments';
import {
  QrCode,
  Download,
  Printer,
  FileDown,
  Building2,
  Check,
  Copy,
  ChevronDown,
} from 'lucide-react';

export const QrCodePage: React.FC = () => {
  const { t, lang } = useLanguage();
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Default detected origin or fallback
  const defaultOrigin =
    typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://nsl.gov.et/';

  // Local network Wi-Fi address for testing on physical mobile phones
  const localWifiUrl =
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.origin}/`
      : 'http://10.190.121.3:3000/';

  // Base URL resolution
  const baseUrl = useMemo<string>(() => {
    if (import.meta.env.PROD && import.meta.env.VITE_APP_URL) {
      return import.meta.env.VITE_APP_URL;
    }
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return localWifiUrl;
    }
    return defaultOrigin;
  }, []);

  // Department Selection state
  const [selectedDeptId, setSelectedDeptId] = useState<string>('land-admin');
  const [copied, setCopied] = useState<boolean>(false);

  // Active department resolution
  const activeDept = useMemo<DepartmentDef>(() => {
    return COMMON_DEPARTMENTS.find((d) => d.id === selectedDeptId) || COMMON_DEPARTMENTS[0];
  }, [selectedDeptId]);

  // Compute final QR target destination URL with department parameter
  const computedQrUrl = useMemo<string>(() => {
    const cleanBase = baseUrl.trim().replace(/\/+$/, '');
    return `${cleanBase}/?dept=${selectedDeptId}`;
  }, [baseUrl, selectedDeptId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(computedQrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

    // Accent header lines
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(0, 0, width, 14);
    ctx.fillStyle = '#F5B700';
    ctx.fillRect(0, 14, width, 6);

    // Header Background Navy Bar
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(50, 45, width - 100, 220);

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

    // Department Highlight Box
    ctx.fillStyle = '#E8EEF7';
    ctx.fillRect(60, 285, width - 120, 140);
    ctx.strokeStyle = '#0B1F3A';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 285, width - 120, 140);

    ctx.fillStyle = '#0B1F3A';
    ctx.font = 'bold 36px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText(activeDept.am, width / 2, 340);

    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText(activeDept.en, width / 2, 385);

    // Scan Callout
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

    // Draw standalone QR canvas into center
    const qrCanvas = document.getElementById('standalone-qr-canvas') as HTMLCanvasElement;
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 360, 600, 480, 480);
    }

    // Portal Destination URL
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
    <div className="max-w-xl mx-auto space-y-6 py-4">
      {/* Top Header */}
      <div className="no-print flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight flex items-center gap-3">
            <QrCode className="w-7 h-7 text-[#F5B700]" />
            <span>{t('qrPageTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {lang === 'am'
              ? 'መሥሪያ ቤቱን ይምረጡ፤ የQR ኮዱን ያውርዱ'
              : 'Choose department, view QR code, and download file'}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="no-print inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0B1F3A] hover:bg-[#122b4d] text-white shadow-xs cursor-pointer transition-colors"
          title={t('printPosterBtn')}
        >
          <Printer className="w-4 h-4 text-[#F5B700]" />
          <span>{t('printPosterBtn')}</span>
        </button>
      </div>

      {/* Main Clean Card (Simple & Easy Looking) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center">
        {/* 1. Department Dropdown */}
        <div className="text-left space-y-1.5 no-print">
          <label
            htmlFor="qr-dept-dropdown"
            className="block text-xs font-bold text-slate-700 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-[#F5B700]" />
            <span>{t('selectDeptLabel')}</span>
          </label>
          <div className="relative">
            <select
              id="qr-dept-dropdown"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-300 text-sm sm:text-base font-bold bg-[#F8FAFC] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-[#0B1F3A] cursor-pointer appearance-none shadow-xs transition-colors"
            >
              {COMMON_DEPARTMENTS.map((dept) => {
                const label = lang === 'am' ? dept.am : dept.en;
                return (
                  <option key={dept.id} value={dept.id}>
                    {`[${dept.code.toUpperCase()}] ${label}`}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-5 h-5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. Department Badge & Title */}
        <div className="space-y-1 pt-1 border-t border-slate-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EEF7] border border-blue-200 text-[#0B1F3A] text-xs font-mono font-extrabold mt-3">
            <Building2 className="w-3.5 h-3.5 text-[#0B1F3A]" />
            <span>{activeDept.code.toUpperCase()}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#0B1F3A]">
            {lang === 'am' ? activeDept.am : activeDept.en}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {lang === 'am' ? activeDept.en : activeDept.am}
          </p>
        </div>

        {/* 3. Centered QR Code */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            ref={svgContainerRef}
            className="p-5 rounded-3xl bg-[#F8FAFC] border-2 border-slate-200 shadow-xs inline-block"
          >
            <QRCodeSVG
              value={computedQrUrl}
              size={220}
              level="H"
              includeMargin={true}
              className="rounded-xl shadow-xs"
            />
          </div>

          {/* Quick Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="no-print inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-[#0B1F3A] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Click to copy link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">
                  {lang === 'am' ? 'ተገልብጧል!' : 'Copied!'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate max-w-[280px]">{computedQrUrl}</span>
              </>
            )}
          </button>
        </div>

        {/* 4. Download File Buttons */}
        <div className="no-print pt-2 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadQrOnlyPng}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-300 transition-all cursor-pointer shadow-xs"
            title={t('downloadQrOnlyPng')}
          >
            <Download className="w-4 h-4 text-[#0B1F3A]" />
            <span>{t('downloadQrOnlyPng')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQrOnlySvg}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-300 transition-all cursor-pointer shadow-xs"
            title={t('downloadQrOnlySvg')}
          >
            <FileDown className="w-4 h-4 text-emerald-700" />
            <span>{t('downloadQrOnlySvg')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPosterPng}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#F5B700] hover:bg-[#e0a700] text-[#0B1F3A] shadow-xs transition-all cursor-pointer"
            title={t('downloadQrPng')}
          >
            <Download className="w-4 h-4" />
            <span>{t('downloadQrPng')} (Poster)</span>
          </button>
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
    </div>
  );
};
