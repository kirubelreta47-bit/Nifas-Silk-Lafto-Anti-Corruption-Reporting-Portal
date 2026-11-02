import React, { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useLanguage } from '../../context/LanguageContext';
import { OfficialEmblem } from '../../components/OfficialEmblem';
import { QrCode, Download, Printer, Shield, Lock, PhoneCall, ExternalLink } from 'lucide-react';

export const QrCodePage: React.FC = () => {
  const { t, lang } = useLanguage();
  const posterRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // The public form URL is the site origin
  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://nsl.gov.et';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = () => {
    // Generate high resolution printable poster on a canvas
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
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ንፋስ ስልክ ላፍቶ ክፍለ ከተማ አስተዳደር', width / 2, 140);

    ctx.font = '600 32px sans-serif';
    ctx.fillStyle = '#F5B700';
    ctx.fillText('Nifas Silk-Lafto Sub-City Administration', width / 2, 195);

    ctx.font = '300 24px sans-serif';
    ctx.fillStyle = '#E8EEF7';
    ctx.fillText('የሥነ-ምግባር እና የፀረ-ሙስና መጠቆሚያ ፖርታል | Anti-Corruption Portal', width / 2, 255);

    // Poster Callout Header
    ctx.fillStyle = '#0B1F3A';
    ctx.font = '800 48px sans-serif';
    ctx.fillText('ሙስናን ለመጠቆም ይህንን ይቃኙ', width / 2, 400);

    ctx.fillStyle = '#b45309';
    ctx.font = '700 36px sans-serif';
    ctx.fillText('Scan to Report Corruption Safely', width / 2, 455);

    // Frame for QR
    ctx.fillStyle = '#E8EEF7';
    ctx.fillRect(300, 520, 600, 600);
    ctx.strokeStyle = '#0B1F3A';
    ctx.lineWidth = 8;
    ctx.strokeRect(300, 520, 600, 600);

    // Get QR code from hidden canvas or draw it
    const qrCanvas = document.getElementById('poster-qr-canvas') as HTMLCanvasElement;
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, 350, 570, 500, 500);
    }

    // Portal URL Text
    ctx.fillStyle = '#0B1F3A';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(portalUrl, width / 2, 1170);

    // Guarantees box
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(100, 1240, width - 200, 220);

    ctx.fillStyle = '#F5B700';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('★ 100% ሚስጥራዊ እና ስም-አልባ (Strictly Confidential & Anonymous) ★', width / 2, 1310);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 24px sans-serif';
    ctx.fillText('የአይፒ (IP) አድራሻ ወይም የመሣሪያ መረጃ በጭራሽ አይመዘገብም', width / 2, 1365);

    ctx.fillStyle = '#E8EEF7';
    ctx.font = 'bold 24px sans-serif';
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPng}
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

      {/* Hidden canvas used for high-res PNG generation */}
      <div className="hidden" aria-hidden="true">
        <QRCodeCanvas
          id="poster-qr-canvas"
          value={portalUrl}
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

        {/* Large QR Code Display */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-6 rounded-3xl bg-[#E8EEF7] border-4 border-[#0B1F3A] shadow-inner inline-block">
            <QRCodeSVG
              value={portalUrl}
              size={240}
              level="H"
              includeMargin={true}
              className="rounded-xl shadow-xs"
            />
          </div>

          <div className="font-mono text-xs sm:text-sm font-bold text-[#0B1F3A] bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 break-all max-w-md">
            {portalUrl}
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
