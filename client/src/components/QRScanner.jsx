import React, {
  useEffect,
  useState,
  useRef
} from 'react';

import { Html5Qrcode } from 'html5-qrcode';

import {
  Camera,
  Loader2,
  AlertCircle,
  X,
  Image as ImageIcon,
  ShieldCheck,
  ScanLine,
  Sparkles
} from 'lucide-react';

const QRScanner = ({
  onScan,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const [error, setError] =
    useState(null);

  const [isScanning, setIsScanning] =
    useState(false);

  const [isCameraOpen, setIsCameraOpen] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const scannerRef = useRef(null);

  const fileInputRef =
    useRef(null);

  // STOP SCANNER

  const stopScanner = async () => {
    if (
      scannerRef.current?.isScanning
    ) {
      try {
        await scannerRef.current.stop();

        scannerRef.current.clear();
      } catch (err) {
        console.error(
          'Failed to stop scanner',
          err
        );
      }
    }

    setIsScanning(false);

    setIsCameraOpen(false);
  };

  // START SCANNER

  const startScanner = async () => {
    setError(null);

    setIsCameraOpen(true);

    setTimeout(async () => {
      try {
        if (!scannerRef.current) {
          scannerRef.current =
            new Html5Qrcode(
              'qr-reader'
            );
        }

        await scannerRef.current.start(
          {
            facingMode:
              'environment'
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250
            },
            aspectRatio: 1.0
          },
          (decodedText) => {
            let traceId =
              decodedText;

            if (
              decodedText.includes(
                '/trace/'
              )
            ) {
              const parts =
                decodedText.split(
                  '/trace/'
                );

              traceId =
                parts[
                  parts.length - 1
                ];
            }

            if (
              scannerRef.current
                .isScanning
            ) {
              stopScanner().then(
                () => {
                  onScan(traceId);
                }
              );
            }
          },
          () => {}
        );

        setIsScanning(true);
      } catch (err) {
        console.error(
          'Scanner start error:',
          err
        );

        setError(
          'Camera permission denied or camera not found. Please check permissions.'
        );

        setIsCameraOpen(false);
      }
    }, 100);
  };

  // FILE UPLOAD

  const handleFileUpload =
    async (e) => {
      const file =
        e.target.files?.[0];

      if (!file) return;

      setIsUploading(true);

      setError(null);

      try {
        const html5QrCode =
          new Html5Qrcode(
            'file-qr-reader'
          );

        const decodedText =
          await html5QrCode.scanFile(
            file,
            false
          );

        let traceId =
          decodedText;

        if (
          decodedText.includes(
            '/trace/'
          )
        ) {
          const parts =
            decodedText.split(
              '/trace/'
            );

          traceId =
            parts[
              parts.length - 1
            ];
        }

        onScan(traceId);
      } catch (err) {
        console.error(
          'File scan error:',
          err
        );

        setError(
          'Could not find a valid QR code in the uploaded image. Please try again or use the camera.'
        );
      } finally {
        setIsUploading(false);

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            '';
        }
      }
    };

  // CLEANUP

  useEffect(() => {
    return () => {
      if (
        scannerRef.current
          ?.isScanning
      ) {
        scannerRef.current
          .stop()
          .catch(console.error);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">

      {/* Hidden Reader */}

      <div
        id="file-qr-reader"
        style={{ display: 'none' }}
      />

      {/* Error */}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 rounded-[28px] p-5 relative shadow-sm">

          <button
            onClick={() =>
              setError(null)
            }
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white hover:bg-red-100 flex items-center justify-center transition-all"
          >

            <X className="w-4 h-4 text-red-500" />

          </button>

          <div className="flex items-start gap-4">

            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">

              <AlertCircle className="w-7 h-7 text-red-500" />

            </div>

            <div>

              <h3 className="text-lg font-black text-red-700 mb-1">

                Scan Error

              </h3>

              <p className="text-red-600 text-sm leading-relaxed">

                {error}

              </p>

            </div>
          </div>
        </div>
      )}

      {!isCameraOpen ? (
        <div className="space-y-5">

          {/* CAMERA CARD */}

          <button
            onClick={startScanner}
            className="group relative overflow-hidden w-full bg-white border border-slate-200 rounded-[36px] p-8 shadow-sm hover:shadow-xl transition-all duration-300"
          >

            {/* Glow */}

            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

            <div className="relative flex flex-col items-center text-center">

              <div className="w-24 h-24 rounded-[32px] bg-emerald-100 flex items-center justify-center shadow-sm mb-6 group-hover:scale-105 transition-transform">

                <Camera className="w-12 h-12 text-emerald-600" />

              </div>

              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold mb-5">

                <ShieldCheck className="w-4 h-4" />

                Secure Camera Verification

              </div>

              <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-3">

                Scan QR Code

              </h3>

              <p className="text-slate-500 leading-relaxed max-w-sm mb-8">

                Use your camera to instantly verify
                products and track the complete
                blockchain supply chain journey.

              </p>

              <div className="bg-slate-900 group-hover:bg-slate-800 text-white px-7 py-4 rounded-2xl font-semibold transition-all flex items-center gap-3">

                <ScanLine className="w-5 h-5" />

                Start Camera Scan

              </div>

            </div>
          </button>

          {/* Upload */}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={
              handleFileUpload
            }
          />

          <button
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={isUploading}
            className="w-full bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
          >

            <div className="flex items-center gap-5">

              <div className="w-16 h-16 rounded-[24px] bg-orange-100 flex items-center justify-center shrink-0">

                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-orange-500" />
                )}

              </div>

              <div className="text-left flex-1">

                <h3 className="text-xl font-black text-slate-900 mb-2">

                  Upload QR Image

                </h3>

                <p className="text-slate-500 leading-relaxed text-sm">

                  Upload product packaging or QR
                  images for instant AI-powered QR
                  recognition.

                </p>

              </div>

            </div>
          </button>

        </div>
      ) : (
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[36px] p-5 shadow-sm">

          {/* Glow */}

          <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

          {/* Header */}

          <div className="relative flex items-center justify-between mb-5">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">

                <Camera className="w-7 h-7 text-emerald-600" />

              </div>

              <div>

                <h3 className="text-xl font-black text-slate-900">

                  Live Scanner

                </h3>

                <p className="text-sm text-slate-500 mt-1">

                  Point camera at QR code

                </p>

              </div>

            </div>

            <button
              onClick={stopScanner}
              className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
            >

              <X className="w-5 h-5 text-slate-700" />

            </button>

          </div>

          {/* Scanner */}

          <div className="relative rounded-[32px] overflow-hidden border border-slate-200 bg-black">

            {/* Frame */}

            <div className="absolute inset-0 border-[3px] border-emerald-400/30 rounded-[32px] z-20 pointer-events-none" />

            {/* Scan Line */}

            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-400 shadow-[0_0_20px_#10b981] animate-[scan_2s_ease-in-out_infinite] z-30 pointer-events-none" />
            )}

            <div
              id="qr-reader"
              className="w-full min-h-[320px]"
            />
          </div>

          {/* Footer */}

          <div className="mt-5 flex items-center justify-center gap-3 text-sm font-semibold">

            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />

                <span className="text-emerald-600">

                  Scanning QR Code...

                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-orange-500" />

                <span className="text-slate-500">

                  Initializing camera...

                </span>
              </>
            )}

          </div>

          {/* Styles */}

          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes scan {
                  0% {
                    top: 10%;
                    opacity: 0;
                  }

                  10% {
                    opacity: 1;
                  }

                  90% {
                    opacity: 1;
                  }

                  100% {
                    top: 90%;
                    opacity: 0;
                  }
                }

                #qr-reader video {
                  border-radius: 28px;
                  object-fit: cover;
                  width: 100%;
                  height: 100%;
                }
              `
            }}
          />

        </div>
      )}
    </div>
  );
};

export default QRScanner;