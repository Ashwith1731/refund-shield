import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, ArrowRight, Layers, Eye } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 mb-8 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>AI-POWERED REFUND EVIDENCE VERIFICATION</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Don't just detect fake images. <br />
            <span className="gradient-text">Verify the evidence.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            RefundShield helps e-commerce platforms determine whether customer-submitted refund evidence is trustworthy using multi-signal computer vision and forensic analysis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/request"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-2xl font-bold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-105"
            >
              <span>Try Interactive Demo</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 glass-card glass-card-hover text-slate-200 hover:text-white rounded-2xl font-bold text-base flex items-center justify-center space-x-2 border border-slate-800"
            >
              <Eye className="w-5 h-5 text-cyan-400" />
              <span>View Fraud Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-2">The E-Commerce Vulnerability</h2>
          <h3 className="text-3xl font-extrabold text-white">Why Single AI Detectors Fail</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="glass-card rounded-2xl p-8 border border-slate-800 space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl w-fit text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">The Re-Photography Attack Vector</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              A fraudster generates a synthetic AI image of a cracked product, displays it on an iPad or laptop, and photographs that display using a real smartphone camera.
            </p>
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 space-y-1">
              <p>1. AI-generated image created (99% AI)</p>
              <p>2. Displayed on secondary screen</p>
              <p>3. Photographed using camera</p>
              <p className="text-rose-400 font-bold">➔ Standalone AI Detector output: 10% AI (FOOLED!)</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-slate-800 space-y-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl w-fit text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">The RefundShield Multimodal Engine</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              RefundShield never relies on a single AI image detector. Instead, it combines 7 independent forensic, optical, and transactional signals.
            </p>
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 space-y-1">
              <p>✓ Screen-Photo Moiré & Subpixel Grid Analysis</p>
              <p>✓ JPEG Error Level Analysis (ELA) Splicing</p>
              <p>✓ Camera Hardware EXIF Provenance</p>
              <p>✓ Catalog Product Embeddings Matching</p>
              <p className="text-emerald-400 font-bold">➔ Evidence Trust Score: UNTRUSTWORTHY (CAUGHT!)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Section — Evidence Trust Score */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              The <span className="gradient-text">Evidence Trust Score</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Instead of answering a binary "Is this image AI-generated?", RefundShield quantifies overall evidence authenticity to determine if a refund claim deserves to be trusted.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
              <div className="text-cyan-400 font-extrabold text-2xl mb-1">20%</div>
              <div className="text-xs font-bold text-slate-200">Product Match</div>
              <div className="text-[11px] text-slate-400 mt-1">Catalog consistency</div>
            </div>
            <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
              <div className="text-cyan-400 font-extrabold text-2xl mb-1">20%</div>
              <div className="text-xs font-bold text-slate-200">Damage Detection</div>
              <div className="text-[11px] text-slate-400 mt-1">Fracture verification</div>
            </div>
            <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
              <div className="text-cyan-400 font-extrabold text-2xl mb-1">15%</div>
              <div className="text-xs font-bold text-slate-200">Screen Photo Risk</div>
              <div className="text-[11px] text-slate-400 mt-1">Moiré & grid check</div>
            </div>
            <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
              <div className="text-cyan-400 font-extrabold text-2xl mb-1">45%</div>
              <div className="text-xs font-bold text-slate-200">AI / Manipulation / Provenance</div>
              <div className="text-[11px] text-slate-400 mt-1">Forensic metadata</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to test RefundShield?</h2>
        <p className="text-slate-400 text-sm mb-8">
          Submit a simulated e-commerce refund request using live camera capture or run pre-loaded hackathon scenarios.
        </p>
        <Link
          to="/request"
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-2xl font-bold text-base shadow-xl shadow-cyan-500/25 inline-flex items-center space-x-2"
        >
          <span>Start Evidence Submission</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
};
