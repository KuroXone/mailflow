'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Send, Users, BarChart3, Globe, Server,
  Zap, Sparkles, Settings, ChevronDown, Plus, Mail,
  CreditCard, LogOut
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaigns', label: 'Campaigns', icon: Send },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/automations', label: 'Automations', icon: Zap },
  { href: '/ai', label: 'AI Features', icon: Sparkles },
];

const INFRA_ITEMS = [
  { href: '/domains', label: 'Domains', icon: Globe },
  { href: '/smtp', label: 'SMTP', icon: Server },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, currentOrg, orgs, logout, switchOrg } = useAuthStore();
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        pathname === href || pathname.startsWith(href + '/')
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </Link>
  );

  return (
    <aside className="w-60 flex-shrink-0 h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">MailFlow</span>
        </div>
      </div>

      {/* Org switcher */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setOrgMenuOpen(!orgMenuOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(currentOrg?.name || 'O')}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentOrg?.name}</span>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', orgMenuOpen && 'rotate-180')} />
        </button>

        {orgMenuOpen && (
          <div className="mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => { switchOrg(org.id); setOrgMenuOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2',
                  org.id === currentOrg?.id && 'bg-blue-50 dark:bg-blue-950 text-blue-700',
                )}
              >
                <div className="w-5 h-5 bg-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(org.name)}
                </div>
                <span className="truncate">{org.name}</span>
              </button>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-700">
              <Link href="/settings/team" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Plus className="w-4 h-4" />
                New organization
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => <NavLink key={item.href} {...item} />)}

        <div className="pt-3 pb-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Infrastructure</p>
        </div>
        {INFRA_ITEMS.map((item) => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-0.5">
        <Link href="/settings" className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900',
          pathname.startsWith('/settings') && 'bg-blue-50 text-blue-700',
        )}>
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <Link href="/settings/billing" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
          <CreditCard className="w-4 h-4" />
          Billing
        </Link>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(user?.name || 'U')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={() => logout()} className="p-1 hover:text-red-500 text-gray-400 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
