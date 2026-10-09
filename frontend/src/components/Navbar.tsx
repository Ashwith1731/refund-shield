import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShoppingCart, ShoppingBag, MessageSquare, Search, MapPin, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = React.useState('');

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isDarkAdminPage = ['/dashboard', '/claim/', '/scenarios', '/paradox'].some(path => location.pathname.startsWith(path));

  return (
    <header className={`sticky top-0 z-50 transition-colors ${
      isDarkAdminPage 
        ? 'bg-slate-950 border-b border-slate-800 text-slate-100' 
        : 'bg-white border-b border-slate-200 text-slate-900 shadow-xs'
    }`}>
      {/* Top Banner */}
      <div className={`text-[11px] py-1.5 px-4 border-b font-medium text-center flex items-center justify-center space-x-2 ${
        isDarkAdminPage
          ? 'bg-slate-900 border-slate-800 text-cyan-400'
          : 'bg-blue-50/80 border-blue-100 text-blue-900'
      }`}>
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span><strong>RefundShield Active:</strong> Shop Safe. Get Fair. Real-time evidence verification for quick refunds.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center space-x-5">
            <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className={`text-lg font-extrabold tracking-tight ${isDarkAdminPage ? 'text-white' : 'text-slate-900'}`}>
                    Refund<span className="text-blue-600">Shield</span>
                  </span>
                </div>
                <span className="block text-[10px] text-slate-400 font-medium leading-none">
                  Shop Safe. Get Fair.
                </span>
              </div>
            </Link>

            {/* Location Selector */}
            <div className={`hidden lg:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-xl border ${
              isDarkAdminPage ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold block text-[10px]">Delivering to</span>
                <span className="text-slate-500 truncate max-w-[130px] block text-[10px]">Green Park, New Delhi</span>
              </div>
            </div>
          </div>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for eggs, milk, pizza, earbuds, smartphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-4 py-2 text-xs transition-all focus:outline-none focus:ring-2 ${
                  isDarkAdminPage
                    ? 'bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-blue-500'
                    : 'bg-slate-100/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-blue-600'
                }`}
              />
            </div>
          </form>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1.5">
            <Link
              to="/orders"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                location.pathname.startsWith('/orders')
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : isDarkAdminPage ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </Link>

            <Link
              to="/support"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                location.pathname.startsWith('/support')
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : isDarkAdminPage ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
            </Link>

            <Link
              to="/cart"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all relative ${
                location.pathname === '/cart'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : isDarkAdminPage ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Trust Dashboard Link */}
            <Link
              to="/dashboard"
              className={`ml-2 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
                isDarkAdminPage
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              <span>Trust Dashboard</span>
            </Link>
          </nav>

        </div>
      </div>
    </header>
  );
};
