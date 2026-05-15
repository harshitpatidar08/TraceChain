import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertCircle, CalendarDays, Loader2, Copy, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

import { analyzeChain } from '../services/gapDetection';
import { calculateTrustScore } from '../services/trustScore';
import TrustScore from '../components/TrustScore';
import AIInsightBox from '../components/AIInsightBox';
import SupplyChainTimeline from '../components/SupplyChainTimeline';
import ChatbotWidget from '../components/ChatbotWidget';

const PINCODE_MAP = {
  '453331': 'Rau, Indore',
  '453441': 'Mhow, Indore',
  '453771': 'Depalpur, Indore',
  '453551': 'Sanwer, Indore',
  '452001': 'Indore City',
  '452012': 'Rajendra Nagar, Indore',
  '462001': 'Bhopal City',
  '462010': 'Berasia, Bhopal',
  '462030': 'Phanda, Bhopal',
  '462026': 'Huzur, Bhopal',
  '474001': 'Gwalior City',
  '473880': 'Bhitarwar, Gwalior',
  '475110': 'Dabra, Gwalior',
  '474006': 'Morar, Gwalior',
  '482001': 'Jabalpur City',
  '483220': 'Panagar, Jabalpur',
  '483880': 'Sihora, Jabalpur',
  '481776': 'Kundam, Jabalpur'
};

const CROP_MAP = {
  'WHT': 'Wheat', 'RCE': 'Rice', 'SOY': 'Soybean', 'ONI': 'Onion',
  'TOM': 'Tomato', 'POT': 'Potato', 'GAR': 'Garlic', 'MZE': 'Maize',
  'CTN': 'Cotton', 'SGC': 'Sugarcane', 'GNT': 'Groundnut', 'OTH': 'Other'
};

const UNIT_MAP = {
  '01': 'KG', '02': 'Quintal', '03': 'Ton'
};

const parseTraceId = (id) => {
  if (!id || !id.startsWith('MP/')) return null;
  const parts = id.split('/');
  if (parts.length !== 7) return null;
  
  const [, pincode, farmerId, cropCode, quantityStr, unitCode, batchId] = parts;
  return {
    state: 'Madhya Pradesh',
    pincode,
    area: PINCODE_MAP[pincode] || 'Unknown Area',
    farmerId,
    crop: CROP_MAP[cropCode] || cropCode,
    quantity: `${parseInt(quantityStr, 10)} ${UNIT_MAP[unitCode] || ''}`,
    batch: batchId
  };
};

const Trace = () => {
  const params = useParams();
  const traceId = params['*'];
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [computed, setComputed] = useState({ score: 0, gapAnalysis: null });

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
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24 animate-pulse">
        <div className="fixed top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30 -z-10" />
        
        <div className="h-40 bg-white border-b border-slate-100 relative"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-14 z-10 relative space-y-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 md:p-10 rounded-[36px] shadow-sm border border-slate-200 h-64">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-slate-200 rounded w-2/3 mb-6"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2"></div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-16 w-full"></div>
          
          <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm h-96 w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="fixed top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[36px] max-w-md w-full text-center shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-slate-400 font-mono text-xs mb-8 font-bold uppercase tracking-widest bg-[#F8FAFC] py-2 px-4 rounded-xl border border-slate-200">{traceId}</p>
          <button onClick={() => navigate('/scanner')} className="bg-slate-900 hover:bg-slate-800 text-white w-full py-4 rounded-2xl font-semibold transition-all shadow-sm">
            Scan Another Product
          </button>
        </div>
      </div>
    );
  }

  const { product, events } = data;
  const { score, gapAnalysis } = computed;

  // Render product identity card status mapping
  let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (product.status === 'recalled') statusBadge = "bg-red-50 text-red-700 border-red-200";
  if (product.status === 'expired') statusBadge = "bg-orange-50 text-orange-700 border-orange-200";

  const getExpiryInfo = (prod) => {
    const expDate = prod?.exp_date;
    if (!expDate) return { label: 'No expiry', color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-500' };
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
      if (diffDays < 0) return { 
        label: `Expired ${Math.abs(diffDays)} days ago`, 
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600'
      };
      if (diffDays <= 3) return { 
        label: `Expiring soon`, 
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600'
      };
      return { 
        label: `Expires in ${diffDays} days`, 
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-emerald-600'
      };
    } else {
      if (diffDays < 0) return { 
        label: `Expired`, 
        color: 'gray',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-500'
      };
      if (diffDays <= 3) return { 
        label: `Expiring soon`, 
        color: 'orange',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600'
      };
      if (diffDays <= 30) return { 
        label: `Expires in ${diffDays} days`, 
        color: 'slate',
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-600'
      };
      return { 
        label: `Expires in ${diffDays} days`, 
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-emerald-600'
      };
    }
  };

  const expiryInfo = getExpiryInfo(product);

  const parsedInfo = parseTraceId(product.id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24">
      
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Top Pattern Banner */}
      <div className="h-40 bg-white bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] border-b border-slate-100 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
        <h1 className="text-slate-200 font-black text-5xl uppercase tracking-[0.5em] opacity-40 select-none z-0">ORIGIN</h1>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white hover:border-slate-300 text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-14 z-10 relative space-y-8">
        
        {/* TOP: Identity Card */}
        <div className="bg-white/90 backdrop-blur-sm p-6 md:p-10 rounded-[36px] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-100 rounded-full blur-3xl opacity-20 pointer-events-none" />
          
          <div className="flex-1 space-y-4 w-full relative z-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-[#F8FAFC] border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                {product.brand}
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {product.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadge}`}>
                {product.status}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-bold text-slate-500 pt-4 border-t border-slate-100 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500"/>
                {product.origin}
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className={`w-4 h-4 ${expiryInfo.textColor}`}/> 
                <span className={expiryInfo.textColor}>Exp: {new Date(product.exp_date).toLocaleDateString()}</span>
              </div>
              <div 
                className="flex items-center gap-2 bg-[#F8FAFC] border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-100 transition-all" 
                onClick={() => {navigator.clipboard.writeText(product.id); toast.success('Trace ID Copied');}}
              >
                <span className="font-mono text-emerald-600 tracking-tight">ID: {product.id}</span>
                <Copy className="w-3.5 h-3.5 text-slate-400"/>
              </div>
            </div>

            {product.certifications?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.certifications.map(c => (
                   <span key={c} className="flex items-center gap-1.5 text-[9px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                     <ShieldCheck className="w-3.5 h-3.5" /> {c}
                   </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="w-full md:w-auto flex justify-center md:border-l md:border-slate-100 md:pl-10 pt-6 md:pt-0 border-t border-slate-100 relative z-10">
            <TrustScore score={score} />
          </div>
        </div>

        {/* Parsed Info Location Card */}
        {parsedInfo && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4 ml-2">Trace Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-2">
              <div>
                <p className="text-xs text-slate-400 font-bold">🏛 State</p>
                <p className="font-semibold text-slate-900">{parsedInfo.state}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">📍 Pincode</p>
                <p className="font-semibold text-slate-900">{parsedInfo.pincode}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs text-slate-400 font-bold">🏘 Area</p>
                <p className="font-semibold text-slate-900">{parsedInfo.area}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">👤 Farmer ID</p>
                <p className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block">{parsedInfo.farmerId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">🌱 Crop</p>
                <p className="font-semibold text-slate-900">{parsedInfo.crop}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">⚖ Quantity</p>
                <p className="font-semibold text-slate-900">{parsedInfo.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">📦 Batch</p>
                <p className="font-mono text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded inline-block">{parsedInfo.batch}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chain Integrity — Compact Horizontal Stat Bar */}
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
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Origin Journey Map</h2>
          </div>
          <SupplyChainTimeline events={events} currentStage={product.current_stage} gapAnalysis={gapAnalysis} />
        </div>

      </div>

      <ChatbotWidget productContext={{product, events, trustScore: score, insights: gapAnalysis.insights}} />

    </div>
  );
};

export default Trace;