'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Server, CheckCircle2, Trash2, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';

export default function SmtpPage() {
  const [showAdd, setShowAdd] = useState(false);
  const qc = useQueryClient();
  const { data: configs, isLoading } = useQuery({
    queryKey: ['smtp'],
    queryFn: () => api.get('/smtp').then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/smtp/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['smtp'] }); toast.success('Deleted'); },
  });

  const testMut = useMutation({
    mutationFn: (id: string) => api.post(`/smtp/${id}/test`),
    onSuccess: () => toast.success('Connection successful!'),
    onError: () => toast.error('Connection failed. Check credentials.'),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>();

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/smtp', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['smtp'] }); setShowAdd(false); reset(); toast.success('SMTP added!'); },
    onError: () => toast.error('Failed to add SMTP'),
  });

  return (
    <>
      <Header
        title="SMTP Configuration"
        actions={
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" />
            Add SMTP
          </button>
        }
      />

      <div className="flex-1 p-6">
        {isLoading && <p className="text-sm text-gray-400">Loading...</p>}
        {!isLoading && configs?.length === 0 && (
          <div className="text-center py-20">
            <Server className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No SMTP configured</p>
            <p className="text-gray-400 text-sm mt-1">Add your SMTP provider to start sending</p>
            <button onClick={() => setShowAdd(true)} className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              <Plus className="w-4 h-4" /> Add SMTP
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-3xl">
          {configs?.map((c: any) => (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    {c.isDefault && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{c.host}:{c.port}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => testMut.mutate(c.id)} disabled={testMut.isPending} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-xs">
                    Test
                  </button>
                  <button onClick={() => deleteMut.mutate(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <p>From: {c.fromName} &lt;{c.fromEmail}&gt;</p>
                <p>Username: {c.username}</p>
                <p>Encryption: {c.encryption}</p>
              </div>
              <div className={`mt-3 flex items-center gap-1.5 text-xs ${c.isVerified ? 'text-green-600' : 'text-orange-500'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {c.isVerified ? 'Connected' : 'Not tested'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-5">Add SMTP provider</h2>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input {...register('name', { required: true })} placeholder="e.g. Mailgun Production" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                  <input {...register('host', { required: true })} placeholder="smtp.mailgun.org" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input {...register('port', { required: true, valueAsNumber: true })} type="number" defaultValue={587} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input {...register('username', { required: true })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input {...register('password', { required: true })} type="password" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From name</label>
                  <input {...register('fromName', { required: true })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From email</label>
                  <input {...register('fromEmail', { required: true })} type="email" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowAdd(false); reset(); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                <button type="submit" disabled={isSubmitting || createMut.isPending} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium transition">
                  {(isSubmitting || createMut.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
