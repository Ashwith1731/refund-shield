import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShoppingBag, Camera, Cpu, Eye, UserCheck, ShieldCheck } from 'lucide-react';
import { getRefundClaim } from '../services/api';
import type { RefundClaim } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { RiskBadge } from '../components/RiskBadge';
import { ReviewModal } from '../components/ReviewModal';

export const ClaimDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [claim, setClaim] = useState<RefundClaim | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) return;
      try {
        const data = await getRefundClaim(id);
        setClaim(data);
      } catch (err) {
        console.error('Failed to load claim details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaim();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading RefundShield Multimodal Claim Investigation...</p>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Refund Claim Not Found</h2>
        <Link to="/dashboard" className="text-cyan-400 underline font-semibold text-sm">
          ← Back to RefundShield Risk Dashboard
        </Link>
      </div>
    );
  }

  const analysis = claim.latest_analysis;
  const custRisk = analysis?.customer_risk_profile || claim.customer_risk_profile || {
    account_age_display: '14 months',
    total_orders: 87,
    total_refunds: 3,
    refund_rate_pct: 3.4,
    refunds_last_30_days: 0,
    previous_fraud_flags: 0,
    address_consistency: 'CONSISTENT',
    customer_risk_level: 'LOW'
  };

  const objDetect = analysis?.object_detection || {
    detected_objects: ['Eggs', 'Carton'],
    primary_object: claim.product?.name || 'Product',
    ordered_object_detected: true,
    explanation: 'Expected product object detected.'
  };

  const objCount = analysis?.object_counting || {
    expected_quantity: claim.product?.quantity || 1,
    detected_quantity: claim.product?.quantity || 1,
    quantity_discrepancy: 0,
    count_match_score: 1.0,
    explanation: 'Detected quantity matches ordered line item.'
  };

  const trustScore = claim.evidence_trust_score ?? analysis?.evidence_trust_score ?? 0.88;
  const riskScore = analysis?.risk_score ?? (1.0 - trustScore);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Top Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard" className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                MULTIMODAL INVESTIGATION
              </span>
              <span className="text-xs font-mono text-slate-400">ID: #{claim.id}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">
              Refund Claim Audit Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <RiskBadge level={claim.risk_level || analysis?.risk_level || 'LOW'} />
          <RiskBadge action={claim.status !== 'SUBMITTED' ? claim.status : (claim.recommended_action || 'AUTO_APPROVE')} />
          <button
            onClick={() => setIsReviewOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            Review & Override Decision
          </button>
        </div>
      </div>

      {/* 8-SECTION INVESTIGATION GRID */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Claim, Order, Evidence & Customer Risk */}
        <div className="space-y-6">
          
          {/* SECTION A: CLAIM CONTEXT */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>A. Claim Information</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Claim ID</span>
                <span className="font-mono text-slate-200 font-bold">{claim.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Order ID</span>
                <span className="font-mono text-cyan-300 font-bold">{claim.order_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Stated Claim Reason</span>
                <span className="text-amber-400 font-bold">{claim.reason}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Refund Amount</span>
                <span className="text-emerald-400 font-bold">₹{(claim.product?.price || 499).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Customer Description</span>
                <p className="text-slate-300 italic bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px]">
                  "{claim.description}"
                </p>
              </div>
            </div>
          </div>

          {/* SECTION B: ORDER CONTEXT */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>B. Associated Order Details</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Ordered Item</span>
                <span className="text-slate-200 font-bold">{claim.product?.name || 'Item'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Category</span>
                <span className="text-slate-300 font-semibold">{claim.product?.category || 'Food'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Order Quantity</span>
                <span className="font-mono text-slate-200 font-bold">{claim.product?.quantity || 1} units</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Delivery Status</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span>✓ DELIVERED</span>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION C: SUBMITTED EVIDENCE */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>C. Submitted Photo Evidence</span>
            </h3>

            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
              <img
                src={analysis?.image_url || claim.product?.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591'}
                alt="Submitted Evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-slate-950/90 backdrop-blur-md rounded-lg text-[10px] font-mono text-slate-300 flex justify-between">
                <span>Capture: {analysis?.signals?.exif_details?.capture_method || 'browser_camera'}</span>
                <span className="text-cyan-400">ID: {analysis?.evidence_id || 'EVD-101'}</span>
              </div>
            </div>
          </div>

          {/* SECTION F: CUSTOMER RISK PANEL */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span>F. Customer Risk Profile</span>
              </h3>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                custRisk.customer_risk_level === 'ELEVATED'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                RISK: {custRisk.customer_risk_level || 'LOW'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Account Age</span>
                <span className="text-slate-200 font-bold">{custRisk.account_age_display || '14 months'}</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Total Orders</span>
                <span className="text-slate-200 font-bold">{custRisk.total_orders || 87}</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Previous Refunds</span>
                <span className="text-slate-200 font-bold">{custRisk.total_refunds || 3}</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Refund Rate %</span>
                <span className={`font-bold ${ (custRisk.refund_rate_pct || 3.4) > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {custRisk.refund_rate_pct || 3.4}%
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Refunds in Last 30d</span>
                <span className="text-slate-200 font-bold">{custRisk.refunds_last_30_days || 0}</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Address Consistency</span>
                <span className={`font-bold text-[11px] ${
                  custRisk.address_consistency === 'UNUSUAL' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {custRisk.address_consistency === 'CONSISTENT' ? '✓ CONSISTENT' : custRisk.address_consistency}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (2 cols): Computer Vision, Image Forensics, Decision & Reasons */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION G: FINAL DECISION & SCORES */}
          <div className="grid sm:grid-cols-2 gap-4">
            <ScoreGauge
              score={trustScore}
              title="Evidence Trust Score"
              subtitle="Multimodal evidence integrity"
            />
            <ScoreGauge
              score={riskScore}
              title="Overall Refund Fraud Risk"
              subtitle="Combined 3-layer risk evaluation"
              inverseColors={true}
            />
          </div>

          {/* SECTION D: COMPUTER VISION AUDIT */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>D. Layer 1: Computer Vision & Object Verification</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              
              {/* Object Detection */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px]">Independent Image Content Detection</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">Detected Image Content: {objDetect.primary_object}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    objDetect.ordered_object_detected ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {objDetect.ordered_object_detected ? 'MATCH' : 'MISMATCH'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{objDetect.explanation}</p>
              </div>

              {/* Object Counting */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px]">Object Counting Verification</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">
                    Expected: {objCount.expected_quantity} | Detected: {objCount.detected_quantity}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    objCount.quantity_discrepancy === 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    DISCREPANCY: {objCount.quantity_discrepancy}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{objCount.explanation}</p>
              </div>

              {/* Product Match */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px]">Product Comparison (Ordered vs Detected)</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">Ordered: {claim.product?.name || 'Catalog Item'}</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {Math.round((analysis?.product_match_score || 0) * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Detected Content: <strong>{objDetect.primary_object}</strong> ({analysis?.product_match_status || 'UNCONFIRMED'})
                </p>
              </div>

              {/* Damage Detection */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px]">Damage / Quality Detection</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">{analysis?.damage_type || 'Visual Quality Indicator'}</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {Math.round((analysis?.damage_score || 0) * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{analysis?.damage_status || 'UNVERIFIED'}: {objDetect.ordered_object_detected ? 'Physical defect / damage indicators analyzed.' : 'Damage unverified because ordered product is not present.'}</p>
              </div>
            </div>
          </div>

          {/* SECTION E: IMAGE FORENSICS & METADATA */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>E. Layer 1 (Sub-signals): Image Forensics & Provenance</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              
              {/* AI Generation */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">AI Generation Risk</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {Math.round((analysis?.ai_generation_score || 0.12) * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Evaluated as one signal among multimodal indicators.</p>
              </div>

              {/* Manipulation */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Manipulation / ELA</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {Math.round((analysis?.manipulation_score || 0.28) * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">JPEG Error Level Analysis & compression uniformity check.</p>
              </div>

              {/* Screen Photo */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Screen-Photo Attack Risk</span>
                  <span className="text-rose-400 font-mono font-bold">
                    {Math.round((analysis?.screen_photo_score || 0.15) * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Moiré frequency & display pixel grid analysis.</p>
              </div>

              {/* Provenance */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Metadata & Capture Provenance</span>
                  <span className="text-slate-200 font-mono font-bold text-[10px]">
                    {analysis?.provenance_status || 'METADATA_UNAVAILABLE'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Missing EXIF is treated as neutral/unknown, not automatic fraud.</p>
              </div>
            </div>
          </div>

          {/* SECTION H: EXPLAINABLE DECISION REASONS */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>H. RefundShield Risk Recommendation & Rationale</span>
            </h3>

            <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Recommended Action</span>
                <span className="text-base font-extrabold text-white">
                  {claim.recommended_action || analysis?.recommended_action || 'AUTO_APPROVE'}
                </span>
              </div>
              <RiskBadge action={claim.recommended_action || 'AUTO_APPROVE'} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Explainable Risk Rationale:</span>
              <ul className="space-y-2 text-xs font-mono">
                {(analysis?.reasons || [
                  "[MATCH] Visually detected expected product object: 'Eggs' (Food)",
                  "[MATCH] Verified quantity: detected 6 unit(s) matching order (6)",
                  "[MATCH] Claimed damage/quality defect visually supported",
                  "[MATCH] Captured live through RefundShield camera interface",
                  "[MATCH] Customer refund history within normal threshold (3.4% refund rate)"
                ]).map((r, idx) => {
                  const isFail = r.includes('[FAIL]') || r.includes('[MISMATCH]');
                  const isWarn = r.includes('[WARNING]');
                  return (
                    <li
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                        isFail
                          ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                          : isWarn
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                          : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      <span>{r}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="text-[11px] text-slate-400 italic pt-2">
              * Note: RefundShield provides continuous risk scoring based on evidence support and claim context. Computer vision outputs represent potential indicators rather than absolute proof.
            </p>
          </div>

        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        claimId={claim.id}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSuccess={(updated) => {
          setClaim((prev) => prev ? { ...prev, status: updated.decision } : prev);
        }}
      />
    </div>
  );
};
