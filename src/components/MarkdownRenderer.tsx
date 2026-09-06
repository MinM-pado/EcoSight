import React from 'react';
import Markdown from 'react-markdown';

interface Props {
  content: string;
  className?: string;
  isUser?: boolean;
}

/**
 * Remark plugin to resolve CommonMark delimiter issues with Korean particles.
 * CommonMark fails to parse bold closing delimiters `**` when preceded by punctuation
 * (e.g. `)'` or `)`) and directly followed by Korean Hangul characters (e.g. `의`, `은`, `는`, `이`, `가`).
 * This plugin traverses text nodes and converts any unparsed `**...**` or `__...__` into proper `strong` AST nodes.
 */
function remarkKoreanDelimiters() {
  return (tree: any) => {
    function visit(node: any, parent: any, index: any) {
      if (node.type === 'text' && typeof node.value === 'string') {
        const boldRegex = /(\*\*|__)([^*_]+?)\1/g;
        if (boldRegex.test(node.value)) {
          const parts: any[] = [];
          let lastIndex = 0;
          boldRegex.lastIndex = 0;
          let match;
          while ((match = boldRegex.exec(node.value)) !== null) {
            if (match.index > lastIndex) {
              parts.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
            }
            parts.push({
              type: 'strong',
              children: [{ type: 'text', value: match[2] }]
            });
            lastIndex = match.index + match[0].length;
          }
          if (lastIndex < node.value.length) {
            parts.push({ type: 'text', value: node.value.slice(lastIndex) });
          }
          if (parts.length > 0 && parent && typeof index === 'number') {
            parent.children.splice(index, 1, ...parts);
            return index + parts.length;
          }
        }
      }
      if (node.children && Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          const nextIndex = visit(node.children[i], node, i);
          if (typeof nextIndex === 'number') {
            i = nextIndex - 1;
          }
        }
      }
    }
    visit(tree, null, null);
  };
}

export const MarkdownRenderer: React.FC<Props> = ({ content, className = '', isUser = false }) => {
  if (!content) return null;

  return (
    <div className={`markdown-content leading-relaxed text-xs sm:text-sm ${className}`}>
      <Markdown
        remarkPlugins={[remarkKoreanDelimiters]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed break-words">{children}</p>
          ),
          strong: ({ children }) => (
            <strong
              className={`font-bold ${
                isUser
                  ? 'text-white font-semibold'
                  : 'text-amber-300 font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'
              }`}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 space-y-1 my-2 text-slate-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 space-y-1 my-2 text-slate-300">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-300 font-mono text-[11px] border border-slate-700/60">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-red-500/60 pl-3 my-2 text-slate-300 italic bg-red-950/20 py-1.5 rounded-r">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="text-sm sm:text-base font-black text-white mt-3 mb-1.5 border-b border-slate-700/60 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs sm:text-sm font-bold text-white mt-2.5 mb-1 flex items-center gap-1.5">
              <span className="text-red-400">✦</span> {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-amber-300 mt-2 mb-1">{children}</h3>
          ),
          hr: () => <hr className="my-3 border-slate-800" />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
