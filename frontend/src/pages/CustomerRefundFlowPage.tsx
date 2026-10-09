import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, FileText, Camera, Tag } from 'lucide-react';
import { getOrders, createRefundClaim } from '../services/api';
import type { Order } from '../types';

export const CustomerRefundFlowPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const ordersList = await getOrders();
        const found = ordersList.find((o) => o.id === orderId) || ordersList[0];
        setOrder(found);
        if (found?.product?.reasons?.length > 0) {
          setReason(found.product.reasons[0]);
        }
      } catch (err) {
        console.error('Failed to load order for refund request:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Initiating RefundShield claim session...</p>
      </div>
    );
  }

  const activeProduct = order?.product || {
    id: 'PROD-006',
    name: 'Artisan Pepperoni Pizza',
    category: 'Food',
    price: 499,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    description: 'Hot wood-fired pizza.',
    currency: 'INR',
    reasons: ['Damaged item', 'Wrong item', 'Spoiled']
  };

  const productReasons = activeProduct.reasons || [
    'Expired product',
    'Past expiry date',
    'Damaged item',
    'Wrong item',
    'Spoiled / Stale',
    'Packaging leak / damage',
    'Missing item',
    'Defective'
  ];

  const handleSubmitRefundClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const claim = await createRefundClaim({
        order_id: order?.id || 'RS-ORD-10482',
        product_id: activeProduct.id,
        reason: reason || productReasons[0],
        description: description || `Claim for ${activeProduct.name} due to ${reason}.`
      });

      navigate(`/capture/${claim.id}`);
    } catch (err) {
      console.error('Error submitting refund claim:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white mb-1">Report a Problem & Request Refund</h1>
        <p className="text-sm text-slate-400">
          Order ID: <span className="font-mono text-cyan-400 font-bold">{order?.id || orderId}</span>
        </p>
      </div>

      <form onSubmit={handleSubmitRefundClaim} className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
        {/* Selected Product Card */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <img
            src={activeProduct.image_url}
            alt={activeProduct.name}
            className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {activeProduct.category}
            </span>
            <h4 className="text-sm font-bold text-white truncate mt-1">{activeProduct.name}</h4>
            <p className="text-xs font-semibold text-cyan-400 mt-0.5">Order Price: ₹{(order?.price || activeProduct.price).toLocaleString()}</p>
          </div>
        </div>

        {/* Step 1: What went wrong? */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <span>1. What went wrong with the {activeProduct.name}?</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {productReasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  reason === r
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
                <span>{r}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>2. Please describe the problem in detail</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Explain specifically what is wrong with the ${activeProduct.name}...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        {/* Step 3: Provide Evidence Trigger */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>3. Provide Evidence (Recommended: Live Camera)</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-2xl font-bold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            <Camera className="w-5 h-5" />
            <span>{isSubmitting ? 'Initializing Camera Session...' : 'OPEN CAMERA FOR EVIDENCE CAPTURE'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
