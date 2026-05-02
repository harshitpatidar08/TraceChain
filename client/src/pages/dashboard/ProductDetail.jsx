import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertCircle, CalendarDays, Loader2, Copy, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

import { analyzeChain } from '../../services/gapDetection';
import { calculateTrustScore } from '../../services/trustScore';
import TrustScore from '../../components/TrustScore';
import AIInsightBox from '../../components/AIInsightBox';
import SupplyChainTimeline from '../../components/SupplyChainTimeline';
import ChatbotWidget from '../../components/ChatbotWidget';

const ProductDetail = () => {
  const { traceId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [computed, setComputed] = useState({ score: 0, gapAnalysis: null });

  const canLogEvent = ['processor', 'distributor', 'retailer'].includes(role);

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

      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    if (traceId) fetchTraceData();
  }, [traceId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-300">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Loading Blockchain Ledger...</h2>
        <p className="text-sm text-slate-500 mt-2 font-mono">Verifying block integrity for {traceId}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-xl border border-slate-700">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-slate-400 font-mono text-sm mb-8">{traceId}</p>
          <button onClick={() => navigate('/dashboard/search')} className="bg-orange-500 hover:bg-orange-600 text-white w-full py-3 rounded-xl font-bold transition-colors">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const { product, events } = data;
  const { score, gapAnalysis } = computed;

  // Render product identity card status mapping
  let statusBadge = "bg-green-500/20 text-green-400";
  if (product.status === 'recalled') statusBadge = "bg-red-500/20 text-red-400";
  if (product.status === 'expired') statusBadge = "bg-yellow-500/20 text-yellow-400";

  const getExpiryInfo = (expDate) => {
    if (!expDate) return { label: 'No expiry', color: 'gray' };
    const today = new Date();
    const expiry = new Date(expDate);
    const diffMs = expiry - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: `Expired ${Math.abs(diffDays)} days ago`, color: 'red' };
    if (diffDays <= 7) return { label: `Expiring in ${diffDays} days`, color: 'orange' };
    return { label: `Expires in ${diffDays} days`, color: 'green' };
  };

  const expiryInfo = getExpiryInfo(product.exp_date);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 relative">
      
      {/* Header Actions */}
      {canLogEvent && (
        <div className="flex justify-end mb-4">
          <Link 
            to={`/dashboard/scan`} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <ScanLine className="w-5 h-5" /> Log New Event
          </Link>
        </div>
      )}

      {/* TOP: Identity Card */}
      <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-700 flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-300">
              {product.brand || 'No Brand'}
            </span>
            <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-orange-500/20">
              {product.category}
            </span>
            <span className={`px-3 py-1 rounded-full border border-current text-xs font-bold uppercase ${statusBadge}`}>
              {product.status}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{product.name}</h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-300 pt-2 border-t border-slate-700">
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500"/> {product.origin}</div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className={`w-4 h-4 text-${expiryInfo.color}-500`}/> 
              <span className={`text-${expiryInfo.color}-400 font-bold`}>{expiryInfo.label}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700" onClick={() => {navigator.clipboard.writeText(product.id); toast.success('Trace ID Copied');}}>
              <span className="font-mono text-orange-400 tracking-wider text-xs">ID: {product.id}</span>
              <Copy className="w-3.5 h-3.5 text-slate-400"/>
            </div>
          </div>

          {product.certifications?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.certifications.map(c => (
                 <span key={c} className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded uppercase tracking-wider">
                   <ShieldCheck className="w-3 h-3" /> {c}
                 </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="w-full md:w-auto flex justify-center md:border-l md:border-slate-700 md:pl-8 pt-4 md:pt-0 border-t border-slate-700">
          <TrustScore score={score} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* MIDDLE: AI Insights */}
         <AIInsightBox product={product} events={events} gapAnalysis={gapAnalysis} />
         
         <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center shadow-lg">
           <h3 className="text-slate-400 font-bold text-sm uppercase mb-4 tracking-wider flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-emerald-500" /> Chain Integrity
           </h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
               <span className="text-slate-400 font-medium">Event Count</span>
               <span className="font-bold text-white text-lg bg-slate-900 px-3 py-0.5 rounded-md border border-slate-700">{events.length}</span>
             </div>
             {events.length > 0 && (
               <>
                 <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                   <span className="text-slate-400 font-medium">Ledger Genesis</span>
                   <span className="font-mono text-sm text-slate-300">{new Date(events[0].created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                   <span className="text-slate-400 font-medium">Last Event</span>
                   <span className="font-mono text-sm text-slate-300">{new Date(events[events.length - 1].created_at).toLocaleDateString()}</span>
                 </div>
               </>
             )}
             <div className="flex justify-between items-center pt-1">
               <span className="text-slate-400 font-medium">Verification</span>
               <span className="px-2.5 py-1 bg-orange-500/10 rounded-md font-mono text-xs text-orange-400 border border-orange-500/20 uppercase font-bold tracking-wider">
                 SHA-256 Hashed
               </span>
             </div>
           </div>
         </div>
      </div>

      {/* BOTTOM: Timeline */}
      <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white border-b border-slate-700 pb-4">
           <MapPin className="text-orange-500 w-6 h-6" /> Supply Chain Journey Map
        </h2>
        <SupplyChainTimeline events={events} currentStage={product.current_stage} gapAnalysis={gapAnalysis} />
      </div>

      <ChatbotWidget productContext={{product, events, trustScore: score, insights: gapAnalysis.insights}} />

    </div>
  );
};

export default ProductDetail;
