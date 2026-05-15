import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, Calendar, Filter, FileText, Loader2, PieChart as PieIcon, Map, Users, Boxes, MapPin } from 'lucide-react';

const PINCODE_MAP = {
  '453331': { area: 'Rau', district: 'Indore' },
  '453441': { area: 'Mhow', district: 'Indore' },
  '453771': { area: 'Depalpur', district: 'Indore' },
  '453551': { area: 'Sanwer', district: 'Indore' },
  '452001': { area: 'Indore City', district: 'Indore' },
  '452012': { area: 'Rajendra Nagar', district: 'Indore' },
  '462001': { area: 'Bhopal City', district: 'Bhopal' },
  '462010': { area: 'Berasia', district: 'Bhopal' },
  '462030': { area: 'Phanda', district: 'Bhopal' },
  '462026': { area: 'Huzur', district: 'Bhopal' },
  '474001': { area: 'Gwalior City', district: 'Gwalior' },
  '473880': { area: 'Bhitarwar', district: 'Gwalior' },
  '475110': { area: 'Dabra', district: 'Gwalior' },
  '474006': { area: 'Morar', district: 'Gwalior' },
  '482001': { area: 'Jabalpur City', district: 'Jabalpur' },
  '483220': { area: 'Panagar', district: 'Jabalpur' },
  '483880': { area: 'Sihora', district: 'Jabalpur' },
  '481776': { area: 'Kundam', district: 'Jabalpur' }
};

const CROP_MAP = {
  'WHT': 'Wheat', 'RCE': 'Rice', 'SOY': 'Soybean', 'ONI': 'Onion',
  'TOM': 'Tomato', 'POT': 'Potato', 'GAR': 'Garlic', 'MZE': 'Maize',
  'CTN': 'Cotton', 'SGC': 'Sugarcane', 'GNT': 'Groundnut', 'OTH': 'Other'
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const MonthlyReport = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all'); // all, thisMonth, lastMonth

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');

    if (timeFilter === 'thisMonth') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      query = query.gte('created_at', startOfMonth.toISOString());
    } else if (timeFilter === 'lastMonth') {
      const startOfLastMonth = new Date();
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
      startOfLastMonth.setDate(1);
      startOfLastMonth.setHours(0, 0, 0, 0);

      const endOfLastMonth = new Date();
      endOfLastMonth.setDate(0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      
      query = query.gte('created_at', startOfLastMonth.toISOString())
                   .lte('created_at', endOfLastMonth.toISOString());
    }

    const { data, error } = await query;
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  // Compute Metrics
  const uniqueFarmers = new Set(products.map(p => p.farmer_id).filter(Boolean)).size;
  const uniqueBatches = new Set(products.map(p => p.batch_id).filter(Boolean)).size;
  
  // District Data
  const districtCounts = {};
  products.forEach(p => {
    const dist = PINCODE_MAP[p.pincode]?.district || 'Unknown';
    districtCounts[dist] = (districtCounts[dist] || 0) + 1;
  });
  const districtChartData = Object.keys(districtCounts).map(d => ({
    name: d,
    value: districtCounts[d]
  })).sort((a, b) => b.value - a.value);

  // Crop Data
  const cropCounts = {};
  products.forEach(p => {
    const cropName = CROP_MAP[p.crop_code] || p.crop_code || 'Other';
    cropCounts[cropName] = (cropCounts[cropName] || 0) + 1;
  });
  const cropChartData = Object.keys(cropCounts).map(c => ({
    name: c,
    value: cropCounts[c]
  })).sort((a, b) => b.value - a.value);

  const handleExport = () => {
    const csvContent = [
      ['Trace ID', 'Product Name', 'Farmer ID', 'Crop', 'District', 'Pincode', 'Date Registered'].join(','),
      ...products.map(p => {
        const dist = PINCODE_MAP[p.pincode]?.district || 'Unknown';
        const crop = CROP_MAP[p.crop_code] || p.crop_code || 'Unknown';
        const date = new Date(p.created_at).toLocaleDateString();
        return `${p.id},${p.name},${p.farmer_id},${crop},${dist},${p.pincode},${date}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tracechain_report_${timeFilter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PieIcon className="w-6 h-6 text-emerald-500" /> Monthly Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">Monitor trace generation and regional distribution metrics.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap shadow-sm"
          >
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Traces</h3>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Boxes className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{products.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Farmers</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{uniqueFarmers}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Unique Batches</h3>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{uniqueBatches}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Regions</h3>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
              <Map className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{districtChartData.length}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Districts */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-400" /> Production by District
          </h3>
          <div className="h-[300px] w-full">
            {districtChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Pie Chart: Crops */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-slate-400" /> Crop Distribution
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
             {cropChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {cropChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
            )}
          </div>
          {cropChartData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {cropChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default MonthlyReport;
