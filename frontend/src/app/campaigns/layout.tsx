'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loadProfile, accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      router.replace('/auth/login');
    } else {
      loadProfile().catch(() => router.replace('/auth/login'));
    }
  }, [accessToken]);

  if (!isAuthenticated && !accessToken) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
