'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import LightboxImage from '@/components/LightboxImage'; // <-- PRIDĖTA

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
      className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-md bg-gray-800/80 px-2 py-1 text-xs text-gray-300 opacity-70 transition-all hover:bg-gray-700 hover:text-white hover:opacity-100"
      title={copied ? t('copied') : t('copy')}
    >
      {copied ? (
        <>
          <svg
            className="h-3.5 w-3.5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{t('copied')}</span>
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>{t('copy')}</span>
        </>
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
          // ✅ PAKEISTA DALIS
          img({ src, alt, ...props }: any) {
            if (!src) return null;
            return (
              <span className="my-4 block">
                <LightboxImage src={src} alt={alt} width={props.width} height={props.height} />
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
