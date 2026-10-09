import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();

  const [address, setAddress] = useState('42, Green Park Avenue, Flat 3B, New Delhi - 110016');
  const [phone, setPhone] = useState('+91 9876543210');
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay');
  const [isPlacing, setIsPlacing] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 px-4">
        <div className="max-w-md mx-auto text-center card-clean rounded-3xl p-8 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Cart is empty</h2>
          <button onClick={() => navigate('/')} className="text-blue-600 text-xs font-bold underline">
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsPlacing(true);

    try {
      const primaryProduct = cart[0].product;
      const orderPayload = {
        user_id: 'USR-101',
        product_id: primaryProduct.id,
        product: primaryProduct,
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.product.price,
        })),
        price: total,
        currency: 'INR',
        status: 'DELIVERED',
        address: address,
        payment_method: paymentMethod,
        serial_number: `BATCH-${primaryProduct.id.replace('PROD-', '')}-${Math.floor(10000 + Math.random() * 90000)}`
      };

      const createdOrder = await createOrder(orderPayload);
      clearCart();
      navigate(`/support?order_id=${createdOrder.id}`);
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Quick Checkout</h1>
          <p className="text-xs text-slate-500">Guaranteed 12-minute express delivery to your doorstep.</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="card-clean rounded-3xl p-8 space-y-6 bg-white">
          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Delivery Address</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Contact Phone Number</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Select Payment Method (Simulated)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['UPI / GPay', 'Credit / Debit Card', 'Cash on Delivery'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    paymentMethod === m
                      ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Order Summary</span>
            <div className="space-y-1 text-xs text-slate-700">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span className="font-semibold text-slate-900">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPlacing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isPlacing ? 'Placing Order...' : 'Place Order Now'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
