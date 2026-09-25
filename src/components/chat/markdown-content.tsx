"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "cn";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-4 mb-2 font-heading text-xl tracking-tight text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 font-heading text-lg tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-3 mb-1.5 font-heading text-base tracking-tight text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-1 text-sm font-semibold text-foreground first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-2 text-sm leading-relaxed text-foreground first:mt-0 last:mb-0">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground underline decoration-foreground/35 underline-offset-2 transition-colors hover:decoration-foreground"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="text-muted-foreground line-through">{children}</del>
  ),
  ul: ({ children }) => (
    <ul className="my-2 flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed first:mt-0 last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 flex list-decimal flex-col gap-1 pl-5 text-sm leading-relaxed first:mt-0 last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-sm leading-relaxed text-muted-foreground first:mt-0 last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-border" />,
  table: ({ children }) => (
    <div className="my-3 w-full overflow-x-auto first:mt-0 last:mb-0">
      <table className="w-full border-collapse caption-bottom text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-2 py-1.5 text-left align-middle font-medium whitespace-nowrap text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 align-middle text-foreground">{children}</td>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-md border border-border bg-card px-3 py-2 font-mono text-xs leading-relaxed first:mt-0 last:mb-0">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return <code className={cn("font-mono text-xs", className)}>{children}</code>;
    }
    return (
      <code className="rounded-sm border border-border bg-card px-1 py-0.5 font-mono text-[0.8em]">
        {children}
      </code>
    );
  },
};

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content) return null;

  return (
    <div className={cn("text-sm leading-relaxed", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
