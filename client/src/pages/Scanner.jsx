import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';

import {
  ScanLine,
  Search,
  History,
  Image as ImageIcon,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';

const Scanner = () => {
  const [manualId, setManualId] = useState('');
  const [recentScans, setRecentScans] = useState([]);
  const [ocrLoading, setOcrLoading] = useState(false);

  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('recentScans');

    if (saved) {
      try {
        setRecentScans(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleScanResult = (result) => {
    let traceId = result;

    if (result.includes('/trace/')) {
      const parts = result.split('/trace/');
      traceId = parts[parts.length - 1];
    }

    saveAndNavigate(traceId, 'QR Scan');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();

    if (manualId) {
      saveAndNavigate(manualId, 'Manual Entry');
    }
  };

  const saveAndNavigate = (id, sourceName) => {
    const traceId = id.trim().toUpperCase();

    const newScan = {
      traceId,
      name: sourceName,
      timestamp: new Date().toISOString()
    };

    const updated = [
      newScan,
      ...recentScans.filter((s) => s.traceId !== traceId)
    ].slice(0, 5);

    localStorage.setItem('recentScans', JSON.stringify(updated));

    navigate(`/trace/${traceId}`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setOcrLoading(true);

    const toastId = toast.loading(
      'Analyzing image for Trace IDs...',
      { duration: 10000 }
    );

    try {
      const result = await Tesseract.recognize(file, 'eng');

      const text = result.data.text;

      const regex = /TC-\d{4}-[A-Z]+-\d{3}/i;

      const match = text.match(regex);

      if (match) {
        toast.success(`Found Trace ID: ${match[0]}`, {
          id: toastId
        });

        saveAndNavigate(match[0], 'Label Scan');
      } else {
        toast.error(
          'No Trace ID found in image. Please try again.',
          { id: toastId }
        );
      }
    } catch (err) {
      toast.error('Failed to parse image data.', {
        id: toastId
      });
    }

    setOcrLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-12 sm:px-6">

      {/* Background Glow */}

      <div className="fixed top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 -z-10" />

      <div className="fixed bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40 -z-10" />

      <div className="max-w-3xl mx-auto">

        {/* Header */}

        <div className="text-center mb-14">

          <div className="w-20 h-20 rounded-[28px] bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-6">

            <ScanLine className="w-10 h-10 text-emerald-500" />

          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">

            <ShieldCheck size={16} />

            <span>
              Secure Blockchain Verification
            </span>

          </div>

          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-5">

            Scan Product

          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">

            Scan QR codes or upload product labels to instantly trace
            product origins and verify authenticity.

          </p>
        </div>

        {/* Scanner Section */}

        <div className="bg-white border border-slate-200 rounded-[36px] p-6 md:p-8 shadow-sm mb-10">

          <QRScanner onScan={handleScanResult} theme="light" />

        </div>

        {/* Divider */}

        <div className="flex items-center gap-4 mb-10">

          <div className="flex-1 h-px bg-slate-200" />

          <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Alternative Methods
          </span>

          <div className="flex-1 h-px bg-slate-200" />

        </div>

        {/* Manual + OCR */}

        <div className="bg-white border border-slate-200 rounded-[36px] p-6 md:p-8 shadow-sm mb-12">

          {/* Manual Input */}

          <form
            onSubmit={handleManualSubmit}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >

            <div className="relative flex-1">

              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

              <input
                type="text"
                placeholder="Enter Trace ID manually"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl py-4 pl-14 pr-4 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all font-mono uppercase"
              />
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >

              Track

              <ArrowRight size={18} />

            </button>

          </form>

          {/* OCR */}

          <div className="border-t border-slate-100 pt-8">

            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
              className="w-full bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 rounded-3xl py-6 px-6 transition-all duration-300 group"
            >

              <div className="flex flex-col items-center justify-center text-center">

                <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">

                  {ocrLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-emerald-500" />
                  )}

                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">

                  Scan Product Label

                </h3>

                <p className="text-slate-500 max-w-md leading-relaxed">

                  Upload packaging images to automatically extract
                  Trace IDs using OCR AI recognition.

                </p>

              </div>
            </button>
          </div>
        </div>

        {/* Recent Scans */}

        {recentScans.length > 0 && (
          <div>

            <div className="flex items-center gap-3 mb-6">

              <History className="w-5 h-5 text-slate-500" />

              <h3 className="text-lg font-bold text-slate-900">
                Recent Scans
              </h3>

            </div>

            <div className="space-y-4">

              {recentScans.map((scan, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    navigate(`/trace/${scan.traceId}`)
                  }
                  className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 cursor-pointer group"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">

                        {scan.traceId}

                      </h4>

                      <p className="text-sm text-slate-500 mt-1">

                        Source: {scan.name}

                      </p>

                    </div>

                    <span className="text-xs text-slate-400">

                      {new Date(
                        scan.timestamp
                      ).toLocaleDateString()}

                    </span>

                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Scanner;