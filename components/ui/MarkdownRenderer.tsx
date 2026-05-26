'use client';

// components/ui/MarkdownRenderer.tsx
// Renders Markdown content with syntax highlighting and GFM support.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useState } from 'react';

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose-portfolio ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Code blocks with copy button
          pre({ children, ...props }) {
            return <CodeBlock {...props}>{children}</CodeBlock>;
          },
          // Open external links in new tab
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Images with rounded corners
          img({ src, alt, ...props }) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt ?? ''}
                className="rounded-lg max-w-full"
                loading="lazy"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Code block with a copy button
function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  function getTextContent(node: React.ReactNode): string {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (node !== null && typeof node === 'object' && 'props' in node) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      return getTextContent(el.props.children);
    }
    return '';
  }

  async function handleCopy() {
    const text = getTextContent(children);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group">
      <pre {...props} className="overflow-x-auto">
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-mono text-on-surface-variant bg-surface-container border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}
