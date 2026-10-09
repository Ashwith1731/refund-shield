import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  MessageSquare, ShoppingBag, ShieldCheck, Send, Bot, Upload, Camera, 
  Home, RefreshCw, User, ChevronRight, FileText, AlertCircle, X, CheckCircle2 
} from 'lucide-react';
import { getOrders, createRefundClaim } from '../services/api';
import type { Order } from '../types';

interface ExtractedClaim {
  productName: string;
  orderedQty: number;
  affectedQty: number;
  issue: string;
  evidenceRequired: boolean;
  explanation: string;
}

export const CustomerSupportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedOrderId = searchParams.get('order_id');

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Chat & Evidence State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; image?: string }>>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [extractedClaim, setExtractedClaim] = useState<ExtractedClaim | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [showInlineUpload, setShowInlineUpload] = useState<boolean>(false);
  const [stagedImage, setStagedImage] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isProcessing, showInlineUpload]);

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
        if (data.length > 0) {
          const match = preselectedOrderId ? data.find(o => o.id === preselectedOrderId) : data[0];
          const initial = match || data[0];
          setSelectedOrder(initial);
          initChatForOrder(initial);
        }
      } catch (err) {
        console.error('Failed to load orders for support:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrdersData();
  }, []);

  const initChatForOrder = (order: Order) => {
    setExtractedClaim(null);
    setActiveClaimId(null);
    setShowInlineUpload(false);
    setStagedImage(null);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages([
      {
        sender: 'bot',
        text: `Hello! I'm your RefundShield Support Assistant. I see you're inquiring about Order #${order.id} (${order.product.name}). What issue occurred with your delivery today?`,
        time: timeNow
      }
    ]);
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    initChatForOrder(order);
  };

  const processCustomerMessage = async (messageText: string) => {
    if (!selectedOrder) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: messageText, time: timeStr }]);
    setUserInput('');
    setIsProcessing(true);

    setTimeout(async () => {
      const lower = messageText.toLowerCase();
      let affectedQty = 1;
      let issue = "Damaged Item";
      let evidenceReq = true;
      let explanation = "Visual evidence verification helps process your refund automatically.";

      if (lower.includes("expir") || lower.includes("date") || lower.includes("old") || lower.includes("past")) {
        issue = "Expired / Past Expiry Product";
        evidenceReq = true;
        explanation = "Photo evidence showing the printed expiry date or product batch label helps verify your refund claim.";
      } else if (lower.includes("leak") || lower.includes("torn") || lower.includes("packag")) {
        issue = "Packaging Damaged / Leaked";
        evidenceReq = true;
        explanation = "Photo evidence showing the damaged container or outer packaging verifies your claim.";
      } else if (lower.includes("twice") || lower.includes("double") || lower.includes("charged") || lower.includes("payment")) {
        issue = "Payment / Double Charge";
        evidenceReq = false;
        explanation = "Payment discrepancies are verified using transaction records and do not require photo evidence.";
      } else if (lower.includes("2") || lower.includes("two")) {
        affectedQty = 2;
        issue = lower.includes("egg") ? "2 Broken Eggs" : "Damaged Items (2 units)";
      } else if (lower.includes("wrong") || lower.includes("chocolate") || lower.includes("juice")) {
        issue = "Wrong Product Item Delivered";
      } else if (lower.includes("quality") || lower.includes("spoiled") || lower.includes("taste") || lower.includes("stale")) {
        issue = "Poor Quality / Spoiled Item";
      } else if (lower.includes("missing")) {
        issue = "Missing Item from Order";
      }

      const extracted: ExtractedClaim = {
        productName: selectedOrder.product.name,
        orderedQty: selectedOrder.product.quantity || 1,
        affectedQty: affectedQty,
        issue: issue,
        evidenceRequired: evidenceReq,
        explanation: explanation
      };

      setExtractedClaim(extracted);

      try {
        const createdClaim = await createRefundClaim({
          order_id: selectedOrder.id,
          product_id: selectedOrder.product_id,
          reason: issue,
          description: messageText
        });
        setActiveClaimId(createdClaim.id);

        if (!evidenceReq) {
          // Payment issue -> Auto credit without photo
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `I've checked your account and transaction details. ${explanation} Your refund of ₹${selectedOrder.price} for Order #${selectedOrder.id} has been approved and processed back to your original payment method!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          // Visual evidence required -> Present upload options
          setShowInlineUpload(true);
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `I understand your concern regarding ${selectedOrder.product.name}. Please upload a clear photo showing the item and its condition. RefundShield AI will verify your evidence instantly.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to create claim:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;
    processCustomerMessage(userInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (userInput.trim() && !isProcessing) {
        processCustomerMessage(userInput.trim());
      }
    }
  };

  const handleQuickIssueClick = (issueText: string) => {
    if (isProcessing) return;
    processCustomerMessage(`I have an issue: ${issueText} with my order.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStagedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUploadedImage = () => {
    if (!stagedImage || !activeClaimId) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    sessionStorage.setItem('refundshield_staged_image', stagedImage);

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: "Uploaded photo evidence:", image: stagedImage, time: timeStr },
      { sender: 'bot', text: "RefundShield AI is analyzing your submitted evidence...", time: timeStr }
    ]);

    setShowInlineUpload(false);
    
    setTimeout(() => {
      navigate(`/capture?claim_id=${activeClaimId}`, { state: { imageBase64: stagedImage, autoAnalyze: true } });
    }, 600);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-5">
        
        {/* Top Page Header Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 mb-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span>RefundShield Intelligent Support System</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Customer Support & Refund Assistance
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Support Active</span>
            </span>
          </div>
        </div>

        {/* 3-COLUMN DESKTOP LAYOUT (Left 250px | Main 680px | Right 300px) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1 — LEFT NAVIGATION & RECENT ORDERS (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            
            {/* Primary Sidebar Navigation */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-1">
              <Link to="/" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <Home className="w-4 h-4 text-slate-400" />
                <span>Home</span>
              </Link>
              <Link to="/" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                <span>Store</span>
              </Link>
              <Link to="/orders" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>My Orders</span>
              </Link>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Customer Support</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
              <Link to="/orders" className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>Returns & Refunds</span>
              </Link>
              <div className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer">
                <User className="w-4 h-4 text-slate-400" />
                <span>Profile</span>
              </div>
            </div>

            {/* Compact Recent Orders Section */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Orders</h3>
                <span className="text-[10px] text-slate-400 font-semibold">{orders.length} Orders</span>
              </div>

              {isLoading ? (
                <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Loading orders...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {orders.map((o) => {
                    const isSelected = selectedOrder?.id === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => handleOrderSelect(o)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center space-x-3 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-200 text-slate-900 ring-1 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={o.product.image_url}
                          alt={o.product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1 leading-tight">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[11px] font-bold text-slate-900 truncate">#{o.id}</span>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                              Delivered
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5" title={o.product.name}>
                            {o.product.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            ₹{o.price.toLocaleString()} • Delivered Today
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* COLUMN 2 — CENTER MAIN CONVERSATION PANEL (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[680px]">
              
              {/* Support Conversation Header */}
              <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-extrabold text-slate-900">RefundShield Support</h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Assistant Online" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Order <strong className="font-mono text-slate-700">#{selectedOrder?.id || 'RS-ORD-10482'}</strong> • {selectedOrder?.product.name}
                    </p>
                  </div>
                </div>

                {selectedOrder && (
                  <button
                    type="button"
                    onClick={() => navigate(`/orders`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <span>View Order</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Chat Conversation Messages Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40 text-xs">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 space-y-2 rounded-2xl ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                      }`}
                    >
                      <p className="leading-relaxed text-xs whitespace-pre-wrap">{m.text}</p>
                      
                      {m.image && (
                        <div className="rounded-xl overflow-hidden border border-white/20 mt-2 bg-slate-900">
                          <img src={m.image} alt="Uploaded evidence" className="w-full max-h-52 object-contain" />
                        </div>
                      )}

                      <span className={`text-[9px] block text-right font-medium ${m.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                ))}

                {/* INLINE EVIDENCE UPLOAD CARD */}
                {showInlineUpload && (
                  <div className="p-4 bg-white border border-blue-200 rounded-2xl shadow-sm space-y-3.5 my-2 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>Photo Evidence Verification Required</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Please provide a photo of {selectedOrder?.product.name} to complete your refund claim.
                        </p>
                      </div>
                    </div>

                    {stagedImage ? (
                      <div className="space-y-3">
                        <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                          <img src={stagedImage} alt="Staged Preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setStagedImage(null)}
                            className="absolute top-2 right-2 p-1 bg-slate-900/80 text-white rounded-full hover:bg-slate-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleSubmitUploadedImage}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Submit Photo for Instant AI Analysis →</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <label className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-all">
                            <Upload className="w-4 h-4" />
                            <span>Choose Photo (Upload)</span>
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>

                          <button
                            type="button"
                            onClick={() => setStagedImage('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80')}
                            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 flex items-center justify-center space-x-1.5 transition-all"
                          >
                            <Camera className="w-4 h-4 text-slate-500" />
                            <span>Take Photo (Camera)</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">Supported formats: JPG, PNG, WEBP (Max 10MB)</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Extracted Claim Summary Pill */}
                {extractedClaim && (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-[11px] text-blue-950 font-medium flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Parsed Category: <strong>{extractedClaim.issue}</strong> ({extractedClaim.productName})</span>
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">READY</span>
                  </div>
                )}

                {/* Typing Indicator */}
                {isProcessing && (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs italic py-1">
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>RefundShield Support Assistant is thinking...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Suggested Issue Chips */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center space-x-2 overflow-x-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Common Issues:</span>
                {[
                  "Expired product",
                  "Past expiry date",
                  "Damaged item",
                  "Wrong item",
                  "Missing item",
                  "Spoiled / Stale",
                  "Packaging leak",
                  "Poor quality",
                  "Quantity mismatch",
                  "Charged twice"
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickIssueClick(chip)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 whitespace-nowrap transition-all shrink-0 shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message Composer Area */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-end space-x-2">
                <textarea
                  rows={1}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message about your order... (Enter to send, Shift+Enter for new line)"
                  className="flex-1 bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 resize-none max-h-24"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || isProcessing}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-xs shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>

          {/* COLUMN 3 — RIGHT SIDEBAR ORDER DETAILS & CONTEXT (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            
            {/* Selected Order Details Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Summary</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Delivered
                </span>
              </div>

              {selectedOrder && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-start space-x-3">
                    <img
                      src={selectedOrder.product.image_url}
                      alt={selectedOrder.product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 leading-snug">{selectedOrder.product.name}</h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Qty: {selectedOrder.product.quantity || 1} • ₹{selectedOrder.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Order Reference</span>
                      <span className="font-mono font-bold text-slate-900">#{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Order Date</span>
                      <span className="font-medium text-slate-800">Oct 8, 2026</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Delivery Address</span>
                      <span className="font-medium text-slate-800 truncate max-w-[130px]">Green Park, New Delhi</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Payment Method</span>
                      <span className="font-medium text-slate-800">UPI / Credit Card</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/orders`)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-[11px] flex items-center justify-center space-x-1 transition-colors"
                  >
                    <span>View Full Order History</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Contextual Support Actions Panel */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contextual Actions</h3>

              {extractedClaim ? (
                <div className="space-y-3 text-xs">
                  <div className={`p-3 rounded-xl border ${
                    extractedClaim.evidenceRequired 
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900' 
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="font-bold flex items-center space-x-1.5">
                      {extractedClaim.evidenceRequired ? (
                        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span>{extractedClaim.issue}</span>
                    </div>
                    <p className="text-[11px] mt-1 text-slate-600 leading-relaxed">{extractedClaim.explanation}</p>
                  </div>

                  {extractedClaim.evidenceRequired ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/capture?claim_id=${activeClaimId || 'CLM-1001'}`)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Proceed to Evidence Upload →</span>
                    </button>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-medium text-center">
                      ✓ Instant refund credited without photo evidence
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Select an issue from above or type your query in the chat to start automated refund processing.
                  </p>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold block text-slate-800">💡 RefundShield Guarantee:</span>
                    <span>AI evidence analysis processes photo claims in under 3 seconds.</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
