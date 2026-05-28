'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500">We sent a password reset link to your email address.</p>
          <Link href="/auth/login" className="inline-block mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot your password?</h1>
          <p className="text-gray-500 mt-1">Enter your email and we&apos;ll send a reset link</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send reset link
            </button>
          </form>
        </div>

        <Link href="/auth/login" className="flex items-center justify-center gap-1 mt-6 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
