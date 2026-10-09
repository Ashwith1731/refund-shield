import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, subtotal, deliveryFee, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 px-4">
        <div className="max-w-md mx-auto text-center card-clean rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Add fresh groceries, food, or electronics to get 12-minute delivery.</p>
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-block shadow-sm transition-all"
          >
            Explore Store Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <span>Shopping Cart ({cart.length} items)</span>
          </h1>
          <Link to="/" className="text-xs text-blue-600 font-bold hover:underline">
            + Add more items
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Left Column: Cart Items List */}
          <div className="md:col-span-2 space-y-3">
            {cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="card-clean rounded-2xl p-4 flex items-center justify-between gap-4 bg-white"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">₹{product.price.toLocaleString()} each</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="p-1 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-900 px-2">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="p-1 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 block">
                    ₹{(product.price * quantity).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold mt-1 inline-flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="card-clean rounded-3xl p-6 space-y-6 h-fit bg-white">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bill Summary</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Item Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge (12 mins)</span>
                <span className="font-semibold text-emerald-600">₹{deliveryFee}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                <span>To Pay</span>
                <span className="text-blue-600">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Protected by RefundShield 100% Fair Guarantee</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
