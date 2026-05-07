import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertCircle, CalendarDays, ExternalLink, Loader2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

import { analyzeChain } from '../services/gapDetection';
import { calculateTrustScore } from '../services/trustScore';
import TrustScore from '../components/TrustScore';
import AIInsightBox from '../components/AIInsightBox';
import SupplyChainTimeline from '../components/SupplyChainTimeline';
import ChatbotWidget from '../components/ChatbotWidget';

const Trace = () => {
  const { traceId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [computed, setComputed] = useState({ score: 0, gapAnalysis: null });

  useEffect(() => {
    const fetchTraceData = async () => {
      setLoading(true);
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', traceId)
          .single();

        if (productError || !productData) throw new Error('Product not found');

        const { data: eventsData, error: eventsError } = await supabase
          .from('supply_chain_events')
          .select('*')
          .eq('product_id', productData.id)
          .order('created_at', { ascending: true });

        const result = {
          product: productData,
          events: eventsData || []
        };
        
        setData(result);
        
        // Compute Services
        const gapAns = analyzeChain(result.events, result.product);
        const trScore = calculateTrustScore(result.product, result.events);
        
        setComputed({ score: trScore, gapAnalysis: gapAns });
        
        // Update Recent Scans
        const saved = localStorage.getItem('recentScans');
        let recents = saved ? JSON.parse(saved) : [];
        const newScan = { traceId, name: result.product.name, timestamp: new Date().toISOString() };
        recents = [newScan, ...recents.filter(s => s.traceId !== traceId)].slice(0, 5);
        localStorage.setItem('recentScans', JSON.stringify(recents));

      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    if (traceId) fetchTraceData();
  }, [traceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent shadow-lg shadow-orange-500/20 mb-4"></div>
        <h2 className="text-xl font-bold font-poppins text-gray-900">Tracing Product Journey...</h2>
        <p className="text-xs text-gray-400 mt-2 font-mono font-bold uppercase tracking-widest">Fetching ledger blocks for {traceId}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-slate-200">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 font-poppins">Product Not Found</h2>
          <p className="text-gray-400 font-mono text-xs mb-8 font-bold uppercase tracking-widest">{traceId}</p>
          <button onClick={() => navigate('/scanner')} className="bg-orange-500 hover:bg-orange-600 text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 active:scale-95">
            Scan Another Product
          </button>
        </div>
      </div>
    );
  }

  const { product, events } = data;
  const { score, gapAnalysis } = computed;

  // Render product identity card status mapping
  let statusBadge = "bg-green-50 text-green-700 border-green-100";
  if (product.status === 'recalled') statusBadge = "bg-red-50 text-red-700 border-red-100";
  if (product.status === 'expired') statusBadge = "bg-amber-50 text-amber-700 border-amber-100";

  const getExpiryInfo = (expDate) => {
    if (!expDate) return { label: 'No expiry', color: 'gray' }
    const today = new Date()
    const expiry = new Date(expDate)
    const diffMs = expiry - today
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { 
      label: `Expired ${Math.abs(diffDays)} days ago`, 
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
    if (diffDays <= 3) return { 
      label: `Expiring in ${diffDays} days`, 
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
    return { 
      label: `Expires in ${diffDays} days`, 
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  }

  const expiryInfo = getExpiryInfo(product.exp_date);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans pb-24">
      
      {/* Top Background Map Pattern */}
      <div className="h-48 bg-white bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] border-b border-slate-100 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
        <h1 className="text-gray-200 font-black text-6xl uppercase tracking-[0.5em] opacity-30 select-none z-0">ORIGIN</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 z-10 relative space-y-8">
        
        {/* TOP: Identity Card */}
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 border border-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                {product.brand}
              </span>
              <span className="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {product.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadge}`}>
                {product.status}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight font-poppins">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-bold text-gray-500 pt-4 border-t border-slate-100 uppercase tracking-widest">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500"/> {product.origin}</div>
              <div className="flex items-center gap-2">
                <CalendarDays className={`w-4 h-4 text-${expiryInfo.color}-500`}/> 
                <span className={`${expiryInfo.textColor}`}>Exp: {new Date(product.exp_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition border border-slate-100" onClick={() => {navigator.clipboard.writeText(product.id); toast.success('Trace ID Copied');}}>
                <span className="font-mono text-orange-600 tracking-tight">ID: {product.id}</span>
                <Copy className="w-3.5 h-3.5 text-gray-400"/>
              </div>
            </div>

            {product.certifications?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.certifications.map(c => (
                   <span key={c} className="flex items-center gap-1.5 text-[9px] font-black bg-green-50 border border-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                     <ShieldCheck className="w-3.5 h-3.5" /> {c}
                   </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="w-full md:w-auto flex justify-center md:border-l md:border-slate-100 md:pl-10 pt-6 md:pt-0 border-t border-slate-100">
            <TrustScore score={score} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* MIDDLE: AI Insights */}
           <AIInsightBox product={product} events={events} gapAnalysis={gapAnalysis} />
           
           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col justify-center">
             <h3 className="text-gray-400 font-black text-[10px] uppercase mb-6 tracking-[0.2em]">Chain Integrity</h3>
             <div className="space-y-5">
               <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                 <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Event Count</span>
                 <span className="font-black text-gray-900 text-xl font-poppins">{events.length}</span>
               </div>
               {events.length > 0 && (
                 <>
                   <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                     <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Ledger Genesis</span>
                     <span className="font-mono text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-slate-100">{new Date(events[0].created_at).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                     <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Last Event</span>
                     <span className="font-mono text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-slate-100">{new Date(events[events.length - 1].created_at).toLocaleDateString()}</span>
                   </div>
                 </>
               )}
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Verification</span>
                 <span className="px-3 py-1.5 bg-orange-50 rounded-lg font-mono text-[10px] font-black text-orange-600 border border-orange-100 uppercase tracking-widest shadow-sm">SHA-256 Hashed</span>
               </div>
             </div>
           </div>
        </div>

        {/* MIDDLE: Timeline */}
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          <h2 className="text-2xl font-black mb-10 flex items-center gap-4 text-gray-900 font-poppins">
             <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
               <MapPin className="text-orange-600 w-5 h-5" />
             </div>
             Origin Journey Map
          </h2>
          <SupplyChainTimeline events={events} currentStage={product.current_stage} gapAnalysis={gapAnalysis} />
        </div>

      </div>

      <ChatbotWidget productContext={{product, events, trustScore: score, insights: gapAnalysis.insights}} />

    </div>
  );
};

export default Trace;