import React from 'react';
import { ItemId } from '../game/types';

interface ItemIconProps {
  id: ItemId;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ id, className = 'w-10 h-10' }) => {
  switch (id) {
    case 'bensin':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="17" y="5" width="14" height="5" rx="2" fill="#DC2626" stroke="#1C1917" strokeWidth="2.5" />
          <rect x="19" y="10" width="10" height="7" fill="#CBD5E1" stroke="#1C1917" strokeWidth="2.5" />
          <rect x="12" y="17" width="24" height="26" rx="6" fill="#E2E8F0" stroke="#1C1917" strokeWidth="2.5" />
          <rect x="15" y="24" width="18" height="16" rx="3" fill="#FACC15" />
          <rect x="15" y="24" width="18" height="5" fill="#16A34A" />
          <line x1="18" y1="27" x2="18" y2="37" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'mie':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="7" y="10" width="34" height="28" rx="4" fill="#FFFBEB" stroke="#1C1917" strokeWidth="2.5" />
          <rect x="9" y="12" width="30" height="8" rx="2" fill="#DC2626" />
          <rect x="9" y="29" width="30" height="7" rx="2" fill="#FACC15" />
          <circle cx="24" cy="24" r="6.5" fill="#FDE047" stroke="#D97706" strokeWidth="2.5" />
          <path d="M20 24 Q24 20 28 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'rokok':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <g transform="rotate(-10 18 24)">
            <rect x="10" y="9" width="7" height="30" rx="1.5" fill="#F8FAFC" stroke="#1C1917" strokeWidth="2.2" />
            <rect x="10" y="29" width="7" height="10" fill="#D97706" stroke="#1C1917" strokeWidth="2" />
          </g>
          <g transform="rotate(8 27 24)">
            <rect x="20" y="8" width="7" height="30" rx="1.5" fill="#F8FAFC" stroke="#1C1917" strokeWidth="2.2" />
            <rect x="20" y="28" width="7" height="10" fill="#D97706" stroke="#1C1917" strokeWidth="2" />
            <rect x="20" y="8" width="7" height="4" fill="#EF4444" />
          </g>
          <rect x="31" y="21" width="9" height="18" rx="2" fill="#EF4444" stroke="#1C1917" strokeWidth="2.2" />
          <rect x="32.5" y="16" width="6" height="5" rx="1" fill="#CBD5E1" stroke="#1C1917" strokeWidth="2" />
        </svg>
      );

    case 'galon':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="19" y="5" width="10" height="5" rx="1.5" fill="#1D4ED8" stroke="#0C4A6E" strokeWidth="2.2" />
          <path d="M12 18 L19 10 L29 10 L36 18 Z" fill="#7DD3FC" stroke="#0C4A6E" strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="10" y="18" width="28" height="25" rx="5" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="2.5" />
          <line x1="12" y1="26" x2="36" y2="26" stroke="#0284C7" strokeWidth="2" />
          <line x1="12" y1="34" x2="36" y2="34" stroke="#0284C7" strokeWidth="2" />
          <line x1="16" y1="22" x2="16" y2="38" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'token':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="12" y="6" width="24" height="36" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
          <rect x="15" y="10" width="18" height="17" rx="2" fill="#FEF08A" />
          <polygon points="26,12 19,20 24,20 22,26 29,18 24,18" fill="#EA580C" />
          <rect x="16" y="31" width="4" height="3" rx="0.5" fill="#94A3B8" />
          <rect x="22" y="31" width="4" height="3" rx="0.5" fill="#94A3B8" />
          <rect x="28" y="31" width="4" height="3" rx="0.5" fill="#94A3B8" />
          <rect x="16" y="36" width="4" height="3" rx="0.5" fill="#94A3B8" />
          <rect x="22" y="36" width="4" height="3" rx="0.5" fill="#94A3B8" />
          <rect x="28" y="36" width="4" height="3" rx="0.5" fill="#94A3B8" />
        </svg>
      );
  }
};
