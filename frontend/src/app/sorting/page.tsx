'use client'

import React, { useRef } from 'react'
import { AlgorithmCard } from '@/components/sorting/AlgorithmCard'
import { SORTING_ALGORITHMS } from '@/lib/sortingAlgorithms'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SortingPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo('.reveal', 
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'all',
        }
      )
    },
    { scope: containerRef }
  )

  return (
    <main ref={containerRef} className="relative min-h-screen bg-background text-foreground pb-32 pt-24 overflow-hidden transition-colors duration-500">
      {/* Pure solid background, no grid per user request */}
      <div className="pointer-events-none absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-[#007AFF]/5 opacity-80 blur-[130px] dark:bg-[#007AFF]/10" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Fluid Primary Header Section */}
        <header className="mb-24 pt-16 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="reveal mb-8 inline-flex items-center gap-2 rounded-full border border-[#007AFF]/20 bg-[#007AFF]/5 px-4 py-1.5 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#007AFF] shadow-[0_0_8px_rgba(0,122,255,0.8)]" />
              <span className="text-[12px] font-semibold tracking-wide text-[#007AFF]">
                Algorithm Index
              </span>
            </div>
            <h1 className="reveal text-[3.5rem] leading-[1.05] font-black tracking-tight text-foreground sm:text-[4.5rem] lg:text-[5rem]">
              引擎级算法沙盘。
            </h1>
          </div>
          <p className="reveal max-w-lg mb-2 text-lg font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
            通过高频阵列堆栈刷新，实时拦截并展现每一种排序算法底层调度所带来的微小性能起伏。
          </p>
        </header>

        {/* Algorithm Structured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {SORTING_ALGORITHMS.map((algo) => (
            <div key={algo.id} className="reveal">
              <AlgorithmCard algorithm={algo} href={`/sorting/${algo.id}`} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
