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
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-900 font-poppins">Loading Blockchain Ledger...</h2>
        <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100 px-3 py-1 rounded-full border border-slate-200">Verifying block integrity for {traceId}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-10 rounded-3xl max-w-md w-full text-center shadow-2xl border border-slate-200">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">Product Not Found</h2>
          <p className="text-gray-500 font-mono text-xs mb-8 bg-gray-50 py-2 rounded-lg border border-slate-100">{traceId}</p>
          <button onClick={() => navigate('/dashboard/search')} className="bg-orange-500 hover:bg-orange-600 text-white w-full py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/10 active:scale-95">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const { product, events } = data;
  const { score, gapAnalysis } = computed;

  // Render product identity card status mapping
  let statusBadge = "bg-green-100 text-green-700 border-green-200";
  if (product.status === 'recalled') statusBadge = "bg-red-100 text-red-700 border-red-200";
  if (product.status === 'expired') statusBadge = "bg-amber-100 text-amber-700 border-amber-200";

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
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/10 active:scale-95"
          >
            <ScanLine className="w-5 h-5" /> Log New Event
          </Link>
        </div>
      )}

      {/* TOP: Identity Card */}
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12">
          <Package className="w-48 h-48 text-orange-500" />
        </div>
        
        <div className="flex-1 space-y-5 w-full relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-gray-50 border border-slate-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {product.brand || 'No Brand'}
            </span>
            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-100">
              {product.category}
            </span>
            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${statusBadge}`}>
              {product.status}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight font-poppins">{product.name}</h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold text-gray-600 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500"/> {product.origin}</div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className={`w-4 h-4 text-${expiryInfo.color === 'green' ? 'green' : expiryInfo.color === 'orange' ? 'orange' : 'red'}-500`}/> 
              <span className={`text-${expiryInfo.color === 'green' ? 'green' : expiryInfo.color === 'orange' ? 'orange' : 'red'}-600`}>{expiryInfo.label}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-slate-100" onClick={() => {navigator.clipboard.writeText(product.id); toast.success('Trace ID Copied');}}>
              <span className="font-mono text-orange-600 tracking-wider text-xs font-bold">ID: {product.id}</span>
              <Copy className="w-3.5 h-3.5 text-gray-400"/>
            </div>
          </div>

          {product.certifications?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.certifications.map(c => (
                 <span key={c} className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full uppercase tracking-wider">
                   <ShieldCheck className="w-3.5 h-3.5" /> {c}
                 </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="w-full md:w-auto flex justify-center md:border-l md:border-slate-100 md:pl-10 pt-4 md:pt-0 border-t border-slate-100 relative z-10">
          <TrustScore score={score} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* MIDDLE: AI Insights */}
         <AIInsightBox product={product} events={events} gapAnalysis={gapAnalysis} />
         
         <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col justify-center shadow-xl">
           <h3 className="text-gray-400 font-bold text-[10px] uppercase mb-6 tracking-widest flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-emerald-500" /> Chain Integrity
           </h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center border-b border-slate-50 pb-4">
               <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">Event Count</span>
               <span className="font-black text-gray-900 text-xl bg-gray-50 px-4 py-1 rounded-xl border border-slate-100">{events.length}</span>
             </div>
             {events.length > 0 && (
               <>
                 <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                   <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">Ledger Genesis</span>
                   <span className="font-mono text-sm text-gray-700 font-bold tracking-tight">{new Date(events[0].created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                   <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">Last Event</span>
                   <span className="font-mono text-sm text-gray-700 font-bold tracking-tight">{new Date(events[events.length - 1].created_at).toLocaleDateString()}</span>
                 </div>
               </>
             )}
             <div className="flex justify-between items-center pt-2">
               <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">Verification</span>
               <span className="px-3 py-1.5 bg-orange-50 rounded-full font-mono text-[10px] text-orange-600 border border-orange-100 uppercase font-black tracking-widest">
                 SHA-256 Hashed
               </span>
             </div>
           </div>
         </div>
      </div>

      {/* BOTTOM: Timeline */}
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-gray-900 border-b border-slate-100 pb-6 font-poppins uppercase tracking-wider text-base">
           <MapPin className="text-orange-500 w-6 h-6" /> Supply Chain Journey Map
        </h2>
        <SupplyChainTimeline events={events} currentStage={product.current_stage} gapAnalysis={gapAnalysis} />
      </div>

      <ChatbotWidget productContext={{product, events, trustScore: score, insights: gapAnalysis.insights}} />

    </div>
  );
};

export default ProductDetail;
