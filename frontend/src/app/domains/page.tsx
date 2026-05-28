'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, CheckCircle2, XCircle, Clock, Globe, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';
import { cn, copyToClipboard } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { icon: any; className: string; label: string }> = {
  PENDING: { icon: Clock, className: 'text-orange-500', label: 'Pending' },
  VERIFIED: { icon: CheckCircle2, className: 'text-green-500', label: 'Verified' },
  FAILED: { icon: XCircle, className: 'text-red-500', label: 'Failed' },
};

export default function DomainsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const qc = useQueryClient();

  const { data: domains, isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => api.get('/domains').then((r) => r.data),
  });

  const addMut = useMutation({
    mutationFn: (domain: string) => api.post('/domains', { domain }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['domains'] });
      setShowAdd(false);
      setNewDomain('');
      setSelectedDomain(res.data);
      toast.success('Domain added. Configure DNS records below.');
    },
    onError: () => toast.error('Failed to add domain'),
  });

  const verifyMut = useMutation({
    mutationFn: (id: string) => api.post(`/domains/${id}/verify`),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: ['domains'] });
      if (res.data.status === 'VERIFIED') toast.success('Domain verified!');
      else toast.error('Verification failed. Check DNS records.');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/domains/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['domains'] }); setSelectedDomain(null); toast.success('Deleted'); },
  });

  const { data: records } = useQuery({
    queryKey: ['domain-records', selectedDomain?.id],
    queryFn: () => api.get(`/domains/${selectedDomain.id}/records`).then((r) => r.data),
    enabled: !!selectedDomain?.id,
  });

  return (
    <>
      <Header
        title="Domains"
        actions={
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" />
            Add domain
          </button>
        }
      />

      <div className="flex-1 p-6 flex gap-5">
        {/* Domain list */}
        <div className="w-72 flex-shrink-0 space-y-2">
          {isLoading && <p className="text-sm text-gray-400 text-center py-8">Loading...</p>}
          {domains?.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No domains yet</p>
              <button onClick={() => setShowAdd(true)} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">Add your first domain</button>
            </div>
          )}
          {domains?.map((d: any) => {
            const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.PENDING;
            const Icon = cfg.icon;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d)}
                className={cn(
                  'w-full text-left p-3 rounded-xl border transition-all',
                  selectedDomain?.id === d.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{d.domain}</span>
                  <Icon className={cn('w-4 h-4', cfg.className)} />
                </div>
                <p className={cn('text-xs mt-1', cfg.className)}>{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* DNS Records panel */}
        {selectedDomain && (
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900">{selectedDomain.domain}</h2>
                <p className="text-sm text-gray-400 mt-0.5">Configure these DNS records at your domain provider</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => verifyMut.mutate(selectedDomain.id)}
                  disabled={verifyMut.isPending}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', verifyMut.isPending && 'animate-spin')} />
                  Verify DNS
                </button>
                <button onClick={() => deleteMut.mutate(selectedDomain.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {records?.map((r: any, i: number) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">{r.type} Record</span>
                    {r.verified ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />Verified</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-orange-500"><Clock className="w-3.5 h-3.5" />Pending</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Host</p>
                      <code className="text-xs bg-white border border-gray-200 px-2 py-1 rounded block">{r.host}</code>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400">Value</p>
                        <button onClick={() => { copyToClipboard(r.value); toast.success('Copied!'); }} className="text-xs text-blue-600 flex items-center gap-1">
                          <Copy className="w-3 h-3" />Copy
                        </button>
                      </div>
                      <code className="text-xs bg-white border border-gray-200 px-2 py-1 rounded block break-all">{r.value}</code>
                    </div>
                  </div>
                  {r.description && <p className="text-xs text-gray-400 mt-2">{r.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {!selectedDomain && domains?.length > 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Select a domain to see DNS records</p>
            </div>
          </div>
        )}
      </div>

      {/* Add domain modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Add sending domain</h2>
            <input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="mail.yourdomain.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyDown={(e) => e.key === 'Enter' && newDomain && addMut.mutate(newDomain)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={() => addMut.mutate(newDomain)} disabled={!newDomain || addMut.isPending} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium transition">
                Add domain
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
