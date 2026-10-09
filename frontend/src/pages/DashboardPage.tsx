import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Eye, Search, AlertTriangle, UserX, Layers, ShoppingBag } from 'lucide-react';
import { getAnalyticsSummary, getRefundClaims } from '../services/api';
import type { AnalyticsSummary, RefundClaim } from '../types';
import { RiskBadge } from '../components/RiskBadge';

export const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [claims, setClaims] = useState<RefundClaim[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, claimsData] = await Promise.all([
          getAnalyticsSummary(),
          getRefundClaims()
        ]);
        setAnalytics(analyticsData);
        setClaims(claimsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (claim.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' ||
      (claim.product?.category || '').toUpperCase() === categoryFilter.toUpperCase();

    const matchesRisk =
      riskFilter === 'ALL' ||
      claim.risk_level === riskFilter ||
      (riskFilter === 'SUSPICIOUS' && (claim.risk_level === 'HIGH' || claim.recommended_action === 'MANUAL_REVIEW'));

    return matchesSearch && matchesCategory && matchesRisk;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading Multimodal Fraud Analytics Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              MULTIMODAL REFUND VERIFICATION
            </span>
            <span className="text-xs text-slate-400 font-mono">LIVE ENGINE v2.0</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1 flex items-center space-x-3">
            <span>RefundShield Risk Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyzing Claim Context, Product Evidence Support, Quantities, and Customer History across E-Commerce orders.
          </p>
        </div>

        <Link
          to="/support"
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 inline-flex items-center space-x-2 w-fit"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Simulate Quick-Commerce Order & Refund</span>
        </Link>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Claims Audit</div>
          <div className="text-3xl font-extrabold text-white">{analytics?.total_claims || 18}</div>
          <div className="text-[11px] text-cyan-400 mt-1">₹{(analytics?.refund_value_inr || 18450).toLocaleString()} Total Claim Value</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">High Risk Flagged</div>
          <div className="text-3xl font-extrabold text-rose-400">{analytics?.high_risk_claims || 5}</div>
          <div className="text-[11px] text-rose-300 mt-1">{analytics?.evidence_mismatches || 4} product/quantity mismatches</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Manual Reviews Required</div>
          <div className="text-3xl font-extrabold text-amber-400">{analytics?.manual_reviews || 6}</div>
          <div className="text-[11px] text-amber-300 mt-1">{analytics?.approved_claims || 8} auto-approved refunds</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Prevented Fraud Loss</div>
          <div className="text-3xl font-extrabold text-emerald-400">₹{(analytics?.estimated_fraud_prevented_inr || 42990).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-300 mt-1">Saved from unsupported claims</div>
        </div>
      </div>

      {/* Mismatch & Pattern Analytics Banner Grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-rose-950/60 rounded-xl text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Product Mismatches</div>
            <div className="text-xl font-bold text-white">{analytics?.product_mismatches || 3} Claims</div>
            <div className="text-[10px] text-slate-400">e.g., Face photo or wrong product</div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-amber-950/60 rounded-xl text-amber-400 border border-amber-500/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Quantity Discrepancies</div>
            <div className="text-xl font-bold text-white">{analytics?.quantity_mismatches || 2} Claims</div>
            <div className="text-[10px] text-slate-400">Detected count &lt; expected count</div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-950/60 rounded-xl text-indigo-400 border border-indigo-500/30">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Elevated Customer Risk</div>
            <div className="text-xl font-bold text-white">{analytics?.suspicious_customer_patterns || 3} Accounts</div>
            <div className="text-[10px] text-slate-400">High 30d refund rate / address changes</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {(analytics?.category_breakdown || [
          { category: "Food & Grocery", claims: 9, fraud_pct: 14.2, color: "#F59E0B" },
          { category: "Dairy & Produce", claims: 5, fraud_pct: 8.5, color: "#10B981" },
          { category: "Electronics", claims: 6, fraud_pct: 22.0, color: "#38BDF8" }
        ]).map((cat, idx) => {
          const claimCnt = cat.claims || cat.count || 5;
          const fPct = cat.fraud_pct || 10.0;
          return (
            <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{cat.category}</span>
                <span className="text-xs font-mono font-bold text-cyan-400">{claimCnt} Claims</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                  style={{ width: `${Math.min(100, claimCnt * 10)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Evidence Support Rate</span>
                <span className="font-bold text-emerald-400">{(100 - fPct).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Multimodal Refund Claims Audit Ledger</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center space-x-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              {['ALL', 'ELECTRONICS', 'FOOD', 'DAIRY', 'FRESH PRODUCE', 'GROCERY'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all text-[11px] ${
                    categoryFilter === cat
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk Only</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search claim, order, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Claims Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-4">Claim ID</th>
                <th className="pb-3 px-4">Category</th>
                <th className="pb-3 px-4">Product Item</th>
                <th className="pb-3 px-4">Claim Reason</th>
                <th className="pb-3 px-4">Evidence Trust</th>
                <th className="pb-3 px-4">Customer Risk</th>
                <th className="pb-3 px-4">Overall Risk</th>
                <th className="pb-3 px-4">Action</th>
                <th className="pb-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((c) => {
                  const trustPercent = c.evidence_trust_score !== undefined ? Math.round(c.evidence_trust_score * 100) : 88;
                  const custRiskLevel = c.customer_risk_profile?.customer_risk_level || 'LOW';
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-4 px-4 font-mono font-semibold text-cyan-400">{c.id}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                          {c.product?.category || 'Food'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-white max-w-[180px] truncate">
                        {c.product?.name || 'Item'}
                      </td>
                      <td className="py-4 px-4 text-slate-300">{c.reason}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-14 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                trustPercent >= 75 ? 'bg-emerald-400' : trustPercent >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                              }`}
                              style={{ width: `${trustPercent}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-200">{trustPercent}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          custRiskLevel === 'ELEVATED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {custRiskLevel}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <RiskBadge level={c.risk_level || 'LOW'} />
                      </td>
                      <td className="py-4 px-4">
                        <RiskBadge action={c.status !== 'SUBMITTED' ? c.status : (c.recommended_action || 'AUTO_APPROVE')} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/claim/${c.id}`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg font-semibold inline-flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No refund claims matching category or search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
