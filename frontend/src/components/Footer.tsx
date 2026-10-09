import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-400 text-sm py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-slate-200">RefundShield Prototype</span>
          <span className="text-xs text-slate-500">| Multimodal Evidence Verification</span>
        </div>
        
        <p className="text-xs text-slate-500 text-center max-w-lg">
          <Lock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
          This is a hackathon prototype. Its forensic and AI signals evaluate evidence trustworthiness to assist human decision-making.
        </p>

        <div className="text-xs text-cyan-400 font-mono">
          v1.0.0-hackathon
        </div>
      </div>
    </footer>
  );
};
