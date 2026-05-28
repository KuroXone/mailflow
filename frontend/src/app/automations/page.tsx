'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Zap, Play, Pause, Trash2, Users, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';
import { formatRelative, cn } from '@/lib/utils';

export default function AutomationsPage() {
  const qc = useQueryClient();

  const { data: automations, isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: () => api.get('/automations').then((r) => r.data),
  });

  const activateMut = useMutation({
    mutationFn: (id: string) => api.post(`/automations/${id}/activate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['automations'] }); toast.success('Automation activated'); },
  });

  const pauseMut = useMutation({
    mutationFn: (id: string) => api.post(`/automations/${id}/pause`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['automations'] }); toast.success('Automation paused'); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/automations/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['automations'] }); toast.success('Deleted'); },
  });

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700',
    PAUSED: 'bg-orange-50 text-orange-700',
    DRAFT: 'bg-gray-100 text-gray-600',
  };

  return (
    <>
      <Header
        title="Automations"
        actions={
          <Link href="/automations/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" />
            New automation
          </Link>
        }
      />

      <div className="flex-1 p-6">
        {isLoading && <p className="text-sm text-gray-400">Loading...</p>}
        {!isLoading && automations?.length === 0 && (
          <div className="text-center py-20">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No automations yet</p>
            <p className="text-gray-400 text-sm mt-1">Create automated email sequences triggered by user actions</p>
            <Link href="/automations/new" className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              <Plus className="w-4 h-4" /> Create automation
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          {automations?.map((a: any) => (
            <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <Link href={`/automations/${a.id}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600">{a.name}</Link>
                      <span className={cn('ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full', STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600')}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                  {a.description && <p className="text-xs text-gray-400 mt-1 ml-10">{a.description}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{a._count?.runs || 0} runs</span>
                <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" />Trigger: {a.triggerType}</span>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {a.status === 'ACTIVE' ? (
                  <button onClick={() => pauseMut.mutate(a.id)} className="flex items-center gap-1.5 text-xs text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-lg transition">
                    <Pause className="w-3.5 h-3.5" />Pause
                  </button>
                ) : (
                  <button onClick={() => activateMut.mutate(a.id)} className="flex items-center gap-1.5 text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded-lg transition">
                    <Play className="w-3.5 h-3.5" />Activate
                  </button>
                )}
                <button onClick={() => deleteMut.mutate(a.id)} className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition">
                  <Trash2 className="w-3.5 h-3.5" />Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
