import { SORTING_CODE, type SortingAlgorithmId } from '@/lib/sortingAlgorithms'
import { cn } from '@/lib/utils'
export function CodeHighlighter({
  algorithmId,
  currentLine,
}: {
  algorithmId: SortingAlgorithmId
  currentLine?: number
  theme?: 'dark' | 'light'
}) {
  return (
    <div
      className="max-h-64 min-w-0 overflow-auto rounded-md"
      tabIndex={0}
      role="region"
      aria-label="算法实现代码"
    >
      <pre className="w-max min-w-full text-xs leading-[26px]">
        <code>
          {SORTING_CODE[algorithmId].split('\n').map((line, index) => (
            <span
              key={index}
              className={cn(
                'block rounded-sm px-2',
                currentLine === index + 1 && 'bg-visualizer-accent-muted text-visualizer-accent'
              )}
              aria-current={currentLine === index + 1 ? 'step' : undefined}
            >
              <span
                className="text-muted-foreground mr-4 inline-block w-6 text-right select-none"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              {line}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
