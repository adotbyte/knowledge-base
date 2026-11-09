'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image'; // <-- PRIDĖKITE

function CodeBlockCopyButton({ text }: { text: string }) {
  const t = useTranslations('Components');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 z-10 rounded-md bg-gray-800/80 p-1.5 text-gray-400 opacity-0 transition-colors group-hover:opacity-100 hover:bg-gray-700 hover:text-white"
      title={copied ? t('copied') : t('copy')}
    >
      {copied ? (
        <svg
          className="h-4 w-4 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert prose-a:text-blue-600 md:prose-base dark:prose-a:text-blue-400 max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children, ...props }: any) {
            const codeElement = Array.isArray(children) ? children[0] : children;
            const codeText = codeElement?.props?.children || '';
            const className = codeElement?.props?.className || '';
            const match = /language-(\w+)/.exec(className);
            const language = match ? match[1] : 'text';

            return (
              <div className="group relative my-6">
                <CodeBlockCopyButton text={String(codeText).replace(/\n$/, '')} />
                <SyntaxHighlighter
                  style={vscDarkPlus as any}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#1e1e1e',
                  }}
                >
                  {String(codeText).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },
          code({ inline, className, children, ...props }: any) {
            if (inline) {
              return (
                <code
                  className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-gray-800"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return null;
          },
          // ✅ PAVEIKSLĖLIŲ APDOROJIMAS
          img({ src, alt, ...props }: any) {
            if (!src) return null;
            return (
              <span className="my-4 block">
                <img
                  src={src}
                  alt={alt || 'Paveikslėlis'}
                  className="max-w-full rounded-xl border border-gray-200 dark:border-gray-700"
                  referrerPolicy="no-referrer"
                  {...props}
                />
                {alt && (
                  <span className="mt-1 block text-center text-xs text-gray-500 dark:text-gray-400">
                    {alt}
                  </span>
                )}
              </span>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
