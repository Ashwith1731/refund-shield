import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Plus, Check, Clock, Minus } from 'lucide-react';
import { getProducts } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

export const HomePage: React.FC = () => {
  const { addToCart, updateQuantity, cart } = useCart();
  const [searchParams] = useSearchParams();

  const queryFromUrl = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Items', icon: '🛒' },
    { id: 'FOOD', label: 'Food & Meals', icon: '🍕' },
    { id: 'DAIRY', label: 'Dairy & Eggs', icon: '🥛' },
    { id: 'FRESH PRODUCE', label: 'Fresh Fruits & Veg', icon: '🍎' },
    { id: 'GROCERY', label: 'Staples & Snacks', icon: '📦' },
    { id: 'ELECTRONICS', label: 'Electronics', icon: '📱' },
  ];

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1000);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'ALL' || p.category.toUpperCase() === selectedCat.toUpperCase();
    const matchesQuery = !queryFromUrl || p.name.toLowerCase().includes(queryFromUrl.toLowerCase()) || p.description.toLowerCase().includes(queryFromUrl.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Quick-Commerce Banner Section */}
        <section className="card-clean rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>DELIVERING IN 12 MINUTES</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Fresh Food, Grocery & Electronics
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
              Instant quick-commerce delivery backed by <strong>RefundShield</strong> automated fair refund guarantee.
            </p>

            <div className="flex items-center space-x-3 pt-1">
              <div className="flex items-center space-x-1.5 text-xs text-blue-900 font-bold bg-white px-3 py-1.5 rounded-xl shadow-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Shop Safe. Get Fair. Guarantee</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter Pills */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Browse Categories</h3>
            <span className="text-xs text-slate-500 font-mono font-medium">{filteredProducts.length} items</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 border ${
                  selectedCat === cat.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading catalog items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product) => {
                const inCartItem = cart.find((item) => item.product.id === product.id);
                const isAdded = addedId === product.id;
                const originalPrice = Math.round(product.price * 1.2);

                return (
                  <div
                    key={product.id}
                    className="card-clean card-clean-hover rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-white"
                  >
                    <div className="space-y-2">
                      {/* Image Container */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md rounded-md text-[9px] font-bold text-white flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span>12 mins</span>
                        </div>
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-extrabold uppercase">
                          20% OFF
                        </div>
                      </div>

                      {/* Category Tag */}
                      <span className="inline-block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {product.category}
                      </span>

                      {/* Title */}
                      <Link to={`/product/${product.id}`} className="block">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                          {product.description}
                        </p>
                      </Link>
                    </div>

                    {/* Price & Add to Cart Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">₹{product.price.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 line-through">₹{originalPrice.toLocaleString()}</div>
                      </div>

                      {inCartItem ? (
                        <div className="flex items-center space-x-1.5 bg-blue-50 border border-blue-200 rounded-xl px-2 py-1 text-xs font-bold text-blue-700">
                          <button
                            onClick={() => updateQuantity(product.id, inCartItem.quantity - 1)}
                            className="p-0.5 hover:bg-blue-100 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1">{inCartItem.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, inCartItem.quantity + 1)}
                            className="p-0.5 hover:bg-blue-100 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                            isAdded
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>ADD</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
