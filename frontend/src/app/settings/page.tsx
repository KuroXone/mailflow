'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, User, Building2, CreditCard, Users, Key } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'organization' | 'team' | 'billing' | 'api';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 border-r border-gray-200 dark:border-gray-800 p-3 flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition mb-0.5',
                tab === t.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'profile' && <ProfileSettings />}
          {tab === 'organization' && <OrgSettings />}
          {tab === 'team' && <TeamSettings />}
          {tab === 'billing' && <BillingSettings />}
          {tab === 'api' && <ApiKeys />}
        </div>
      </div>
    </>
  );
}

function ProfileSettings() {
  const { user, loadProfile } = useAuthStore();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name, timezone: 'UTC' },
  });

  const onSubmit = async (data: any) => {
    try {
      await api.put('/users/me', data);
      await loadProfile();
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const changePassword = async () => {
    setChangingPw(true);
    try {
      await api.post('/users/me/change-password', { currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed. Please log in again.');
      setCurrentPw(''); setNewPw('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input {...register('name')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input value={user?.email} disabled className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400" />
          </div>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save changes
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Change password</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={changePassword} disabled={changingPw || !currentPw || !newPw} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {changingPw && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Change password
          </button>
        </div>
      </div>
    </div>
  );
}

function OrgSettings() {
  const { currentOrg } = useAuthStore();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: currentOrg?.name },
  });

  const onSubmit = async (data: any) => {
    try {
      await api.put('/organizations/current', data);
      toast.success('Organization updated');
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Organization</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization name</label>
          <input {...register('name')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save
        </button>
      </form>
    </div>
  );
}

function TeamSettings() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  const { data: members } = useQuery({
    queryKey: ['org-members'],
    queryFn: () => api.get('/organizations/members').then((r) => r.data),
  });

  const inviteMut = useMutation({
    mutationFn: () => api.post('/organizations/invite', { email, role }),
    onSuccess: () => { toast.success('Invite sent!'); setEmail(''); },
    onError: () => toast.error('Failed to send invite'),
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Team members</h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {members?.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{m.user?.name}</p>
                <p className="text-xs text-gray-400">{m.user?.email}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Invite member</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="flex gap-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="colleague@company.com" className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button onClick={() => inviteMut.mutate()} disabled={!email || inviteMut.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {inviteMut.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Send invite
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  const { data: subscription } = useQuery({
    queryKey: ['billing-subscription'],
    queryFn: () => api.get('/billing/subscription').then((r) => r.data),
  });

  const { data: usage } = useQuery({
    queryKey: ['billing-usage'],
    queryFn: () => api.get('/billing/usage').then((r) => r.data),
  });

  const { data: invoices } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: () => api.get('/billing/invoices').then((r) => r.data),
  });

  const portalMut = useMutation({
    mutationFn: () => api.post('/billing/portal', { returnUrl: window.location.href }).then((r) => r.data),
    onSuccess: (data) => { window.location.href = data.url; },
    onError: () => toast.error('Failed to open billing portal'),
  });

  const PLANS = ['FREE', 'STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'];
  const checkoutMut = useMutation({
    mutationFn: (plan: string) => api.post('/billing/checkout', { plan, returnUrl: window.location.href }).then((r) => r.data),
    onSuccess: (data) => { window.location.href = data.url; },
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Current plan</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-900 text-lg">{subscription?.plan || 'FREE'}</p>
              <p className="text-sm text-gray-400">{subscription?.status}</p>
            </div>
            <button onClick={() => portalMut.mutate()} disabled={portalMut.isPending} className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
              Manage subscription
            </button>
          </div>
          {usage && (
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Contacts</span>
                  <span>{usage.contacts} / {usage.limits.contacts === -1 ? '∞' : usage.limits.contacts}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: usage.limits.contacts === -1 ? '0%' : `${Math.min((usage.contacts / usage.limits.contacts) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Emails this month</span>
                  <span>{usage.emailsSent} / {usage.limits.emailsPerMonth === -1 ? '∞' : usage.limits.emailsPerMonth}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: usage.limits.emailsPerMonth === -1 ? '0%' : `${Math.min((usage.emailsSent / usage.limits.emailsPerMonth) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {invoices?.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Invoices</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">${inv.amount} {inv.currency}</p>
                  <p className="text-xs text-gray-400">{inv.createdAt}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${inv.status === 'PAID' ? 'text-green-600' : 'text-red-500'}`}>{inv.status}</span>
                  {inv.invoiceUrl && <a href={inv.invoiceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ApiKeys() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState('');

  const { data: keys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.get('/organizations/api-keys').then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: () => api.post('/organizations/api-keys', { name, permissions: ['read', 'write'] }).then((r) => r.data),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['api-keys'] }); setNewKey(data.key); setName(''); toast.success('Key created!'); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/organizations/api-keys/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Deleted'); },
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">API Keys</h2>

        {newKey && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-medium text-green-800 mb-2">Save this key — it won&apos;t be shown again</p>
            <code className="text-xs bg-white border border-green-300 rounded-lg px-3 py-2 block break-all">{newKey}</code>
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name (e.g. Production)" className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={() => createMut.mutate()} disabled={!name || createMut.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {createMut.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {keys?.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No API keys</p>}
          {keys?.map((k: any) => (
            <div key={k.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{k.name}</p>
                <code className="text-xs text-gray-400">{k.keyPrefix}...</code>
              </div>
              <button onClick={() => deleteMut.mutate(k.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
