import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertCircle, CalendarDays, Loader2, Copy, ScanLine, Package, ArrowLeft } from 'lucide-react';
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

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    const fetchTraceData = async () => {
      hasFetched.current = true;
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
      <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/4 mb-6"></div>
        <div className="bg-white p-6 md:p-10 rounded-[36px] shadow-sm border border-slate-200 h-64">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-slate-200 rounded w-2/3 mb-6"></div>
          <div className="h-6 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-16 w-full"></div>
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm h-96 w-full"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[36px] max-w-md w-full text-center shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-slate-400 font-mono text-xs mb-8 bg-[#F8FAFC] py-2 px-4 rounded-xl border border-slate-100">{traceId}</p>
          <button onClick={() => navigate('/dashboard/search')} className="bg-slate-900 hover:bg-slate-800 text-white w-full py-4 rounded-2xl font-semibold transition-all shadow-sm">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const { product, events } = data;
  const { score, gapAnalysis } = computed;

  // Render product identity card status mapping
  let statusBadge = "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (product.status === 'recalled') statusBadge = "bg-red-100 text-red-700 border-red-200";
  if (product.status === 'expired') statusBadge = "bg-orange-100 text-orange-700 border-orange-200";

  const getExpiryInfo = (prod) => {
    const expDate = prod?.exp_date;
    if (!expDate) return { label: 'No expiry', color: 'gray' };
    const [year, month, day] = expDate.split('T')[0].split('-');
    const expiry = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const keywords = ['milk', 'dairy', 'meat', 'fish', 'seafood', 'frozen', 'ice cream', 'yogurt', 'cheese', 'medicine', 'vaccine'];
    const nameDesc = `${prod.name || ''} ${prod.description || ''}`.toLowerCase();
    const isSensitive = keywords.some(kw => nameDesc.includes(kw));

    if (isSensitive) {
      if (diffDays < 0) return { label: `Expired ${Math.abs(diffDays)} days ago`, color: 'red' };
      if (diffDays <= 3) return { label: `Expiring soon`, color: 'red' };
      return { label: `Expires in ${diffDays} days`, color: 'green' };
    } else {
      if (diffDays < 0) return { label: `Expired`, color: 'gray' };
      if (diffDays <= 3) return { label: `Expiring soon`, color: 'orange' };
      if (diffDays <= 30) return { label: `Expires in ${diffDays} days`, color: 'slate' };
      return { label: `Expires in ${diffDays} days`, color: 'green' };
    }
  };

  const expiryInfo = getExpiryInfo(product);
  const expiryColorMap = { green: 'text-emerald-600', red: 'text-red-600', orange: 'text-orange-600', gray: 'text-slate-400', slate: 'text-slate-600' };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 relative">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {canLogEvent && (
          <Link 
            to={`/dashboard/scan`} 
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            <ScanLine className="w-5 h-5" /> Log New Event
          </Link>
        )}
      </div>

      {/* TOP: Identity Card */}
      <div className="bg-white/90 backdrop-blur-sm p-6 md:p-10 rounded-[36px] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-100 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
          <Package className="w-48 h-48 text-slate-900" />
        </div>
        
        <div className="flex-1 space-y-5 w-full relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-[#F8FAFC] border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
              {product.brand || 'No Brand'}
            </span>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              {product.category}
            </span>
            <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusBadge}`}>
              {product.status}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-600 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500"/>
              {product.origin}
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className={`w-4 h-4 ${expiryColorMap[expiryInfo.color]}`}/> 
              <span className={expiryColorMap[expiryInfo.color]}>{expiryInfo.label}</span>
            </div>
            <div 
              className="flex items-center gap-1.5 bg-[#F8FAFC] border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-100 transition-all" 
              onClick={() => {navigator.clipboard.writeText(product.id); toast.success('Trace ID Copied');}}
            >
              <span className="font-mono text-emerald-600 tracking-wider text-xs font-bold">ID: {product.id}</span>
              <Copy className="w-3.5 h-3.5 text-slate-400"/>
            </div>
          </div>

          {product.certifications?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.certifications.map(c => (
                 <span key={c} className="flex items-center gap-1.5 text-[10px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full uppercase tracking-wider">
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

      {/* Chain Integrity — Compact Stat Bar */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm px-6 py-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 mr-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Chain Integrity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm font-semibold">Events</span>
          <span className="font-black text-slate-900 text-base bg-[#F8FAFC] px-3 py-0.5 rounded-lg border border-slate-100">{events.length}</span>
        </div>
        {events.length > 0 && (
          <>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">First logged</span>
              <span className="font-mono text-sm text-slate-700 font-bold bg-[#F8FAFC] px-3 py-0.5 rounded-lg border border-slate-100">{new Date(events[0].created_at).toLocaleDateString()}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Last event</span>
              <span className="font-mono text-sm text-slate-700 font-bold bg-[#F8FAFC] px-3 py-0.5 rounded-lg border border-slate-100">{new Date(events[events.length - 1].created_at).toLocaleDateString()}</span>
            </div>
          </>
        )}
        <div className="ml-auto">
          <span className="px-3 py-1.5 bg-emerald-50 rounded-full font-mono text-[10px] text-emerald-700 border border-emerald-100 uppercase font-black tracking-widest">SHA-256 Hashed</span>
        </div>
      </div>

      {/* MIDDLE: AI Insights — Full Width */}
      <AIInsightBox product={product} events={events} gapAnalysis={gapAnalysis} />

      {/* BOTTOM: Timeline */}
      <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <MapPin className="text-emerald-600 w-4 h-4" />
          </div>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Supply Chain Journey Map</h2>
        </div>
        <SupplyChainTimeline events={events} currentStage={product.current_stage} gapAnalysis={gapAnalysis} />
      </div>

      <ChatbotWidget productContext={{product, events, trustScore: score, insights: gapAnalysis.insights}} />

    </div>
  );
};

export default ProductDetail;
