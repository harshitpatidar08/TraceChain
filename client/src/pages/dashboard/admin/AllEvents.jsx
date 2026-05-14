import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../config/supabase';
import { ClipboardList, Search, Loader2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('supply_chain_events')
        .select('*, product:products(name, id)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      toast.error('Failed to load events');
    }
    setLoading(false);
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchEvents();
  }, []);

  const stages = [...new Set(events.map(e => e.stage))].filter(Boolean);

  const filteredEvents = events.filter(e => {
    const matchesSearch = 
      (e.product?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (e.product_id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (e.event_hash?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || e.stage === stageFilter;
    
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 font-poppins">
            <ClipboardList className="text-emerald-500 w-6 h-6" /> Network Events Ledger
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Immutable record of all supply chain events across the network.</p>
        </div>
      </div>

      {/* Top Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by product name, Trace ID, or Hash..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-2xl py-3 pl-11 pr-4 outline-none text-slate-900 transition-all placeholder:text-slate-300 font-mono text-xs"
          />
        </div>
        
        <div className="w-full md:w-auto shrink-0">
          <select 
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full bg-gray-50 border border-slate-100 rounded-xl py-3 px-4 outline-none text-gray-700 capitalize font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-all"
          >
            <option value="all">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="w-full">
            <div className="bg-gray-50/50 border-b border-slate-100 h-12 w-full flex items-center px-6 gap-4">
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 border-b border-slate-50 flex items-center gap-4 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <p className="font-bold text-gray-900 mb-1">No events found</p>
            <p className="text-sm">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Actor Details</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Metrics</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Block Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEvents.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link 
                        to={`/dashboard/product/${e.product_id}`} 
                        className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1.5 text-sm"
                      >
                        {e.product?.name || 'Unknown'} <LinkIcon className="w-3 h-3 text-slate-300 group-hover:text-emerald-400" />
                      </Link>
                      <div className="text-[10px] text-gray-400 font-mono font-bold mt-1 tracking-tighter uppercase">{e.product_id.substring(0, 16)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 border border-slate-100 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {e.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900 text-sm">{e.actor}</div>
                      <div className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mt-1">{e.role}</div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[150px] text-gray-500 font-medium text-xs" title={e.location}>
                      {e.location}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-gray-700">{e.temperature ? `${e.temperature}°C` : '-'}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{e.humidity ? `${e.humidity}% RH` : '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-black text-gray-700">{new Date(e.created_at).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(e.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] font-bold bg-gray-50 border border-slate-100 px-2 py-1.5 rounded-lg text-gray-400 max-w-[120px] truncate group-hover:text-gray-600 transition-colors" title={e.event_hash}>
                        {e.event_hash ? e.event_hash : 'Pending'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEvents;
