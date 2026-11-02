import React from 'react';

interface OfficialEmblemProps {
  className?: string;
  size?: number;
}

export const OfficialEmblem: React.FC<OfficialEmblemProps> = ({
  className = '',
  size = 44,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Nifas Silk-Lafto Sub-City Emblem"
    >
      {/* Outer Navy Ring */}
      <circle cx="50" cy="50" r="47" fill="#0B1F3A" stroke="#F5B700" strokeWidth="3" />
      <circle cx="50" cy="50" r="41" fill="#FFFFFF" stroke="#0B1F3A" strokeWidth="1.5" />

      {/* Internal Background Gradient / Sky */}
      <circle cx="50" cy="50" r="38" fill="#E8EEF7" />

      {/* Radiant Sunburst rays */}
      <path
        d="M50 15 L52 24 L50 22 L48 24 Z M50 85 L52 76 L50 78 L48 76 Z M15 50 L24 52 L22 50 L24 48 Z M85 50 L76 52 L78 50 L76 48 Z"
        fill="#F5B700"
      />

      {/* Stylized Scale of Justice (Fairness & Anti-Corruption) */}
      <line x1="50" y1="26" x2="50" y2="72" stroke="#0B1F3A" strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="36" x2="70" y2="36" stroke="#0B1F3A" strokeWidth="3" strokeLinecap="round" />
      
      {/* Left Pan */}
      <line x1="30" y1="36" x2="23" y2="52" stroke="#0B1F3A" strokeWidth="1.5" />
      <line x1="30" y1="36" x2="37" y2="52" stroke="#0B1F3A" strokeWidth="1.5" />
      <path d="M20 52 C20 58 40 58 40 52 Z" fill="#F5B700" stroke="#0B1F3A" strokeWidth="1.5" />

      {/* Right Pan */}
      <line x1="70" y1="36" x2="63" y2="52" stroke="#0B1F3A" strokeWidth="1.5" />
      <line x1="70" y1="36" x2="77" y2="52" stroke="#0B1F3A" strokeWidth="1.5" />
      <path d="M60 52 C60 58 80 58 80 52 Z" fill="#F5B700" stroke="#0B1F3A" strokeWidth="1.5" />

      {/* Base of Scale / Shield */}
      <path
        d="M38 72 L62 72 L57 78 L43 78 Z"
        fill="#0B1F3A"
      />
      <circle cx="50" cy="27" r="4" fill="#F5B700" stroke="#0B1F3A" strokeWidth="1.5" />

      {/* Base accent dot */}
      <circle cx="50" cy="83" r="3" fill="#F5B700" />
    </svg>
  );
};
