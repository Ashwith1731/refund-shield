import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Quick-Commerce Customer Pages
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerSupportPage } from './pages/CustomerSupportPage';
import { CustomerRefundFlowPage } from './pages/CustomerRefundFlowPage';
import { EvidenceCapturePage } from './pages/EvidenceCapturePage';

// Admin / RefundShield Trust Layer Pages
import { DashboardPage } from './pages/DashboardPage';
import { ClaimDetailsPage } from './pages/ClaimDetailsPage';
import { ParadoxDemoPage } from './pages/ParadoxDemoPage';
import { ScenariosPage } from './pages/ScenariosPage';

export const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Customer Quick-Commerce App Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<HomePage />} />
              <Route path="/category/:category" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<CustomerSupportPage />} />
              <Route path="/orders/:id" element={<OrderTrackingPage />} />
              <Route path="/support" element={<CustomerSupportPage />} />
              <Route path="/support/:orderId" element={<CustomerSupportPage />} />
              <Route path="/refund/:orderId" element={<CustomerRefundFlowPage />} />
              <Route path="/capture" element={<EvidenceCapturePage />} />
              <Route path="/capture/:claimId" element={<EvidenceCapturePage />} />

              {/* Admin / RefundShield Trust Layer Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/claims" element={<DashboardPage />} />
              <Route path="/claims/:id" element={<ClaimDetailsPage />} />
              <Route path="/claim/:id" element={<ClaimDetailsPage />} />
              <Route path="/reviews" element={<DashboardPage />} />
              <Route path="/analytics" element={<DashboardPage />} />
              <Route path="/demo/paradox" element={<ParadoxDemoPage />} />
              <Route path="/demo/scenarios" element={<ScenariosPage />} />
              <Route path="/scenarios" element={<ScenariosPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
