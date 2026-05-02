import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
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
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="text-orange-500 w-6 h-6" /> Network Events Ledger
          </h2>
          <p className="text-slate-400 text-sm mt-1">Immutable record of all supply chain events across the network.</p>
        </div>
      </div>

      {/* Top Bar: Search & Filters */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by product name, Trace ID, or Hash..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg py-2.5 pl-10 pr-4 outline-none text-white transition-colors font-mono text-sm"
          />
        </div>
        
        <div className="w-full md:w-auto shrink-0">
          <select 
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 outline-none text-white capitalize"
          >
            <option value="all">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p>No events found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-900/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700/50">
                <tr>
                  <th className="px-5 py-4">Product Info</th>
                  <th className="px-5 py-4">Stage</th>
                  <th className="px-5 py-4">Actor Details</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Metrics</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Block Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredEvents.map(e => (
                  <tr key={e.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <Link 
                        to={`/dashboard/product/${e.product_id}`} 
                        className="font-bold text-white hover:text-orange-400 transition-colors flex items-center gap-1.5"
                      >
                        {e.product?.name || 'Unknown'} <LinkIcon className="w-3 h-3" />
                      </Link>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{e.product_id.substring(0, 16)}...</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-700/50 border border-slate-600 text-slate-300 px-2 py-1 rounded text-xs font-bold capitalize">
                        {e.stage}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{e.actor}</div>
                      <div className="text-[10px] text-orange-400/80 uppercase font-bold tracking-wider mt-0.5">{e.role}</div>
                    </td>
                    <td className="px-5 py-4 truncate max-w-[150px]" title={e.location}>
                      {e.location}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">{e.temperature ? `${e.temperature}°C` : '-'}</span>
                        <span className="text-xs text-slate-500">{e.humidity ? `${e.humidity}% RH` : '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm">{new Date(e.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">{new Date(e.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-400 max-w-[120px] truncate" title={e.event_hash}>
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
