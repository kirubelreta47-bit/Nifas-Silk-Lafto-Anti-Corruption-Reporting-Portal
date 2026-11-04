import React from 'react';
import { ReportStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StatusBadgeProps {
  status: ReportStatus;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showDot = false,
  className = '',
}) => {
  const { t } = useLanguage();

  const getStatusConfig = () => {
    switch (status) {
      case 'new':
        return {
          label: t('status_new'),
          bg: 'bg-[#F5B700]/20 text-[#0B1F3A] border-[#F5B700]/60',
          dot: 'bg-[#F5B700] animate-pulse',
        };
      case 'under_review':
        return {
          label: t('status_under_review'),
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          dot: 'bg-blue-500',
        };
      case 'investigating':
        return {
          label: t('status_investigating'),
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          dot: 'bg-purple-600',
        };
      case 'resolved':
        return {
          label: t('status_resolved'),
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'rejected':
        return {
          label: t('status_rejected'),
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: status,
          bg: 'bg-gray-100 text-gray-800 border-gray-300',
          dot: 'bg-gray-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      {showDot && (
        <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      )}
      {config.label}
    </span>
  );
};
