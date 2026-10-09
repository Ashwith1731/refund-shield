import React, { useEffect, useState } from 'react';
import { Zap, ArrowRight, Layers } from 'lucide-react';
import { getParadoxDemo } from '../services/api';
import type { ParadoxScenario } from '../types';

export const ParadoxDemoPage: React.FC = () => {
  const [paradoxData, setParadoxData] = useState<ParadoxScenario | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDemo = async () => {
      try {
        const data = await getParadoxDemo();
        setParadoxData(data);
      } catch (err) {
        console.error('Failed to load paradox demo:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDemo();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading AI Detector Paradox Demo...</p>
      </div>
    );
  }

  const { scenario_a, scenario_b, headline } = paradoxData || {
    headline: "A single detector can be fooled. Evidence should be verified using multiple signals.",
    scenario_a: {
      title: "Scenario A: Direct AI-Generated Image",
      description: "Original synthetic image file submitted directly.",
      ai_detector_score: 0.99,
      ai_detector_verdict: "99% AI GENERATED",
      screen_photo_score: 0.05,
      provenance_score: 0.20,
      evidence_trust_score: 0.15,
      refundshield_risk: "HIGH",
      refundshield_decision: "MANUAL_REVIEW / REJECT",
      explanation: "High raw synthetic noise artifacts detected by standalone AI detector."
    },
    scenario_b: {
      title: "Scenario B: Same AI Image Photographed Off Screen",
      description: "AI image displayed on an iPad/laptop screen and photographed with a camera.",
      ai_detector_score: 0.10,
      ai_detector_verdict: "10% AI (FOOLED!)",
      screen_photo_score: 0.88,
      screen_photo_verdict: "HIGH MOIRÉ & PIXEL GRID DETECTED",
      provenance_score: 0.30,
      evidence_trust_score: 0.22,
      refundshield_risk: "HIGH (CAUGHT!)",
      refundshield_decision: "REQUEST_MORE_EVIDENCE",
      explanation: "Standalone AI detector is fooled by real camera lens optics. BUT RefundShield Screen-Photo & Provenance engines catch the re-photography display attack!"
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-12">
      {/* Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Zap className="w-4 h-4" />
          <span>HACKATHON DEMONSTRATION SCENARIO</span>
        </div>

        <h1 className="text-4xl font-extrabold text-white tracking-tight">The AI Detector Paradox</h1>

        <p className="text-xl font-bold text-cyan-400 leading-snug">
          "{headline}"
        </p>

        <p className="text-xs text-slate-400">
          Demonstration Scenario — Illustrates why single-model AI image detection fails against real-world display re-photography refund attacks.
        </p>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Scenario A Card */}
        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 relative overflow-hidden">
          <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono text-cyan-400 w-fit">
            Demonstration Scenario A
          </div>

          <h3 className="text-xl font-bold text-white">{scenario_a.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{scenario_a.description}</p>

          <div className="p-4 bg-slate-900/90 rounded-2xl border border-rose-500/30 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Standalone AI Detector Output</div>
            <div className="text-2xl font-extrabold text-rose-400">{scenario_a.ai_detector_verdict}</div>
            <div className="text-[11px] text-slate-400">Identifies original synthetic generation with high confidence.</div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">RefundShield Signals</div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>AI Generation Score:</span>
                <span className="text-rose-400 font-bold">99%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Screen-Photo Moiré:</span>
                <span className="text-emerald-400 font-bold">5% (Low)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Evidence Trust Score:</span>
                <span className="text-rose-400 font-bold">15%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200">
            <strong>Result:</strong> High Risk Flagged due to direct AI generation.
          </div>
        </div>

        {/* Scenario B Card (The Paradox Counter-Attack) */}
        <div className="glass-card rounded-3xl p-8 border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/30 space-y-6 relative overflow-hidden shadow-xl shadow-cyan-500/10">
          <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] font-mono text-cyan-400 w-fit">
            Demonstration Scenario B (Photographed AI Image)
          </div>

          <h3 className="text-xl font-bold text-white">{scenario_b.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{scenario_b.description}</p>

          <div className="p-4 bg-slate-900/90 rounded-2xl border border-rose-500/40 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Standalone AI Detector Output</div>
            <div className="text-2xl font-extrabold text-amber-400">{scenario_b.ai_detector_score * 100}% AI (FOOLED!)</div>
            <div className="text-[11px] text-rose-300 font-semibold">
              ⚠️ AI detector fails because camera lens optical blur masks synthetic noise!
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">RefundShield Multimodal Defense</div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Standalone AI Detector:</span>
                <span className="text-amber-400 font-bold">10% (Fooled)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Screen-Photo Moiré Signal:</span>
                <span className="text-rose-400 font-bold">88% (HIGH SCREEN PHOTO)</span>
              </div>
              <div className="flex justify-between text-cyan-300 font-bold">
                <span>Evidence Trust Score:</span>
                <span className="text-rose-400">22% (UNTRUSTWORTHY)</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
            <strong>RefundShield Decision:</strong> CAUGHT! Flagged as High Risk / Request Video Evidence because Screen-Photo engine detected LCD subpixel Moiré grid!
          </div>
        </div>
      </div>

      {/* CORE ARCHITECTURE FLOWCHART DISPLAY */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <Layers className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">RefundShield Final Core Architecture</h3>
        </div>

        <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[800px] gap-2 text-[11px] font-mono font-bold text-slate-300">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
              Customer Support Chat
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />

            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
              Claim Understanding
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />

            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
              Evidence Required?
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />

            <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded-xl text-center">
              Upload Photo (Primary)
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />

            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
              Multimodal CV & Forensics
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />

            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
              Customer Risk Context
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />

            <div className="p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-xl text-center shadow-md">
              RefundShield Risk Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
