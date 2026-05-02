import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { ListOrdered, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyEvents = () => {
  const { user, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
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

    if (user) {
      fetchEvents();
    }
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ListOrdered className="text-orange-500 w-6 h-6" /> My Logged Events
          </h2>
          <p className="text-slate-400 text-sm mt-1">History of all supply chain events you have added to the blockchain.</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListOrdered className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No events logged yet</h3>
            <p className="text-slate-400 mb-6">You haven't appended any events to products.</p>
            {role !== 'farmer' && (
              <Link to="/dashboard/scan" className="inline-flex bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-2.5 rounded-lg font-medium text-white items-center gap-2">
                Go to Scan & Log <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-900/50 text-slate-400 font-semibold uppercase text-xs tracking-wider border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Temp</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Transaction Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <Link to={`/dashboard/product/${ev.product_id}`} className="hover:text-orange-400 transition-colors">
                        {ev.product?.name || ev.product_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-medium capitalize">
                        {ev.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]" title={ev.location}>{ev.location}</td>
                    <td className="px-6 py-4">{ev.temperature ? `${ev.temperature}°C` : '-'}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(ev.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-orange-400/80 bg-orange-400/10 px-2 py-1 rounded inline-block" title={ev.event_hash}>
                        {ev.event_hash ? `${ev.event_hash.substring(0, 12)}...` : 'Pending'}
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

export default MyEvents;
