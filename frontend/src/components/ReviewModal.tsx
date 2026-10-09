import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, FileVideo, X, Send } from 'lucide-react';
import { submitReviewDecision } from '../services/api';

interface ReviewModalProps {
  claimId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedClaim: any) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ claimId, isOpen, onClose, onSuccess }) => {
  const [decision, setDecision] = useState<'APPROVE_REFUND' | 'REQUEST_MORE_EVIDENCE' | 'REJECT_CLAIM'>('APPROVE_REFUND');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitReviewDecision({
        claim_id: claimId,
        decision: decision,
        reviewer_notes: notes || `Decision set to ${decision} by Fraud Risk Specialist.`
      });
      onSuccess(res);
      onClose();
    } catch (err) {
      console.error('Failed to submit review decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl glass-card rounded-2xl border border-slate-800 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Manual Fraud Review</h3>
        <p className="text-xs text-slate-400 mb-6">Claim ID: <span className="font-mono text-cyan-400 font-semibold">{claimId}</span></p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Decision Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Select Reviewer Decision
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVE_REFUND')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  decision === 'APPROVE_REFUND'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="text-xs font-bold">APPROVE REFUND</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REQUEST_MORE_EVIDENCE')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  decision === 'REQUEST_MORE_EVIDENCE'
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-cyan-400 mb-2" />
                <span className="text-xs font-bold">REQUEST MORE EVIDENCE</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECT_CLAIM')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  decision === 'REJECT_CLAIM'
                    ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 ring-2 ring-rose-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-400 mb-2" />
                <span className="text-xs font-bold">REJECT CLAIM</span>
              </button>
            </div>
          </div>

          {/* Special Instruction Generator for REQUEST_MORE_EVIDENCE */}
          {decision === 'REQUEST_MORE_EVIDENCE' && (
            <div className="p-4 bg-slate-900/90 rounded-xl border border-cyan-500/30 text-xs text-slate-300 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
                <FileVideo className="w-4 h-4" />
                <span>Generated Customer Instructions:</span>
              </div>
              <p className="text-slate-400">Please capture a short video showing:</p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-300 font-mono text-[11px]">
                <li>Complete product from multiple camera angles</li>
                <li>Close-up of claimed damaged area</li>
                <li>Original product box packaging</li>
                <li>Product serial number / barcode label</li>
                <li>Surrounding room environment</li>
              </ol>
              <p className="text-[11px] text-amber-400 font-medium pt-1">
                Notice: Do not submit screenshots or photographs of another display.
              </p>
            </div>
          )}

          {/* Reviewer Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Reviewer Notes / Justification
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter audit rationale, evidence inspection notes, or customer instructions..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording Decision...' : 'Save Decision'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
