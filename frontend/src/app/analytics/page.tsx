'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';
import { formatNumber, formatPercent } from '@/lib/utils';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [range, setRange] = useState('30');

  const { data: dashboard } = useQuery({
    queryKey: ['analytics-dashboard', range],
    queryFn: () => api.get('/analytics/dashboard', { params: { days: range } }).then((r) => r.data),
  });

  const StatCard = ({ label, value, sub }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  return (
    <>
      <Header
        title="Analytics"
        actions={
          <select value={range} onChange={(e) => setRange(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        }
      />

      <div className="flex-1 p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-5 gap-4">
          <StatCard label="Total sent" value={formatNumber(dashboard?.totalSent || 0)} />
          <StatCard label="Delivered" value={formatPercent(dashboard?.deliveryRate || 0)} sub="delivery rate" />
          <StatCard label="Opened" value={formatPercent(dashboard?.avgOpenRate || 0)} sub="open rate" />
          <StatCard label="Clicked" value={formatPercent(dashboard?.avgClickRate || 0)} sub="click rate" />
          <StatCard label="Unsubscribed" value={formatPercent(dashboard?.unsubRate || 0)} sub="unsub rate" />
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Engagement over time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dashboard?.timeline || []}>
              <defs>
                <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOpens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} fill="url(#gSent)" name="Sent" />
              <Area type="monotone" dataKey="opens" stroke="#22c55e" strokeWidth={2} fill="url(#gOpens)" name="Opens" />
              <Area type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} fill="none" name="Clicks" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Device breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Device breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dashboard?.deviceBreakdown || []} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {(dashboard?.deviceBreakdown || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top campaigns */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top campaigns</h2>
            <div className="space-y-3">
              {(dashboard?.topCampaigns || []).map((c: any) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${c.openRate}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 flex-shrink-0">{formatPercent(c.openRate)}</span>
                </div>
              ))}
              {!dashboard?.topCampaigns?.length && <p className="text-sm text-gray-400 text-center py-8">No data yet</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
