'use client';

import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Send, Users, MousePointerClick, TrendingUp, Plus, ArrowUpRight, Mail } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';
import { formatNumber, formatPercent, formatRelative } from '@/lib/utils';
import Link from 'next/link';

function StatCard({ label, value, change, icon: Icon, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          <ArrowUpRight className={`w-3 h-3 ${change < 0 && 'rotate-180'}`} />
          {Math.abs(change)}% vs last period
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data),
  });

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns-recent'],
    queryFn: () => api.get('/campaigns?limit=5').then((r) => r.data),
  });

  return (
    <>
      <Header
        title="Dashboard"
        actions={
          <Link href="/campaigns/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            New campaign
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Emails sent" value={formatNumber(stats?.totalSent || 0)} change={stats?.sentChange} icon={Send} color="bg-blue-500" />
          <StatCard label="Open rate" value={formatPercent(stats?.avgOpenRate || 0)} change={stats?.openRateChange} icon={Mail} color="bg-green-500" />
          <StatCard label="Click rate" value={formatPercent(stats?.avgClickRate || 0)} change={stats?.clickRateChange} icon={MousePointerClick} color="bg-purple-500" />
          <StatCard label="Total contacts" value={formatNumber(stats?.totalContacts || 0)} change={stats?.contactsChange} icon={Users} color="bg-orange-500" />
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Email performance (30 days)</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Opens</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Clicks</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.timeline || []}>
              <defs>
                <linearGradient id="opens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="opens" stroke="#3b82f6" strokeWidth={2} fill="url(#opens)" />
              <Area type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} fill="url(#clicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent campaigns */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent campaigns</h2>
            <Link href="/campaigns" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {campaigns?.data?.length === 0 && (
              <div className="px-5 py-10 text-center text-gray-400">
                <Send className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No campaigns yet. <Link href="/campaigns/new" className="text-blue-600 hover:underline">Create your first</Link></p>
              </div>
            )}
            {campaigns?.data?.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${c.status === 'SENT' ? 'bg-green-500' : c.status === 'SENDING' ? 'bg-blue-500 animate-pulse' : c.status === 'DRAFT' ? 'bg-gray-400' : 'bg-orange-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-500">
                  {c.analytics && (
                    <>
                      <span>{formatPercent(c.analytics.openRate)} opens</span>
                      <span>{formatPercent(c.analytics.clickRate)} clicks</span>
                    </>
                  )}
                  <span>{formatRelative(c.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
