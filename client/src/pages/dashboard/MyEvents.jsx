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
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 font-poppins">
            <ListOrdered className="text-orange-500 w-6 h-6" /> My Logged Events
          </h2>
          <p className="text-gray-500 text-sm mt-1">History of all supply chain events you have added to the blockchain.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListOrdered className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No events logged yet</h3>
            <p className="text-gray-500 mb-6">You haven't appended any events to products.</p>
            {role !== 'farmer' && (
              <Link to="/dashboard/scan" className="inline-flex bg-orange-500 hover:bg-orange-600 transition-all px-6 py-2.5 rounded-xl font-bold text-white items-center gap-2 shadow-md active:scale-95">
                Go to Scan & Log <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Temp</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Transaction Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <Link to={`/dashboard/product/${ev.product_id}`} className="hover:text-orange-500 transition-colors flex items-center gap-2">
                        {ev.product?.name || ev.product_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {ev.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px] font-medium text-gray-600" title={ev.location}>{ev.location}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{ev.temperature ? `${ev.temperature}°C` : '-'}</td>
                    <td className="px-6 py-4 text-gray-400 font-medium">{new Date(ev.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[11px] text-orange-600 font-bold bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full inline-block tracking-wider" title={ev.event_hash}>
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
