import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CameraCapture } from '../components/CameraCapture';
import { analyzeEvidence } from '../services/api';
import type { AnalysisResult } from '../types';
import { ShieldCheck, CheckCircle, Eye, AlertCircle, RefreshCw, Upload, X, ArrowLeft, Camera } from 'lucide-react';

export const EvidenceCapturePage: React.FC = () => {
  const { claimId: paramClaimId } = useParams<{ claimId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const claimId = paramClaimId || searchParams.get('claim_id') || 'CLM-1001';

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [demoScenario] = useState<string | null>(null);
  const [captureMethod, setCaptureMethod] = useState<string>('file_upload');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);

  const base64ToBlob = (base64Data: string): Blob => {
    try {
      if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
        return new Blob([], { type: 'image/jpeg' });
      }
      const parts = base64Data.split(';base64,');
      const contentType = (parts[0] && parts[0].includes('data:')) ? parts[0].replace('data:', '') : 'image/jpeg';
      const raw = window.atob(parts[1] || parts[0]);
      const uInt8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    } catch (e) {
      return new Blob([], { type: 'image/jpeg' });
    }
  };

  const executeAnalysis = async (imgB64: string, methodOverride?: string) => {
    setIsAnalyzing(true);
    setError(null);

    const activeMethod = methodOverride || captureMethod;

    const formData = new FormData();
    formData.append('claim_id', claimId);
    formData.append('capture_method', activeMethod);
    if (demoScenario) {
      formData.append('demo_scenario', demoScenario);
    }

    if (imgB64.startsWith('http://') || imgB64.startsWith('https://')) {
      formData.append('image_base64', imgB64);
    } else {
      const imageBlob = base64ToBlob(imgB64);
      if (imageBlob.size > 0) {
        formData.append('file', imageBlob, 'evidence_photo.jpg');
      } else {
        formData.append('image_base64', imgB64);
      }
    }

    try {
      const result = await analyzeEvidence(formData);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Evidence analysis error:', err);
      setError('Failed to analyze evidence. Please ensure backend service is active.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setCapturedImage(null);
    setError(null);
    setShowCamera(false);
    sessionStorage.removeItem('refundshield_staged_image');
    navigate(location.pathname + location.search, { replace: true, state: {} });
  };

  useEffect(() => {
    const stateObj = location.state as any;
    if (stateObj?.autoAnalyze && (stateObj?.imageBase64 || sessionStorage.getItem('refundshield_staged_image'))) {
      const passedImage = stateObj.imageBase64 || sessionStorage.getItem('refundshield_staged_image');
      sessionStorage.removeItem('refundshield_staged_image');
      
      navigate(location.pathname + location.search, { replace: true, state: {} });

      if (passedImage) {
        setCapturedImage(passedImage);
        executeAnalysis(passedImage, 'file_upload');
      }
    } else {
      sessionStorage.removeItem('refundshield_staged_image');
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setCaptureMethod('file_upload');
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (base64Image: string) => {
    setCapturedImage(base64Image);
    setCaptureMethod('browser_camera');
    setShowCamera(false);
  };

  const handleAnalyzeSubmission = async () => {
    if (!capturedImage) {
      setError("Please select an image file or take a photo before submitting.");
      return;
    }
    executeAnalysis(capturedImage);
  };

  const isApproved = analysisResult?.recommended_action === 'AUTO_APPROVE' || analysisResult?.recommended_action === 'APPROVE_REFUND' || analysisResult?.risk_level === 'LOW';
  const isAiDetected = (analysisResult?.ai_generation_score || 0) >= 0.50 || (analysisResult?.manipulation_score || 0) >= 0.50;
  const isFlaggedForAudit = analysisResult?.recommended_action === 'MANUAL_REVIEW' || analysisResult?.risk_level === 'HIGH' || isAiDetected;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={() => navigate('/support')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Support</span>
          </button>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>RefundShield AI Verification</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Submit Photo Evidence</h1>
          <p className="text-xs text-slate-500">
            Claim Reference: <span className="font-mono text-slate-900 font-bold">#{claimId}</span>
          </p>
        </div>

        {/* LOADING ANALYSIS VIEW */}
        {isAnalyzing ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center space-y-6 max-w-lg mx-auto animate-fadeIn">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                <span>Analyzing Submitted Evidence</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Verifying Photo Authenticity</h3>
              <p className="text-xs text-slate-500">RefundShield AI is processing your submitted photo evidence...</p>
            </div>

            {capturedImage && (
              <div className="relative aspect-video max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-md bg-slate-900">
                <img src={capturedImage} alt="Submitted Evidence" className="w-full h-full object-contain opacity-90" />
                <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin shadow-lg" />
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs text-slate-600 max-w-sm mx-auto">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Live Multimodal Verification Pipeline:</span>
              </div>
              <div className="space-y-1 pl-6 text-[11px]">
                <div className="flex items-center space-x-2 text-emerald-600 font-medium">
                  <span>✓ Photo received & decoded</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 font-medium animate-pulse">
                  <span>⟳ Analyzing product visual features...</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 font-medium animate-pulse">
                  <span>⟳ Running AI image forensics & claim verification...</span>
                </div>
              </div>
            </div>
          </div>
        ) : !analysisResult ? (
          /* EVIDENCE DROP ZONE & PREVIEW FORM */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            
            {showCamera ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900">Live Camera Capture</h3>
                  <button
                    type="button"
                    onClick={() => setShowCamera(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Cancel Camera
                  </button>
                </div>
                <CameraCapture onCapture={handleCameraCapture} />
              </div>
            ) : capturedImage ? (
              /* IMAGE PREVIEW CARD WITH REMOVE/REPLACE CONTROLS */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-700">Selected Photo Evidence:</span>
                  <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove Photo</span>
                  </button>
                </div>

                <div className="relative aspect-video max-h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                  <img src={capturedImage} alt="Captured evidence preview" className="w-full h-full object-contain" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeSubmission}
                    disabled={isAnalyzing}
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Submit Evidence for Instant Verification</span>
                  </button>

                  <label className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                    <span>Choose Different Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              /* DROPZONE & BUTTON SELECTION */
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Upload Photo Evidence</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Drag & drop your item photo here or choose a file from your device.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <label className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span>Choose Photo (Primary)</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 flex items-center justify-center space-x-2 transition-all"
                    >
                      <Camera className="w-4 h-4 text-slate-500" />
                      <span>Use Camera (Optional)</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400">Supported Formats: JPG, PNG, WEBP (Max File Size 10MB)</p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-medium">
                    {error}
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          /* RESULT STATES (Approved | More Evidence | Manual Review) */
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 space-y-6 shadow-xs animate-fadeIn">
            {isApproved ? (
              /* STATE A: APPROVED */
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Refund Verification Complete</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">✓ Your order was verified</h2>
                  <h3 className="text-xl font-extrabold text-blue-600 mt-2">Refund Approved</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    The refund amount will be credited back to your original payment method.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2.5 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block border-b border-slate-200 pb-2 uppercase text-[10px] tracking-wider">Evidence Analysis Signals:</span>
                  
                  <div className="flex items-center space-x-2">
                    <span className={(analysisResult.product_match_score || 0) >= 0.7 ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                      {(analysisResult.product_match_score || 0) >= 0.7 ? "✓" : "✗"}
                    </span>
                    <span>
                      {(analysisResult.product_match_score || 0) >= 0.7
                        ? `Product matches your order (${analysisResult.object_detection?.primary_object || 'Verified'})`
                        : `Product mismatch (${analysisResult.object_detection?.primary_object || 'Unidentified'} detected)`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={(analysisResult.object_counting?.count_match_score || 1) >= 0.8 ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                      {(analysisResult.object_counting?.count_match_score || 1) >= 0.8 ? "✓" : "⚠"}
                    </span>
                    <span>
                      {(analysisResult.object_counting?.count_match_score || 1) >= 0.8
                        ? "Quantity is consistent with order"
                        : "Quantity discrepancy detected"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={(analysisResult.damage_score || 0) >= 0.6 ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                      {(analysisResult.damage_score || 0) >= 0.6 ? "✓" : "⚠"}
                    </span>
                    <span>
                      {(analysisResult.damage_score || 0) >= 0.6
                        ? "Damage / quality issue is visible"
                        : "Damage / quality issue could not be clearly verified"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={(analysisResult.claim_consistency_score || 0) >= 0.7 ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                      {(analysisResult.claim_consistency_score || 0) >= 0.7 ? "✓" : "⚠"}
                    </span>
                    <span>
                      {(analysisResult.claim_consistency_score || 0) >= 0.7
                        ? "Claim matches evidence"
                        : "Claim-evidence consistency is low"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={(analysisResult.ai_generation_score || 0) < 0.5 && (analysisResult.manipulation_score || 0) < 0.5 ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                      {(analysisResult.ai_generation_score || 0) < 0.5 && (analysisResult.manipulation_score || 0) < 0.5 ? "✓" : "⚠"}
                    </span>
                    <span>
                      {(analysisResult.ai_generation_score || 0) < 0.5 && (analysisResult.manipulation_score || 0) < 0.5
                        ? "Photo authenticity verified"
                        : "Possible AI-generated or manipulated content"}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  Reference ID: RF-2026-{analysisResult.claim_id}
                </div>
              </div>
            ) : isFlaggedForAudit ? (
              /* STATE B: MANUAL REVIEW / TECHNICAL AUDIT */
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
                  <AlertCircle className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
                    {isAiDetected ? "AI GENERATION RISK DETECTED" : "VERIFICATION FLAGGED — TECHNICAL AUDIT"}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Under Technical Audit Review</h2>
                  <p className="text-xs text-slate-600 font-medium mt-1 max-w-md mx-auto">
                    {isAiDetected
                      ? "Your evidence photo was flagged for synthetic AI generation / digital manipulation risk. It has been routed to our technical audit team for manual review."
                      : (analysisResult.reasons?.[0] || "Your claim requires manual verification by our technical audit team.")}
                  </p>
                </div>

                <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-2xl text-left max-w-md mx-auto space-y-2 text-xs text-slate-800">
                  <div className="flex items-center justify-between border-b border-rose-200/80 pb-2 mb-2">
                    <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Audit Security Signals:</span>
                    <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded">
                      Risk: {analysisResult.risk_level} ({Math.round((analysisResult.risk_score || 0) * 100)}%)
                    </span>
                  </div>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span>AI Generation Risk:</span>
                      <span className="font-bold text-rose-700">{Math.round((analysisResult.ai_generation_score || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manipulation Anomaly:</span>
                      <span className="font-bold text-rose-700">{Math.round((analysisResult.manipulation_score || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Detected Content:</span>
                      <span className="font-bold">{analysisResult.object_detection?.primary_object || 'Unidentified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* STATE C: MORE EVIDENCE REQUIRED */
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
                  <AlertCircle className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Additional Verification Required</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">We need one more photo</h2>
                  <p className="text-xs text-slate-600 font-medium mt-1 max-w-md mx-auto">
                    {analysisResult.reasons?.[0] || "We couldn't clearly verify the issue from the submitted image."}
                  </p>
                </div>

                <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl text-left max-w-md mx-auto space-y-2 text-xs text-slate-800">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 mb-2">
                    <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Image Analysis Summary:</span>
                    <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded">
                      Detected: {analysisResult.object_detection?.primary_object || 'Unidentified'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span>Product Match:</span>
                      <span className="font-bold">{Math.round((analysisResult.product_match_score || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Damage Verification:</span>
                      <span className="font-bold capitalize">{analysisResult.damage_status?.toLowerCase() || 'unverified'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Upload Another Photo</span>
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Back to My Orders
              </button>

              <button
                type="button"
                onClick={() => navigate(`/claim/${analysisResult.claim_id}`)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Technical Audit Trail (Admin)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
