import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Loader2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

const QRScanner = ({ onScan, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop scanner safely
  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Failed to stop scanner', err);
      }
    }
    setIsScanning(false);
    setIsCameraOpen(false);
  };

  const startScanner = async () => {
    setError(null);
    setIsCameraOpen(true);
    
    // Slight delay to ensure the DOM element is rendered and ready
    setTimeout(async () => {
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode('qr-reader');
        }

        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success
            let traceId = decodedText;
            if (decodedText.includes('/trace/')) {
              const parts = decodedText.split('/trace/');
              traceId = parts[parts.length - 1];
            }
            if (scannerRef.current.isScanning) {
              stopScanner().then(() => {
                onScan(traceId);
              });
            }
          },
          (errorMessage) => {
            // Ignore ongoing scan failures
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error('Scanner start error:', err);
        setError('Camera permission denied or camera not found. Please check permissions.');
        setIsCameraOpen(false);
      }
    }, 100);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      // Html5Qrcode requires an existing DOM element ID to instantiate, even for scanning files
      const html5QrCode = new Html5Qrcode("file-qr-reader");
      const decodedText = await html5QrCode.scanFile(file, false);
      
      let traceId = decodedText;
      if (decodedText.includes('/trace/')) {
        const parts = decodedText.split('/trace/');
        traceId = parts[parts.length - 1];
      }
      onScan(traceId);
    } catch (err) {
      console.error('File scan error:', err);
      setError('Could not find a valid QR code in the uploaded image. Please try again or use the camera.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      {/* Hidden element required for Html5Qrcode instantiation when scanning files */}
      <div id="file-qr-reader" style={{ display: 'none' }}></div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center text-red-400 w-full mb-4 relative">
          <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-400 hover:text-red-300">
             <X className="w-4 h-4" />
          </button>
          <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="font-semibold">Scan Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      
      {!isCameraOpen ? (
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={startScanner}
            className={`w-full ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'} p-8 rounded-xl shadow-xl border flex flex-col items-center justify-center transition-all group`}
          >
            <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 border border-orange-500/30 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-orange-500" />
            </div>
            <span className="font-bold text-lg">Tap to Scan via Camera</span>
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm mt-2`}>Requires camera permission</span>
          </button>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'} py-4 px-6 rounded-xl shadow-sm border flex items-center justify-center gap-3 transition-colors disabled:opacity-50`}
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-orange-500" /> : <ImageIcon className="w-5 h-5 text-orange-500" />}
            <span className="font-semibold">Upload QR Image</span>
          </button>
        </div>
      ) : (
        <div className={`relative ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-4 rounded-xl shadow-xl border w-full overflow-hidden`}>
          {/* Close button */}
          <button 
            onClick={stopScanner}
            className="absolute top-6 right-6 z-30 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative scanner frame */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 border-4 border-orange-500/20 rounded-3xl"></div>
          
          <div id="qr-reader" className="w-full rounded-2xl overflow-hidden bg-black min-h-[250px]"></div>
          
          {isScanning ? (
            <>
              {/* Animated scanning line overlaid on top */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-orange-500 shadow-[0_0_15px_#f97316] animate-[scan_2s_ease-in-out_infinite] z-20 pointer-events-none"></div>
              
              <p className="text-center text-orange-400 text-sm font-bold mt-4 animate-pulse flex justify-center items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin" /> Scanning QR...
              </p>
            </>
          ) : (
            <p className="text-center text-slate-400 text-sm font-bold mt-4 flex justify-center items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin" /> Starting Camera...
            </p>
          )}

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan { 
              0% { top: 10%; opacity: 0; } 
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 90%; opacity: 0; } 
            }
            #qr-reader video { border-radius: 12px; object-fit: cover; width: 100%; height: 100%; }
          `}} />
        </div>
      )}
    </div>
  );
};

export default QRScanner;