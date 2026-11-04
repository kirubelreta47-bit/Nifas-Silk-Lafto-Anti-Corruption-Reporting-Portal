import React, { useRef, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useLanguage } from '../../context/LanguageContext';
import { OfficialEmblem } from '../../components/OfficialEmblem';
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
  const localWifiUrl = 'http://192.168.8.2:3000/';

  const [targetUrl, setTargetUrl] = useState<string>(() => {
    // In production, prioritize Vercel/configured domain
    if (import.meta.env.PROD && import.meta.env.VITE_APP_URL) {
      return import.meta.env.VITE_APP_URL;
    }
    // If running on localhost, default to local WiFi for phone friendliness, else current origin
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return localWifiUrl;
    }
    return defaultOrigin;
  });

  const [customMode, setCustomMode] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  // 1. Download Standalone QR Code (PNG)
  const handleDownloadQrOnlyPng = () => {
    const qrCanvas = document.getElementById('standalone-qr-canvas') as HTMLCanvasElement;
    if (!qrCanvas) return;
    const pngUrl = qrCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'Nifas_Silk_Lafto_Portal_QR_Code.png';
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
    downloadLink.download = 'Nifas_Silk_Lafto_Portal_QR_Code.svg';
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
    ctx.fillRect(0, 0, width, 12);
    ctx.fillStyle = '#F5B700';
    ctx.fillRect(0, 12, width, 4);

    // Header Background Navy Bar
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(60, 60, width - 120, 260);

    // Gold Accent border on Navy Bar
    ctx.strokeStyle = '#F5B700';
    ctx.lineWidth = 6;
    ctx.strokeRect(60, 60, width - 120, 260);

    // Sub-City Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ንፋስ ስልክ ላፍቶ ክፍለ ከተማ አስተዳደር', width / 2, 140);

    ctx.font = '600 32px "Inter", sans-serif';
    ctx.fillStyle = '#F5B700';
    ctx.fillText('Nifas Silk-Lafto Sub-City Administration', width / 2, 195);

    ctx.font = '300 24px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillStyle = '#E8EEF7';
    ctx.fillText('የሥነ-ምግባር እና የፀረ-ሙስና መጠቆሚያ ፖርታል | Anti-Corruption Portal', width / 2, 255);

    // Poster Callout Header
    ctx.fillStyle = '#0B1F3A';
    ctx.font = '800 48px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText('ሙስናን ለመጠቆም ይህንን ይቃኙ', width / 2, 400);

    ctx.fillStyle = '#b45309';
    ctx.font = '700 36px "Inter", sans-serif';
    ctx.fillText('Scan to Report Corruption Safely', width / 2, 455);

    // Frame for QR
    ctx.fillStyle = '#E8EEF7';
    ctx.fillRect(300, 520, 600, 600);
    ctx.strokeStyle = '#0B1F3A';
    ctx.lineWidth = 8;
    ctx.strokeRect(300, 520, 600, 600);

    // Get QR code from standalone canvas and draw it into poster center
    const qrCanvas = document.getElementById('standalone-qr-canvas') as HTMLCanvasElement;
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 350, 570, 500, 500);
    }

    // Portal URL Text
    ctx.fillStyle = '#0B1F3A';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(targetUrl, width / 2, 1170);

    // Guarantees box
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(100, 1240, width - 200, 220);

    ctx.fillStyle = '#F5B700';
    ctx.font = 'bold 30px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText('★ 100% ሚስጥራዊ እና ስም-አልባ (Strictly Confidential & Anonymous) ★', width / 2, 1310);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 24px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText('የአይፒ (IP) አድራሻ ወይም የመሣሪያ መረጃ በጭራሽ አይመዘገብም', width / 2, 1365);

    ctx.fillStyle = '#E8EEF7';
    ctx.font = 'bold 24px "Noto Sans Ethiopic", "Inter", sans-serif';
    ctx.fillText('የነፃ ጥሪ መስመር (Hotline): 969 / +251 11 442 0123', width / 2, 1420);

    // Bottom Decorative Bar
    ctx.fillStyle = '#F5B700';
    ctx.fillRect(0, height - 20, width, 20);

    // Export as PNG
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'Nifas_Silk_Lafto_Anti_Corruption_Poster_QR.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadQrOnlyPng}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-300 transition-all cursor-pointer"
            title={t('downloadQrOnlyPng')}
          >
            <QrCode className="w-4 h-4 text-[#0B1F3A]" />
            <span>{t('downloadQrOnlyPng')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQrOnlySvg}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-300 transition-all cursor-pointer"
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

      {/* URL Configuration Toolbar */}
      <div className="no-print p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#F5B700]" />
            <span>{t('qrTargetUrlLabel')}</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTargetUrl(vercelProdUrl);
                setCustomMode(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                targetUrl === vercelProdUrl && !customMode
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
                setTargetUrl(localWifiUrl);
                setCustomMode(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                targetUrl === localWifiUrl && !customMode
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
                setTargetUrl(defaultOrigin);
                setCustomMode(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                targetUrl === defaultOrigin && !customMode
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('qrPresetCurrent')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                customMode
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
            value={targetUrl}
            onChange={(e) => {
              setTargetUrl(e.target.value);
              setCustomMode(true);
            }}
            placeholder="https://example.com"
            className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
          />
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{t('qrScanHint')}</span>
          </p>
        </div>
      </div>

      {/* Hidden high-res canvas used for standalone & poster export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
        <QRCodeCanvas
          id="standalone-qr-canvas"
          value={targetUrl}
          size={500}
          level="H"
          includeMargin={true}
        />
      </div>

      {/* Printable Poster Container */}
      <div
        ref={posterRef}
        className="bg-white rounded-2xl p-6 sm:p-12 shadow-sm border border-slate-200 text-center space-y-8 print:shadow-none print:border-none print:p-4 max-w-2xl mx-auto"
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

        {/* Scan Callout */}
        <div className="space-y-1.5 py-2 border-y-2 border-slate-100">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
            {t('scanToReportEth')}
          </h3>
          <p className="text-base sm:text-lg font-bold text-[#b45309]">
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
              value={targetUrl}
              size={240}
              level="H"
              includeMargin={true}
              className="rounded-xl shadow-xs"
            />
          </div>

          <div className="font-mono text-xs sm:text-sm font-bold text-[#0B1F3A] bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 break-all max-w-md">
            {targetUrl}
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
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
    </div>
  );
};