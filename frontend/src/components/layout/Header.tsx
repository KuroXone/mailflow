'use client';

import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {actions}

        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          {getInitials(user?.name || 'U')}
        </div>
      </div>
    </header>
  );
}
