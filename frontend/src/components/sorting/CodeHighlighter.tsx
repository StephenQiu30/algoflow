import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { SORTING_CODE, SortingAlgorithmId } from '@/lib/sortingAlgorithms'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface CodeHighlighterProps {
  algorithmId: SortingAlgorithmId
  currentLine?: number
  theme?: 'dark' | 'light'
}

export function CodeHighlighter({
  algorithmId,
  currentLine,
}: CodeHighlighterProps) {
  const code = SORTING_CODE[algorithmId] || '// No code available'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] bg-card border border-transparent shadow-[0_8px_40px_rgba(0,0,0,0.03)] transition-all duration-500 dark:border-white/5 dark:shadow-none">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-900 dark:bg-zinc-900/20">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="ml-2 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
            伪代码实现
          </span>
        </div>
      </div>

      {/* Forcing a dark, high-contrast container for the code for professional "Editor" look */}
      <div className="flex min-h-0 flex-1 flex-col bg-[#1e1e1e] dark:bg-zinc-950">
        <ScrollArea className="flex-1">
          <div className="relative py-4">
            <SyntaxHighlighter
              language="javascript"
              style={atomDark}
              customStyle={{
                margin: 0,
                padding: '1.25rem 1.5rem',
                fontSize: '0.85rem',
                lineHeight: '1.7',
                backgroundColor: 'transparent',
                fontFamily: 'JetBrains Mono, Menlo, monospace',
              }}
              showLineNumbers
              wrapLines
              lineProps={lineNumber => {
                const isHigh = lineNumber === currentLine
                return {
                  style: {
                    display: 'block',
                    backgroundColor: isHigh ? 'rgba(0, 122, 255, 0.15)' : 'transparent',
                    borderLeft: isHigh ? '3px solid #007AFF' : '3px solid transparent',
                    paddingLeft: isHigh ? 'calc(1.25rem - 3px)' : '1.25rem',
                    transition: 'all 0.3s ease',
                    // Removed the aggressive fading/blurring that caused unreadability
                    opacity: isHigh ? 1 : 0.85,
                  },
                }
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
          <ScrollBar className="bg-white/10" />
        </ScrollArea>
      </div>
    </div>
  )
}
