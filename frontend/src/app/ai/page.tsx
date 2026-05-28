'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Wand2, BarChart3, Clock, Loader2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';
import { cn, copyToClipboard } from '@/lib/utils';

type Tab = 'generate' | 'subjects' | 'analyze' | 'timing';

export default function AiPage() {
  const [tab, setTab] = useState<Tab>('generate');
  const [copied, setCopied] = useState('');

  const copy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'generate', label: 'Generate Email', icon: Sparkles },
    { id: 'subjects', label: 'Subject Lines', icon: Wand2 },
    { id: 'analyze', label: 'Analyze Campaign', icon: BarChart3 },
    { id: 'timing', label: 'Best Send Time', icon: Clock },
  ];

  return (
    <>
      <Header title="AI Features" />
      <div className="flex-1 p-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-w-2xl">
          {tab === 'generate' && <GenerateEmail copy={copy} copied={copied} />}
          {tab === 'subjects' && <SubjectLines copy={copy} copied={copied} />}
          {tab === 'analyze' && <AnalyzeCampaign />}
          {tab === 'timing' && <BestSendTime />}
        </div>
      </div>
    </>
  );
}

function GenerateEmail({ copy, copied }: any) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const mut = useMutation({
    mutationFn: () => api.post('/ai/generate-email', { prompt, tone }).then((r) => r.data),
    onError: () => toast.error('Generation failed'),
  });

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Generate marketing email</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Describe your email</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. A promotional email for our summer sale offering 30% off all products to existing customers..."
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['professional', 'friendly', 'urgent', 'playful', 'formal'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={() => mut.mutate()} disabled={!prompt || mut.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate email
          </button>
        </div>
      </div>

      {mut.data && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Subject line</label>
              <button onClick={() => copy(mut.data.subject, 'subject')} className="flex items-center gap-1 text-xs text-blue-600">
                {copied === 'subject' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'subject' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{mut.data.subject}</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Preview text</label>
              <button onClick={() => copy(mut.data.previewText, 'preview')} className="flex items-center gap-1 text-xs text-blue-600">
                {copied === 'preview' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{mut.data.previewText}</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">HTML content</label>
              <button onClick={() => copy(mut.data.htmlContent, 'html')} className="flex items-center gap-1 text-xs text-blue-600">
                {copied === 'html' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy HTML
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <div dangerouslySetInnerHTML={{ __html: mut.data.htmlContent }} className="p-4 text-sm max-h-60 overflow-y-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectLines({ copy, copied }: any) {
  const [context, setContext] = useState('');
  const [count, setCount] = useState(5);
  const mut = useMutation({
    mutationFn: () => api.post('/ai/subject-lines', { context, count }).then((r) => r.data),
    onError: () => toast.error('Generation failed'),
  });

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Generate subject lines</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign context</label>
            <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2} placeholder="Describe your campaign..." className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
              <select value={count} onChange={(e) => setCount(+e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {[3, 5, 10].map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={() => mut.mutate()} disabled={!context || mut.isPending} className="flex items-center gap-2 mt-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Generate
            </button>
          </div>
        </div>
      </div>

      {mut.data?.subjects && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {mut.data.subjects.map((s: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{s.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.type} · ~{s.estimatedOpenRate}% open rate</p>
              </div>
              <button onClick={() => copy(s.text, `s${i}`)} className="p-1.5 text-gray-400 hover:text-blue-600 transition">
                {copied === `s${i}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyzeCampaign() {
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const mut = useMutation({
    mutationFn: () => api.post('/ai/analyze-campaign', { subject, htmlContent: html }).then((r) => r.data),
    onError: () => toast.error('Analysis failed'),
  });

  const SEVERITY_COLORS: Record<string, string> = { high: 'bg-red-50 border-red-200 text-red-700', medium: 'bg-orange-50 border-orange-200 text-orange-700', low: 'bg-yellow-50 border-yellow-200 text-yellow-700' };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Analyze campaign health</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject line</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your email subject" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">HTML content (optional)</label>
            <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={4} placeholder="Paste email HTML..." className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-xs" />
          </div>
          <button onClick={() => mut.mutate()} disabled={!subject || mut.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            Analyze
          </button>
        </div>
      </div>

      {mut.data && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${mut.data.score >= 70 ? 'text-green-600' : mut.data.score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>{mut.data.score}</div>
              <div className="text-xs text-gray-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{mut.data.grade}</div>
              <div className="text-xs text-gray-400">Grade</div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">{mut.data.summary}</p>
            </div>
          </div>
          {mut.data.issues?.map((issue: any, i: number) => (
            <div key={i} className={`p-3 rounded-lg border text-sm ${SEVERITY_COLORS[issue.severity]}`}>
              <p className="font-medium">{issue.message}</p>
              <p className="text-xs mt-1 opacity-75">{issue.fix}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BestSendTime() {
  const [industry, setIndustry] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const mut = useMutation({
    mutationFn: () => api.post('/ai/best-send-time', { industry, audienceTimezone: timezone }).then((r) => r.data),
    onError: () => toast.error('Failed to get recommendations'),
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Best send time recommendation</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. E-commerce, SaaS, Healthcare..." className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Audience timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai'].map((tz) => <option key={tz}>{tz}</option>)}
            </select>
          </div>
          <button onClick={() => mut.mutate()} disabled={!industry || mut.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
            Get recommendation
          </button>
        </div>
      </div>

      {mut.data && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center flex-1">
              <p className="text-xs text-gray-500 mb-1">Best day</p>
              <p className="text-xl font-bold text-green-700">{mut.data.bestDay}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center flex-1">
              <p className="text-xs text-gray-500 mb-1">Best time</p>
              <p className="text-xl font-bold text-blue-700">{mut.data.bestTime}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">{mut.data.insights}</p>
          {mut.data.alternatives?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Alternatives</p>
              <div className="space-y-2">
                {mut.data.alternatives.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-700 w-28">{a.day} {a.time}</span>
                    <span className="text-gray-500">{a.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
