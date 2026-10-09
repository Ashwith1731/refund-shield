import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, HelpCircle, ShoppingBag, Eye } from 'lucide-react';
import { getOrders } from '../services/api';
import type { Order } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const orderId = id || 'RS-ORD-10482';

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const ordersList = await getOrders();
        setOrders(ordersList);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 text-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Loading delivered orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <span>My Delivered Orders</span>
          </h1>
          <span className="text-xs text-slate-500 font-mono font-medium">{orders.length} Orders</span>
        </div>

        {/* Orders Cards List */}
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card-clean rounded-2xl p-6 bg-white space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-extrabold text-slate-900">Order #{o.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Delivered</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Delivered today · 6:42 PM</p>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 block">₹{o.price.toLocaleString()}</span>
                  <span className="text-[11px] text-blue-600 font-bold">UPI / Express Delivery</span>
                </div>
              </div>

              {/* Items List */}
              <div className="flex items-center space-x-4">
                <img
                  src={o.product.image_url}
                  alt={o.product.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{o.product.category}</span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{o.product.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">1 × Item • ₹{o.product.price.toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/orders/${o.id}`)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => navigate(`/support?order_id=${o.id}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Get Help</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
