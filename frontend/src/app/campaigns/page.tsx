'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Send, Clock, FileText, Pause, Trash2, Copy, MoreHorizontal, Search } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';
import { formatDateTime, formatNumber, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SCHEDULED: 'bg-blue-50 text-blue-700',
  SENDING: 'bg-yellow-50 text-yellow-700',
  SENT: 'bg-green-50 text-green-700',
  PAUSED: 'bg-orange-50 text-orange-700',
  CANCELLED: 'bg-red-50 text-red-600',
};

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', search, status],
    queryFn: () => api.get('/campaigns', { params: { search, status } }).then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Deleted'); },
  });

  const duplicateMut = useMutation({
    mutationFn: (id: string) => api.post(`/campaigns/${id}/duplicate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Duplicated'); },
  });

  return (
    <>
      <Header
        title="Campaigns"
        actions={
          <Link href="/campaigns/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" />
            New campaign
          </Link>
        }
      />

      <div className="flex-1 p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            {['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Campaign</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Sent</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Opens</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Clicks</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Date</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
              )}
              {!isLoading && data?.data?.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Send className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No campaigns yet</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first campaign to get started</p>
                    <Link href="/campaigns/new" className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                      <Plus className="w-4 h-4" /> New campaign
                    </Link>
                  </td>
                </tr>
              )}
              {data?.data?.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link href={`/campaigns/${c.id}`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600 text-sm">{c.name}</Link>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{c.subject}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_STYLES[c.status] || 'bg-gray-100 text-gray-600')}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{formatNumber(c.analytics?.sent || 0)}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{formatPercent(c.analytics?.openRate || 0)}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{formatPercent(c.analytics?.clickRate || 0)}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">{formatDateTime(c.createdAt)}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => duplicateMut.mutate(c.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition" title="Duplicate">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMut.mutate(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
