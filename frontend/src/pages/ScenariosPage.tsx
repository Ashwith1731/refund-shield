import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const scenarios = [
    {
      id: 'genuine_eggs',
      category: 'Food',
      title: 'Scenario 1 — Correct Product + Quantity + Valid Damage (Eggs)',
      badge: 'LOW RISK / AUTO APPROVE',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: 'Order: 6 Eggs, Claim: 2 broken. Evidence shows 6 eggs visible with 2 broken. Product & Quantity match 100%, customer risk low.',
      image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=600&q=80',
      expected: 'Evidence Trust: 92% • Action: AUTO APPROVE'
    },
    {
      id: 'face_photo',
      category: 'Food',
      title: 'Scenario 2 — Face Photo Submitted Instead of Ordered Product',
      badge: 'HIGH RISK / WRONG EVIDENCE',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      description: 'Order: 6 Eggs, Claim: 2 broken. Submitted image is a human face. System detects 0 eggs, product match 0%, damage not found.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      expected: 'Evidence Trust: 10% • Action: REQUEST MORE EVIDENCE'
    },
    {
      id: 'wrong_food',
      category: 'Food',
      title: 'Scenario 3 — Wrong Product (Chocolate Bar instead of Milk)',
      badge: 'PRODUCT MISMATCH',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      description: 'Order: Organic Whole Milk 1L, Claim: Leaking packet. Submitted image shows a Chocolate Bar. Product match low, claim consistency low.',
      image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
      expected: 'Evidence Trust: 18% • Action: REQUEST MORE EVIDENCE'
    },
    {
      id: 'missing_quantity',
      category: 'Grocery',
      title: 'Scenario 4 — Missing Quantity Discrepancy',
      badge: 'QUANTITY MISMATCH',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      description: 'Order: 6 White Eggs, Claim: Missing items. Evidence shows only 3 eggs in carton. Quantity discrepancy detected (3 missing).',
      image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=600&q=80',
      expected: 'Discrepancy: 3 items • Action: MANUAL REVIEW'
    },
    {
      id: 'ai_generated',
      category: 'Electronics',
      title: 'Scenario 5 — AI-Generated Damaged Product Image',
      badge: 'HIGH AI RISK',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      description: 'Order: Flagship Smartphone. Customer submits synthetic AI diffusion image of cracked screen. AI detection flag triggered.',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      expected: 'AI Risk: HIGH • Action: MANUAL REVIEW'
    },
    {
      id: 'photographed_ai',
      category: 'Electronics',
      title: 'Scenario 6 — Photograph of AI Image (Display Screen Paradox)',
      badge: 'SCREEN-PHOTO ATTACK',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      description: 'AI image displayed on iPad screen and photographed. Standalone AI detector is fooled, but Screen-Photo Moiré grid catches display attack.',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      expected: 'Screen Photo: 88% • Action: REQUEST MORE EVIDENCE'
    },
    {
      id: 'high_refund_customer',
      category: 'Behavioral',
      title: 'Scenario 7 — Customer with Unusually High Refund Frequency',
      badge: 'ELEVATED CUSTOMER RISK',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      description: 'Account age: 8 days, 11 orders, 7 refunds (63.6% refund rate), 4 claims in last 7 days. Customer risk score elevated.',
      image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
      expected: 'Customer Risk: ELEVATED • Action: MANUAL REVIEW'
    },
    {
      id: 'new_address',
      category: 'Behavioral',
      title: 'Scenario 8 — New Delivery Address Context',
      badge: 'NEW ADDRESS / NEUTRAL',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      description: 'Order delivered to a newly added address. Customer has 18 months account age with low 4.8% refund rate. Not treated as fraud.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      expected: 'Address Context: NEW (Neutral) • Action: AUTO APPROVE'
    },
    {
      id: 'leaking_milk',
      category: 'Grocery',
      title: 'Scenario 9 — Damaged Food Packaging (Leaking Milk)',
      badge: 'PACKAGING DAMAGE',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: 'Order: Organic Milk 1L. Claim: Leaking. Punctured milk pouch with liquid spill. Visual quality support high.',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
      expected: 'Evidence Trust: 89% • Action: AUTO APPROVE'
    },
    {
      id: 'manipulated',
      category: 'Electronics',
      title: 'Scenario 10 — Digitally Manipulated Genuine Image',
      badge: 'SPLICING ARTIFACTS',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      description: 'Genuine photo of undamaged phone edited using Photoshop to overlay synthetic screen cracks. ELA flag triggered.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      expected: 'Manipulation Score: 88% • Action: MANUAL REVIEW'
    },
    {
      id: 'missing_exif',
      category: 'Metadata',
      title: 'Scenario 11 — Missing EXIF Metadata (Web Upload)',
      badge: 'METADATA NEUTRAL',
      badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      description: 'Image lacks EXIF metadata due to web stripping. RefundShield treats metadata as NEUTRAL/UNKNOWN, not automatic fraud.',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      expected: 'Provenance: UNKNOWN (Neutral) • Action: EVALUATE CV'
    },
    {
      id: 'camera_capture_no_exif',
      category: 'Metadata',
      title: 'Scenario 12 — Camera Capture with Web Browser (No EXIF)',
      badge: 'REFUNDSHIELD CAMERA',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: 'Image captured via browser HTML5 camera API. Capture session logged with hash, confirmed live capture.',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      expected: 'Capture: RefundShield Camera • Action: TRUST VERIFIED'
    }
  ];

  const filteredScenarios = scenarios.filter((s) => {
    if (selectedCat === 'ALL') return true;
    return s.category.toUpperCase() === selectedCat.toUpperCase();
  });

  const handleRunScenario = (scenarioId: string) => {
    navigate(`/capture?claim_id=CLM-1001&scenario=${scenarioId}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
          MULTIMODAL TEST MATRIX
        </span>
        <h1 className="text-3xl font-extrabold text-white">Interactive Demo Test Matrix</h1>
        <p className="text-sm text-slate-400">
          Run automated hackathon test scenarios demonstrating <strong>3-Layer Verification</strong>: Evidence CV + Order Context + Customer Behavioral Risk.
        </p>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {['ALL', 'FOOD', 'ELECTRONICS', 'GROCERY', 'BEHAVIORAL', 'METADATA'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedCat === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredScenarios.map((s, idx) => (
          <div
            key={`${s.id}-${idx}`}
            className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <img
                src={s.image}
                alt={s.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                    {s.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-300 max-w-xl">{s.description}</p>
                <div className="text-[11px] font-mono text-cyan-400 font-semibold pt-0.5">
                  Expected Result: {s.expected}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRunScenario(s.id)}
              className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 shrink-0 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Scenario Demo</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
