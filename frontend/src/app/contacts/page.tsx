'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, Search, Tag, Trash2, Download, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';
import { formatDate, formatRelative } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  UNSUBSCRIBED: 'bg-gray-100 text-gray-600',
  BOUNCED: 'bg-red-100 text-red-600',
  COMPLAINED: 'bg-orange-100 text-orange-700',
};

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', search, status, page],
    queryFn: () => api.get('/contacts', { params: { search, status, page, limit: 50 } }).then((r) => r.data),
  });

  const { data: lists } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: () => api.get('/contacts/lists').then((r) => r.data),
  });

  const importMut = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return api.post('/contacts/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); toast.success('Import started!'); setShowImport(false); },
    onError: () => toast.error('Import failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/contacts/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); toast.success('Deleted'); },
  });

  return (
    <>
      <Header
        title="Contacts"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(true)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              <Plus className="w-4 h-4" />
              Add contact
            </button>
          </div>
        }
      />

      <div className="flex-1 p-6 flex gap-5">
        {/* Lists sidebar */}
        <div className="w-52 flex-shrink-0 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">Lists</p>
          <button
            onClick={() => setStatus('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${!status ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <span className="flex items-center gap-2"><Users className="w-4 h-4" />All contacts</span>
            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{data?.total || 0}</span>
          </button>
          {lists?.map((l: any) => (
            <button key={l.id} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center justify-between transition">
              <span>{l.name}</span>
              <span className="text-xs text-gray-400">{l.contactCount}</span>
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              <option value="">All statuses</option>
              {['ACTIVE', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Tags</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Added</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {isLoading && <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>}
                {!isLoading && data?.data?.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-16">
                    <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No contacts yet</p>
                    <p className="text-gray-400 text-sm mt-1">Import a CSV or add contacts manually</p>
                  </td></tr>
                )}
                {data?.data?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {c.tags?.map((t: string) => (
                          <span key={t} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{formatDate(c.createdAt)}</td>
                    <td className="px-3 py-3.5">
                      <button onClick={() => deleteMut.mutate(c.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Import contacts from CSV</h2>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">Click to select a CSV file</p>
              <p className="text-xs text-gray-400 mt-1">Columns: email, firstName, lastName, tags</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importMut.mutate(file);
            }} />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowImport(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
