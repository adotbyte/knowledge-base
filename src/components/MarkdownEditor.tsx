'use client';

import { useTheme } from 'next-themes';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Rašykite čia...',
  minHeight = '300px',
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <CodeMirror
        value={value}
        height={minHeight}
        theme={isDark ? oneDark : 'light'}
        extensions={[
          markdown({
            base: markdownLanguage,
            codeLanguages: languages, // ✅ Paryškina kodą Markdown viduje (pvz., ```bash, ```nginx)
          }),
        ]}
        onChange={onChange}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          autocompletion: true,
        }}
        className="text-sm"
      />
    </div>
  );
}
