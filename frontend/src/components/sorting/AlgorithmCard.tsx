import Link from 'next/link'
import { Split, Layers, Workflow, Gauge, Shuffle, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface AlgorithmInfo {
  id: string
  name: string
  shortName: string
  description: string
  timeComplexity: {
    best: string
    average: string
    worst: string
  }
  spaceComplexity: string
  stability: '稳定' | '不稳定'
  tags: string[]
}

interface AlgorithmCardProps {
  algorithm: AlgorithmInfo
  href: string
  className?: string
}

export function AlgorithmCard({ algorithm, href, className }: AlgorithmCardProps) {
  const Icon =
    algorithm.id === 'quick'
      ? Split
      : algorithm.id === 'merge'
        ? Layers
        : algorithm.id === 'heap'
          ? Workflow
          : algorithm.id === 'radix'
            ? Gauge
            : Shuffle

  // Dynamic CSS animation for the mini bars (unique animation timings so they don't sync uniformly)
  return (
    <Link
      href={href}
      className={cn("group block outline-none w-full h-full", className)}
      aria-label={`进入 ${algorithm.name}`}
    >
      <div
        className={cn(
          'relative flex h-full flex-col justify-between overflow-hidden rounded-[32px] bg-card p-8 lg:p-10 transition-transform duration-500 will-change-transform',
          'shadow-[0_8px_40px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_16px_60px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-white/5'
        )}
      >
        {/* Subtle Ambient Glow inside Card */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[#007AFF]/0 transition-colors duration-500 group-hover:bg-[#007AFF]/[0.02] dark:group-hover:bg-[#007AFF]/[0.05]" />

        {/* Top Section */}
        <div className="space-y-6 relative z-10 w-full max-w-[85%]">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-zinc-50 shadow-sm transition-transform duration-500 group-hover:-translate-y-2 dark:bg-black">
            <Icon size={24} className="text-[#007AFF]" />
          </div>

          <div>
            <h3 className="mb-2 text-3xl font-black tracking-tight text-foreground transition-colors">
              {algorithm.shortName || algorithm.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black tracking-widest text-[#007AFF]/80 uppercase">
                {algorithm.id} SORT
              </span>
              <div className="h-3 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
              <span className={cn(
                "text-[10px] font-bold tracking-wider uppercase",
                algorithm.stability === '稳定' ? "text-emerald-500" : "text-rose-400"
              )}>
                {algorithm.stability === '稳定' ? 'STABLE' : 'UNSTABLE'}
              </span>
            </div>
          </div>

          <p className="line-clamp-2 text-base font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-sm">
            {algorithm.description}
          </p>
        </div>

        {/* Faux Visualizer Micro Interaction */}
        <div className="absolute right-8 top-10 flex h-10 w-16 items-end justify-between gap-1 opacity-40 transition-opacity duration-300 group-hover:opacity-100">
           <style>{`
             .group:hover .bar-1 { animation: mini-bob 0.8s ease-in-out infinite alternate; }
             .group:hover .bar-2 { animation: mini-bob 1.1s ease-in-out infinite alternate; }
             .group:hover .bar-3 { animation: mini-bob 0.9s ease-in-out infinite alternate; }
             .group:hover .bar-4 { animation: mini-bob 1.2s ease-in-out infinite alternate; }
             @keyframes mini-bob {
               0% { height: 30%; }
               100% { height: 100%; }
             }
           `}</style>
           <div className="bar-1 w-full rounded-t flex-1 bg-zinc-200 dark:bg-zinc-800" style={{ height: '40%' }} />
           <div className="bar-2 w-full rounded-t flex-1 bg-zinc-300 dark:bg-zinc-700" style={{ height: '70%' }} />
           <div className="bar-3 w-full rounded-t flex-1 bg-[#007AFF]" style={{ height: '30%' }} />
           <div className="bar-4 w-full rounded-t flex-1 bg-zinc-200 dark:bg-zinc-800" style={{ height: '50%' }} />
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex items-end justify-between relative z-10 w-full">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="mb-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Time (Avg)
              </span>
              <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {algorithm.timeComplexity.average}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Space
              </span>
              <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {algorithm.spaceComplexity}
              </span>
            </div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-[#007AFF] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_4px_20px_rgba(0,122,255,0.2)] dark:bg-black dark:text-[#007AFF]">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  )
}
