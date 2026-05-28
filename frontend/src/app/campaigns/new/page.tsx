'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { EmailBuilder } from '@/components/campaigns/EmailBuilder';
import { api } from '@/lib/api';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  subject: z.string().min(1, 'Subject required'),
  previewText: z.string().optional(),
  fromName: z.string().min(1, 'From name required'),
  fromEmail: z.string().email('Invalid email'),
  replyTo: z.string().email().optional().or(z.literal('')),
  listId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'builder'>('details');

  const { data: lists } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: () => api.get('/contacts/lists').then((r) => r.data),
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fromName: 'My Company', fromEmail: 'hello@mycompany.com' },
  });

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/campaigns', data),
    onSuccess: (res) => {
      toast.success('Campaign created!');
      router.push(`/campaigns/${res.data.id}`);
    },
    onError: () => toast.error('Failed to create campaign'),
  });

  const onSubmit = (data: FormData) => {
    createMut.mutate({ ...data, htmlContent, textContent });
  };

  const generateWithAI = async () => {
    const subject = watch('subject');
    if (!subject) { toast.error('Enter a subject first'); return; }
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-email', { prompt: subject });
      setHtmlContent(data.htmlContent || '');
      setTextContent(data.textContent || '');
      setValue('subject', data.subject || subject);
      setValue('previewText', data.previewText || '');
      toast.success('Email generated!');
      setStep('builder');
    } catch {
      toast.error('AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <Header
        title="New Campaign"
        actions={
          <Link href="/campaigns" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <div className="flex-1 p-6 max-w-3xl">
        {/* Step tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
          {(['details', 'builder'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                step === s ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'details' ? '1. Details' : '2. Content'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 'details' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Campaign name</label>
                  <input {...register('name')} placeholder="e.g. Summer Sale 2024" className="input" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="col-span-2">
                  <div className="flex items-end justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject line</label>
                    <button type="button" onClick={generateWithAI} disabled={aiLoading} className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium">
                      {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Generate with AI
                    </button>
                  </div>
                  <input {...register('subject')} placeholder="Your subject line here" className="input" />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Preview text</label>
                  <input {...register('previewText')} placeholder="Brief summary shown in inbox..." className="input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">From name</label>
                  <input {...register('fromName')} className="input" />
                  {errors.fromName && <p className="text-red-500 text-xs mt-1">{errors.fromName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">From email</label>
                  <input {...register('fromEmail')} type="email" className="input" />
                  {errors.fromEmail && <p className="text-red-500 text-xs mt-1">{errors.fromEmail.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reply to (optional)</label>
                  <input {...register('replyTo')} type="email" placeholder="reply@company.com" className="input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact list</label>
                  <select {...register('listId')} className="input">
                    <option value="">Select a list...</option>
                    {lists?.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.contactCount} contacts)</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="button" onClick={() => setStep('builder')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition">
                Next: Design email
              </button>
            </div>
          )}

          {step === 'builder' && (
            <div className="space-y-4">
              <EmailBuilder value={htmlContent} onChange={setHtmlContent} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setStep('details')} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Back
                </button>
                <button type="submit" disabled={createMut.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-lg transition text-sm">
                  {createMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save campaign
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </>
  );
}
