import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, Check, ShoppingCart } from 'lucide-react';
import { getProducts } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const catalog = await getProducts();
        const found = catalog.find((p) => p.id === id);
        if (found) setProduct(found);
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <Link to="/" className="text-cyan-400 text-sm font-semibold underline">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const inCartItem = cart.find((item) => item.product.id === product.id);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <Link to="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store Catalog</span>
      </Link>

      <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 grid md:grid-cols-2 gap-8 items-center">
        {/* Product Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-xs font-semibold text-cyan-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Delivers in {product.delivery_estimate || '12 mins'}</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{product.name}</h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{product.description}</p>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Supported Refund & Return Reasons
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.reasons?.map((r) => (
                <span key={r} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700 flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  <span>{r}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Price</span>
              <span className="text-3xl font-extrabold text-white">₹{product.price.toLocaleString()}</span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`px-6 py-3.5 rounded-2xl text-xs font-bold shadow-xl flex items-center space-x-2 transition-all ${
                isAdded
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white shadow-cyan-500/25 hover:scale-105'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>{inCartItem ? `Add More (${inCartItem.quantity} in cart)` : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
