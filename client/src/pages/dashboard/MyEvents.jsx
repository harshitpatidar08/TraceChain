import React, { useEffect, useState, useRef, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { ListOrdered, Loader2, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyEvents = () => {
  const { user, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (hasFetched.current) return;
    const fetchEvents = async () => {
      hasFetched.current = true;
      try {
        const actorName = user?.user_metadata?.display_name || user?.email;
        
        // Fetch all events and filter, or try direct equality
        const { data, error } = await supabase
          .from('supply_chain_events')
          .select('*, product:products(name)')
          .eq('actor', actorName)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load events');
      }
      setLoading(false);
    };

    fetchEvents();
  }, [user]);

  const stageColors = {
    farming: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-blue-100 text-blue-700',
    distribution: 'bg-purple-100 text-purple-700',
    retail: 'bg-orange-100 text-orange-700',
    consumer: 'bg-slate-100 text-slate-700'
  };

  const EventRow = memo(({ ev }) => (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <Link to={`/dashboard/product/${ev.product_id}`} className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          {ev.product?.name || ev.product_id}
        </Link>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stageColors[ev.stage] || 'bg-slate-100 text-slate-600'}`}>
          {ev.stage}
        </span>
      </td>
      <td className="px-6 py-4 truncate max-w-[200px] text-slate-500" title={ev.location}>{ev.location}</td>
      <td className="px-6 py-4 font-semibold text-slate-900">{ev.temperature ? `${ev.temperature}°C` : '-'}</td>
      <td className="px-6 py-4 text-slate-400">{new Date(ev.created_at).toLocaleString()}</td>
      <td className="px-6 py-4">
        <div className="font-mono text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full inline-block tracking-wider" title={ev.event_hash}>
          {ev.event_hash ? `${ev.event_hash.substring(0, 12)}...` : 'Pending'}
        </div>
      </td>
    </tr>
  ));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Card */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-[36px] p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-100 rounded-full blur-3xl opacity-20" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <ListOrdered className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">History</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">My Logged Events</h2>
            <p className="text-slate-500 mt-1 text-sm">History of all supply chain events you have added to the blockchain.</p>
          </div>
          {events.length > 0 && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl px-5 py-3 text-center shrink-0">
              <p className="text-3xl font-black text-slate-900">{events.length}</p>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Events</p>
            </div>
          )}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="w-full">
            <div className="bg-slate-50 border-b border-slate-100 h-12 w-full flex items-center px-6 gap-4">
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
        ) : events.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListOrdered className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No events logged yet</h3>
            <p className="text-slate-500 mb-6">You haven't appended any events to products.</p>
            {role !== 'farmer' && (
              <Link to="/dashboard/scan" className="inline-flex bg-slate-900 hover:bg-slate-800 transition-all px-6 py-3 rounded-2xl font-semibold text-white items-center gap-2 shadow-sm">
                Go to Scan & Log <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Product Name', 'Stage', 'Location', 'Temp', 'Date', 'Transaction Hash'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map(ev => (
                  <EventRow key={ev.id} ev={ev} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
