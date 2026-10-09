import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, AlertCircle, FileText, Filter, Tag } from 'lucide-react';
import { getOrders, createRefundClaim } from '../services/api';
import type { Order } from '../types';

export const RefundRequestPage: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
        if (data.length > 0) {
          setSelectedOrder(data[0]);
          if (data[0].product?.reasons?.length > 0) {
            setReason(data[0].product.reasons[0]);
          } else {
            setReason('Damaged product');
          }
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrdersData();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (selectedCategory === 'ALL') return true;
    return o.product?.category?.toUpperCase() === selectedCategory.toUpperCase();
  });

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const available = orders.filter(
      (o) => cat === 'ALL' || o.product?.category?.toUpperCase() === cat.toUpperCase()
    );
    if (available.length > 0) {
      setSelectedOrder(available[0]);
      if (available[0].product?.reasons?.length > 0) {
        setReason(available[0].product.reasons[0]);
      }
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = orders.find((o) => o.id === e.target.value);
    if (found) {
      setSelectedOrder(found);
      const availableReasons = found.product?.reasons || ['Damaged product', 'Defective', 'Wrong product'];
      setReason(availableReasons[0]);
    }
  };

  // Dynamic refund reasons for selected product
  const currentReasons = selectedOrder?.product?.reasons || [
    'Damaged product',
    'Wrong product',
    'Defective product',
    'Expired product',
    'Other'
  ];

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      const claim = await createRefundClaim({
        order_id: selectedOrder.id,
        product_id: selectedOrder.product_id,
        reason: reason || currentReasons[0],
        description: description || `Claim for ${selectedOrder.product.name} due to ${reason}.`
      });
      navigate(`/capture?claim_id=${claim.id}`);
    } catch (err) {
      console.error('Error creating refund claim:', err);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 space-y-4">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading eligible e-commerce catalog orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white mb-2">Request a Refund</h1>
        <p className="text-sm text-slate-400">
          Select your delivered order across Electronics, Food, or Grocery categories.
        </p>
      </div>

      <form onSubmit={handleSubmitRefund} className="space-y-6 glass-card rounded-3xl p-8 border border-slate-800">
        {/* Category Filter Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Select Product Category</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['ALL', 'ELECTRONICS', 'FOOD', 'GROCERY'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1: Select Delivered Order */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span>1. Select Delivered Order</span>
          </label>
          <select
            value={selectedOrder?.id || ''}
            onChange={handleOrderChange}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {filteredOrders.map((o) => (
              <option key={o.id} value={o.id}>
                [{o.product.category}] {o.id} — {o.product.name} (₹{o.price.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Product Details Card */}
        {selectedOrder && (
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center space-x-4">
            <img
              src={selectedOrder.product.image_url}
              alt={selectedOrder.product.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {selectedOrder.product.category}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-1">{selectedOrder.product.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{selectedOrder.product.description}</p>
              <p className="text-xs font-semibold text-cyan-400 mt-1">Order Price: ₹{selectedOrder.price.toLocaleString()}</p>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold shrink-0">
              Delivered
            </div>
          </div>
        )}

        {/* Step 2: Dynamic Category-Aware Refund Reasons */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <span>2. Dynamic Refund Reasons for {selectedOrder?.product.name}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {currentReasons.map((r) => (
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

        {/* Step 3: Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>3. Describe Defect / Damage / Quality Issue</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Describe specifically what is wrong with the ${selectedOrder?.product.name || 'item'}...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        {/* Action */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedOrder}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-2xl font-bold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
        >
          <span>{isSubmitting ? 'Creating Refund Claim...' : 'Proceed to Camera Evidence Capture'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
