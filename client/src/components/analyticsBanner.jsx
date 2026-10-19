import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api';

const AnalyticsBanner = ({ leads = [] }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leads.length) {
      setMetrics(null);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await analyticsApi.getMetrics(leads);
        setMetrics(data);
      } catch (err) {
        console.error('Failed to compute analytics via FastAPI:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [leads]);

  if (!metrics && !loading) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {/* Total Leads */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl flex flex-col justify-between">
        <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total Leads</span>
        <span className="text-2xl font-light text-white mt-1">
          {loading ? '...' : metrics?.totalLeads ?? 0}
        </span>
      </div>

      {/* Registered / Converted */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl flex flex-col justify-between">
        <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Registered</span>
        <span className="text-2xl font-light text-emerald-400 mt-1">
          {loading ? '...' : metrics?.registeredCount ?? 0}
        </span>
      </div>

      {/* Pending Followups */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl flex flex-col justify-between">
        <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Pending</span>
        <span className="text-2xl font-light text-amber-400 mt-1">
          {loading ? '...' : metrics?.pendingCount ?? 0}
        </span>
      </div>

      {/* Conversion Rate */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Conversion</span>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">FastAPI</span>
        </div>
        <span className="text-2xl font-light text-indigo-400 mt-1">
          {loading ? '...' : `${metrics?.conversionRate ?? 0}%`}
        </span>
      </div>
    </div>
  );
};

export default AnalyticsBanner;