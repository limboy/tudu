import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

export function MarkdownView({
  source,
  className,
}: {
  source: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'prose-sm max-w-none text-foreground',
        '[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
        '[&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mb-2',
        '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2',
        '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2',
        '[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded',
        '[&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-2',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
        '[&_a]:text-primary [&_a]:underline',
        '[&_table]:w-full [&_table]:text-sm [&_table]:my-2',
        '[&_th]:text-left [&_th]:border-b [&_th]:py-1 [&_th]:px-2',
        '[&_td]:border-b [&_td]:py-1 [&_td]:px-2',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  )
}
