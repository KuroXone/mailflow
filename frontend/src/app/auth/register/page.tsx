'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Building2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  orgName: z.string().min(2, 'Organization name too short'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const register_ = useAuthStore((s) => s.register);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await register_(data.name, data.email, data.password, data.orgName);
      toast.success('Account created! Please verify your email.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 mt-1">Start sending better emails today</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name', label: 'Full name', placeholder: 'John Doe', type: 'text', Icon: User },
              { name: 'orgName', label: 'Organization name', placeholder: 'Acme Inc.', type: 'text', Icon: Building2 },
              { name: 'email', label: 'Work email', placeholder: 'you@company.com', type: 'email', Icon: Mail },
              { name: 'password', label: 'Password', placeholder: '8+ characters', type: 'password', Icon: Lock },
            ].map(({ name, label, placeholder, type, Icon }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register(name as keyof FormData)}
                    type={type}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                {errors[name as keyof FormData] && (
                  <p className="text-red-500 text-xs mt-1">{errors[name as keyof FormData]?.message}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition mt-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create account
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
