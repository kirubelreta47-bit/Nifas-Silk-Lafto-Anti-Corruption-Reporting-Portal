import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { PublicReportPage } from './pages/PublicReportPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ReportsListPage } from './pages/admin/ReportsListPage';
import { ReportDetailPage } from './pages/admin/ReportDetailPage';
import { QrCodePage } from './pages/admin/QrCodePage';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-white text-[#0B1F3A]">
          <Header />
          <div className="flex-1">
            <Routes>
              {/* Public Citizen Reporting Form */}
              <Route path="/" element={<PublicReportPage />} />

              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Suite */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="reports" element={<ReportsListPage />} />
                <Route path="reports/:id" element={<ReportDetailPage />} />
                <Route path="qr" element={<QrCodePage />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
