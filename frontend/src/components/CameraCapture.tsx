import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle, VideoOff, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  claimContext?: {
    productName?: string;
    reason?: string;
    expectedQuantity?: number;
  };
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, claimContext }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [mode, setMode] = useState<'upload' | 'camera'>('upload'); // Upload is PRIMARY by default

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera unavailable. You can upload a photo instead.');
      setIsCameraActive(false);
      setMode('upload'); // Seamless fallback to upload
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(dataUrl);
        stopCamera();
        onCapture(dataUrl);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCapturedImage(result);
        onCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
      {/* Evidence Banner Instruction */}
      <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-xs text-cyan-200 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white text-sm">Provide Photo Evidence</h4>
          <p className="mt-0.5 text-slate-300">
            Please provide a clear photo of the {claimContext?.productName || 'ordered item'} showing the claimed issue ({claimContext?.reason || 'defect/damage'}).
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs - Upload is Primary */}
      <div className="flex items-center justify-center space-x-3 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
            mode === 'upload'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>UPLOAD PHOTO (PRIMARY)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('camera')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
            mode === 'camera'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>TAKE PHOTO (CAMERA OPTIONAL)</span>
        </button>
      </div>

      {/* Camera Unavailable Banner Notice */}
      {cameraError && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <VideoOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Camera unavailable. You can upload a photo instead.</span>
          </div>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className="text-cyan-400 font-bold underline text-xs"
          >
            Upload Photo →
          </button>
        </div>
      )}

      {/* Main Evidence Capture / Preview Window */}
      <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-4">
        {capturedImage ? (
          <img src={capturedImage} alt="Submitted Evidence" className="w-full h-full object-contain" />
        ) : mode === 'upload' ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto text-cyan-400">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Upload Evidence Image File</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select a photo from your computer or use your camera to provide evidence.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl font-bold text-xs shadow-lg shadow-cyan-500/20 inline-flex items-center space-x-2 transition-all hover:scale-105"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          /* Camera View Mode */
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isCameraActive && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-slate-400">
                <Camera className="w-10 h-10 mb-2 animate-pulse text-cyan-400" />
                <p className="text-sm font-medium">Initializing camera preview...</p>
              </div>
            )}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500/80 backdrop-blur-md text-white rounded-full text-[10px] font-bold tracking-wider flex items-center space-x-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE CAMERA CAPTURE</span>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        {capturedImage ? (
          <div className="flex items-center space-x-3 w-full">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Choose / Take Different Photo</span>
            </button>
            <div className="flex items-center text-emerald-400 text-xs font-bold px-4 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 shrink-0">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Photo Loaded
            </div>
          </div>
        ) : (
          mode === 'camera' && (
            <button
              type="button"
              onClick={handleCapture}
              disabled={!isCameraActive}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>TAKE EVIDENCE PHOTO NOW</span>
            </button>
          )
        )}
      </div>

    </div>
  );
};
