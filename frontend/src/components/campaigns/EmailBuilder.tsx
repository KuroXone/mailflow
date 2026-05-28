'use client';

import { useState } from 'react';
import { Code, Eye, Smartphone, Monitor } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { cn } from '@/lib/utils';

interface EmailBuilderProps {
  value: string;
  onChange: (html: string) => void;
}

const BLOCKS = [
  { label: 'Header', html: '<div style="background:#3b82f6;padding:32px;text-align:center"><h1 style="color:white;margin:0;font-family:sans-serif">Your Header</h1></div>' },
  { label: 'Text', html: '<div style="padding:24px;font-family:sans-serif;font-size:16px;line-height:1.6;color:#374151"><p>Your text content here. Write a compelling message to your audience.</p></div>' },
  { label: 'Button', html: '<div style="padding:16px;text-align:center"><a href="#" style="background:#3b82f6;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:600;display:inline-block">Click Here</a></div>' },
  { label: 'Image', html: '<div style="padding:16px"><img src="https://via.placeholder.com/600x300" alt="Banner" style="width:100%;border-radius:8px" /></div>' },
  { label: 'Divider', html: '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 24px" />' },
  { label: 'Footer', html: '<div style="background:#f9fafb;padding:24px;text-align:center;font-family:sans-serif;font-size:12px;color:#9ca3af"><p style="margin:0">© 2024 Your Company. <a href="{{unsubscribe_url}}" style="color:#6b7280">Unsubscribe</a></p></div>' },
];

export function EmailBuilder({ value, onChange }: EmailBuilderProps) {
  const [view, setView] = useState<'code' | 'preview'>('preview');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const addBlock = (html: string) => {
    onChange(value + '\n' + html);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('preview')}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition', view === 'preview' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={() => setView('code')}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition', view === 'code' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}
          >
            <Code className="w-3.5 h-3.5" />
            HTML
          </button>
        </div>

        {view === 'preview' && (
          <div className="flex items-center gap-1">
            <button onClick={() => setDevice('desktop')} className={cn('p-1.5 rounded-md text-gray-400 hover:text-gray-600', device === 'desktop' && 'text-blue-600')}>
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setDevice('mobile')} className={cn('p-1.5 rounded-md text-gray-400 hover:text-gray-600', device === 'mobile' && 'text-blue-600')}>
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex" style={{ height: '520px' }}>
        {/* Blocks sidebar */}
        <div className="w-36 border-r border-gray-200 dark:border-gray-700 p-2 overflow-y-auto flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase px-1 mb-2">Blocks</p>
          <div className="space-y-1">
            {BLOCKS.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => addBlock(b.html)}
                className="w-full text-left px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition"
              >
                + {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor/Preview */}
        <div className="flex-1 overflow-hidden">
          {view === 'code' ? (
            <CodeMirror
              value={value}
              onChange={onChange}
              extensions={[html()]}
              theme="light"
              height="520px"
              basicSetup={{ lineNumbers: true, foldGutter: false }}
            />
          ) : (
            <div className="h-full overflow-y-auto bg-gray-50 flex items-start justify-center p-4">
              <div
                className={cn(
                  'bg-white shadow-sm transition-all duration-300',
                  device === 'mobile' ? 'w-[375px]' : 'w-full max-w-2xl',
                )}
              >
                {value ? (
                  <div dangerouslySetInnerHTML={{ __html: value }} />
                ) : (
                  <div className="py-20 text-center text-gray-400">
                    <p className="text-sm">Add blocks from the left panel or switch to HTML mode to start editing</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
