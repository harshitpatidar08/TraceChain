import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import { ScanLine, Search, History, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';
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
    // result could be a full URL or just the trace ID
    let traceId = result;
    if (result.includes('/trace/')) {
      const parts = result.split('/trace/');
      traceId = parts[parts.length - 1];
    }
    saveAndNavigate(traceId, 'QR Scan');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId) saveAndNavigate(manualId, 'Manual Entry');
  };

  const saveAndNavigate = (id, sourceName) => {
    const traceId = id.trim().toUpperCase();
    
    // Save to local storage
    const newScan = { traceId, name: sourceName, timestamp: new Date().toISOString() };
    const updated = [newScan, ...recentScans.filter(s => s.traceId !== traceId)].slice(0, 5);
    localStorage.setItem('recentScans', JSON.stringify(updated));
    
    navigate(`/trace/${traceId}`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    const toastId = toast.loading('Analyzing image for Trace IDs...', { duration: 10000 });
    
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      
      // Regex pattern: TC-YYYY-XXXX-XXX
      // e.g. TC-2026-FOOD-001
      const regex = /TC-\d{4}-[A-Z]+-\d{3}/i;
      const match = text.match(regex);

      if (match) {
        toast.success(`Found Trace ID: ${match[0]}`, { id: toastId });
        saveAndNavigate(match[0], 'Label Scan');
      } else {
        toast.error('No Trace ID found in image. Please try again.', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to parse image data.', { id: toastId });
    }
    
    setOcrLoading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 pt-12 font-sans font-medium">
      <div className="max-w-xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-200">
            <ScanLine className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold">Scan Product</h1>
          <p className="text-slate-500">Scan QR codes or labels to trace origins securely.</p>
        </div>

        {/* Scanner component */}
        <QRScanner onScan={handleScanResult} theme="light" />

        {/* OR Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Manual Input / OCR */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleManualSubmit} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Enter Trace ID manually" 
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg py-3 pl-12 pr-4 transition-colors font-mono uppercase text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-lg font-bold transition-colors">
              Track
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 flex flex-col items-center">
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
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg py-3 border border-slate-200 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {ocrLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              Scan Product Label (OCR)
            </button>
            <p className="text-xs text-slate-500 mt-3 text-center">Take a photo of product packaging to automatically extract Trace IDs using AI vision.</p>
          </div>
        </div>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <History className="w-4 h-4" /> Recent Scans
            </h3>
            <div className="space-y-3">
              {recentScans.map((scan, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/trace/${scan.traceId}`)}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-500/50 cursor-pointer transition-all flex justify-between items-center group shadow-sm"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">{scan.traceId}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-1">Source: {scan.name}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(scan.timestamp).toLocaleDateString()}</span>
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