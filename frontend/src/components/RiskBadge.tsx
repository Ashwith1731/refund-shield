import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, XCircle } from 'lucide-react';

interface RiskBadgeProps {
  level?: 'LOW' | 'MEDIUM' | 'HIGH';
  action?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, action }) => {
  if (action) {
    switch (action) {
      case 'AUTO_APPROVE':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>AUTO APPROVE</span>
          </span>
        );
      case 'MANUAL_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>MANUAL REVIEW</span>
          </span>
        );
      case 'REQUEST_MORE_EVIDENCE':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>REQUEST MORE EVIDENCE</span>
          </span>
        );
      case 'HIGH_RISK':
      case 'REJECT_CLAIM':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>HIGH RISK / REJECT</span>
          </span>
        );
      default:
        break;
    }
  }

  switch (level) {
    case 'LOW':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          ● LOW RISK
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
          ● MEDIUM RISK
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40">
          ● HIGH RISK
        </span>
      );
    default:
      return null;
  }
};
