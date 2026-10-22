'use client'

import React, { useRef, memo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PostCard, PostCardSkeleton } from '@/components/blog/post-card'
import { searchPostByPage } from '@/api/search/searchController'
import {
  ArrowRight,
  Terminal,
  Cpu,
  Database,
  ChevronRight,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

// 1. Ant Design Pro Style Left-Right Hero
const HeroSection = memo(() => {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.hero-left>*',
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power3.out', clearProps: 'all' }
      )
      gsap.fromTo(
        '.hero-right',
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.1, clearProps: 'all' }
      )
    },
    { scope: container }
  )

  return (
    <section ref={container} className="relative flex min-h-[75vh] w-full items-center pt-32 pb-20">
      {/* Remove max-w restriction specifically here to match logo alignment on ultra-wide screens */}
      <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-2 xl:gap-24">
        {/* Left Content */}
        <div className="hero-left flex w-full flex-col items-start text-left">
          <div className="border-primary/20 bg-primary/5 mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-sm">
            <span className="bg-primary flex h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,122,255,0.8)]" />
            <span className="text-primary text-[12px] font-semibold tracking-wide">
              Web Render Engine
            </span>
          </div>

          <h1 className="text-foreground max-w-2xl text-[3.5rem] leading-[1.1] font-black tracking-tight sm:text-[4.5rem] md:text-[5rem] lg:text-[4.5rem] xl:text-[5.5rem]">
            认知重塑。
            <br />
            交互新感官。
          </h1>

          <p className="text-muted-foreground mt-8 max-w-xl text-lg leading-relaxed font-medium md:text-xl">
            基于现代工程化标准的算法可视化平台。使用原生性能流体渲染模块，将晦涩的框架时间线降维为每一次精准的调度步进。
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/sorting"
              className="group bg-primary flex h-12 items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#0066CC] hover:shadow-[0_12px_30px_rgba(0,122,255,0.35)] sm:h-14 sm:text-base"
            >
              进入沙盘体验
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/blog"
              className="group border-border bg-card text-foreground hover:bg-muted flex h-12 items-center justify-center gap-2 rounded-full border-2 px-8 text-sm font-semibold transition-all duration-300 sm:h-14 sm:text-base"
            >
              翻阅技术文档
            </Link>
          </div>
        </div>

        {/* Right Visualizer mock with Floating Animation */}
        <div className="hero-right relative mx-auto aspect-square w-full max-w-lg lg:mr-0 lg:max-w-xl">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Soft backdrop glow - slow pulse */}
            <div
              className="bg-primary/10 absolute inset-0 z-0 animate-pulse rounded-full opacity-70 blur-3xl"
              style={{ animationDuration: '4s' }}
            />

            <div
              className="border-border/60 bg-card/60 relative z-10 w-full rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl transition-transform hover:scale-[1.02]"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            >
              <style>{`
                @keyframes float {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-15px); }
                  100% { transform: translateY(0px); }
                }
                @keyframes bar-bob {
                  0% { height: var(--base-h); }
                  50% { height: calc(var(--base-h) + 10%); }
                  100% { height: var(--base-h); }
                }
              `}</style>
              <div className="border-border mb-8 flex items-center gap-2 border-b pb-4">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <div className="text-muted-foreground ml-4 text-[10px] font-black tracking-widest uppercase opacity-70">
                  Algorithm Sandbox
                </div>
              </div>
              <div className="flex h-[250px] items-end justify-between gap-3 px-2">
                {[45, 60, 25, 85, 55, 30, 75, 40].map((h, i) => (
                  <div
                    key={i}
                    className="group bg-muted hover:bg-muted-foreground/30 relative w-full rounded-t-[10px] transition-all duration-500"
                    style={
                      {
                        '--base-h': `${h}%`,
                        height: `${h}%`,
                        animation:
                          i % 2 === 0
                            ? 'bar-bob 4s ease-in-out infinite'
                            : 'bar-bob 5s ease-in-out infinite reverse',
                      } as React.CSSProperties
                    }
                  >
                    {i === 3 && (
                      <div className="bg-primary absolute inset-x-0 top-0 bottom-0 rounded-t-[10px] shadow-[0_0_20px_rgba(0,0,0,0.1)]" />
                    )}
                    {i === 2 && (
                      <div className="absolute inset-x-0 top-0 bottom-0 rounded-t-[10px] bg-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.5)]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})
HeroSection.displayName = 'HeroSection'

// 2. Asymmetric Bento Ecosystem (Premium Redesign)
const FeaturesSection = memo(() => {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.bento-card',
        { y: 80, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.4,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      )
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} className="relative z-20 mb-40 w-full px-6 lg:px-10">
      {/* Title */}
      <div className="mb-16 flex w-full flex-col items-center justify-center gap-6 pt-20 text-center">
        <h2 className="text-foreground max-w-2xl text-4xl leading-[1.1] font-black tracking-tighter md:text-5xl lg:text-5xl">
          深藏不露的底层实力
        </h2>
        <p className="text-muted-foreground max-w-xl text-lg font-medium">
          突破传统前端渲染极限，在一个纯净、精准的观测窗口下，重新理解算法结构。
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 md:grid-cols-12 lg:grid-cols-12">
        {/* Main Bento (Large) - The Visualizer Hero */}
        <div className="bento-card group bg-card relative col-span-1 flex min-h-[500px] flex-col overflow-hidden rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 transition-all duration-500 hover:shadow-2xl md:col-span-12 lg:col-span-8 dark:bg-zinc-900/50 dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] dark:ring-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent dark:from-white/[0.03]" />

          <div className="relative z-20 flex h-full flex-col justify-between p-10 lg:flex-row lg:items-center lg:p-12">
            {/* Text Context */}
            <div className="max-w-md">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-black/5 shadow-sm ring-1 ring-black/10 backdrop-blur-md dark:bg-white/10 dark:ring-white/20">
                <Cpu size={26} className="text-primary drop-shadow-md" />
              </div>
              <h3 className="text-foreground text-3xl font-black tracking-tight md:text-4xl">
                60fps 纯流体引擎
              </h3>
              <p className="text-muted-foreground mt-5 text-[17px] leading-relaxed">
                获取原生级别的重绘控制权。无论是数以万计的复杂节点演变，还是极致压缩的运行片段，系统都如同冰雕般保持冷酷精确的执行。
              </p>
            </div>

            {/* Visualizer Mock */}
            <div className="relative mt-12 w-full max-w-[320px] shrink-0 self-center lg:mt-0 lg:self-end">
              <div className="relative z-10 w-full rounded-3xl border border-black/5 bg-white/50 p-6 shadow-xl backdrop-blur-xl transition-transform duration-700 hover:-translate-y-2 dark:border-white/10 dark:bg-zinc-950/50">
                <div className="flex gap-2.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/90 shadow-inner" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/90 shadow-inner" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/90 shadow-inner" />
                </div>
                <div className="mt-10 flex h-[180px] items-end justify-between gap-2">
                  {[4 - 0, 70, 20, 85, 45, 95, 30].map((h, i) => (
                    <div
                      key={i}
                      className="group/bar relative w-10 origin-bottom rounded-t-xl bg-zinc-200 transition-all duration-500 dark:bg-zinc-800"
                      style={{
                        height: `${h}%`,
                        animation: `bar-pulse ${4 + i}s ease-in-out infinite alternate`,
                      }}
                    >
                      {i === 3 && (
                        <div className="bg-primary absolute inset-0 rounded-t-xl shadow-[0_0_20px_rgba(0,122,255,0.4)]" />
                      )}
                    </div>
                  ))}
                  <style>{`@keyframes bar-pulse { 0% { transform: scaleY(1); } 100% { transform: scaleY(1.15); } }`}</style>
                </div>
              </div>
              {/* Outer Glow */}
              <div className="bg-primary/10 dark:bg-primary/20 absolute -inset-10 -z-10 rounded-full blur-[60px]" />
            </div>
          </div>
        </div>

        {/* Small Bento 1 */}
        <div className="bento-card group bg-card relative col-span-1 flex min-h-[500px] flex-col overflow-hidden rounded-[40px] p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 transition-all duration-500 hover:shadow-2xl md:col-span-6 lg:col-span-4 lg:p-12 dark:bg-zinc-900/50 dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] dark:ring-white/10">
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-black/5 shadow-sm ring-1 ring-black/10 backdrop-blur-md dark:bg-white/10 dark:ring-white/20">
              <Terminal size={24} className="text-primary drop-shadow-md" />
            </div>
            <h3 className="text-foreground text-3xl font-black tracking-tight">实时透视片段</h3>
            <p className="text-muted-foreground mt-4 text-[16px] leading-relaxed">
              内嵌编译器级专家系统，为您精确解析当前的内存交互逻辑。
            </p>

            <div className="relative mt-8 flex-1 overflow-hidden rounded-2xl bg-zinc-900 p-6 font-mono text-[13px] text-zinc-300 shadow-inner ring-1 ring-black/5 dark:bg-black dark:ring-white/5">
              <div className="space-y-3 opacity-90">
                <p>
                  <span className="text-pink-500">let</span> i{' '}
                  <span className="text-primary">=</span> <span className="text-amber-500">0</span>;
                </p>
                <p>
                  <span className="text-emerald-500">while</span> (i{' '}
                  <span className="text-primary">&lt;</span> arr.length) {'{'}
                </p>
                <p className="bg-primary/20 rounded py-0.5 pl-4">
                  <span className="text-primary font-bold">swap</span>(arr, i, min);
                </p>
                <p className="pl-4 text-zinc-500">{'// Operation completed'}</p>
                <p>{'}'}</p>
              </div>
              <div className="bg-primary/20 absolute -right-4 -bottom-4 h-32 w-32 rounded-full blur-[40px]" />
            </div>
          </div>
        </div>

        {/* Medium Wide Bento */}
        <div className="bento-card group bg-card relative col-span-1 flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[40px] p-12 text-center shadow-[0_8px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 transition-all duration-500 hover:shadow-2xl md:col-span-12 lg:col-span-12 dark:bg-zinc-900/50 dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] dark:ring-white/10">
          {/* Subtle Ambient Background Blob */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 transition-opacity duration-1000 group-hover:opacity-100 dark:opacity-20">
            <div className="via-primary/30 h-[200px] w-[600px] rounded-[100%] bg-gradient-to-r from-transparent to-transparent blur-[60px]" />
          </div>

          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-black/5 shadow-sm ring-1 ring-black/10 backdrop-blur-md transition-transform duration-700 group-hover:-translate-y-2 group-hover:shadow-[0_0_20px_rgba(0,122,255,0.3)] dark:bg-white/10 dark:ring-white/20">
              <Activity size={28} className="text-primary drop-shadow-md" />
            </div>
            <h2 className="text-foreground text-3xl font-black tracking-tight md:text-5xl lg:text-5xl">
              超越极限 的性能承载
            </h2>
            <p className="text-muted-foreground mt-6 max-w-2xl text-[17px] leading-relaxed">
              极致的分离设计，几乎免疫海量数据引发的执行阻塞。无论是初始化百万量级的节点阵列，还是多线高强度的递归模拟动作，一切都能保持物理般纯粹无感的顺滑。
            </p>

            {/* Elegant Line Chart Mock */}
            <div className="relative mt-12 flex h-24 w-full max-w-2xl items-end overflow-hidden">
              <svg
                viewBox="0 0 400 100"
                className="h-full w-full drop-shadow-[0_8px_12px_rgba(0,122,255,0.15)]"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 100 L0 80 Q50 20 100 50 T200 60 T300 30 T400 40 L400 100 Z"
                  fill="url(#lineGrad)"
                />
                <path
                  d="M0 80 Q50 20 100 50 T200 60 T300 30 T400 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})
FeaturesSection.displayName = 'FeaturesSection'

// 3. Apple-style Journal
const FeaturedPosts = () => {
  const [posts, setPosts] = useState<PostAPI.PostVO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await searchPostByPage({
          current: 1,
          pageSize: 6,
          sortField: 'createTime',
          sortOrder: 'descend',
        })
        if (res.code === 0 && res.data?.records) {
          setPosts(res.data.records as unknown as PostAPI.PostVO[])
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err)
      } finally {
        setIsLoading(false)
        setTimeout(() => ScrollTrigger.refresh(), 100)
      }
    }
    fetchPosts()
  }, [])

  useGSAP(
    () => {
      if (!isLoading) {
        gsap.fromTo(
          '.post-reveal',
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
            },
            clearProps: 'all',
          }
        )
      }
    },
    { scope: containerRef, dependencies: [isLoading] }
  )

  return (
    <section ref={containerRef} className="mb-40 w-full px-6 lg:px-10">
      <div className="w-full">
        <div className="border-border mb-16 flex flex-col justify-between gap-4 border-b pb-8 sm:flex-row sm:items-end">
          <h3 className="text-foreground text-4xl font-black tracking-tight">技术日志架构</h3>
          <Link
            href="/blog"
            className="group text-primary flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            查阅全部文档
            <div className="bg-primary/10 group-hover:bg-primary flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:text-white">
              <ArrowRight
                size={14}
                className="text-primary transition-colors group-hover:text-white"
              />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} index={i} />)
            : posts.map(post => (
                <div key={post.id} className="post-reveal h-full">
                  <PostCard
                    post={post}
                    className="!rounded-[32px] !shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:!border-white/5 dark:!shadow-none"
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground relative min-h-screen overflow-hidden transition-colors duration-500">
      {/* Pure Solid Background - Apple Style No Grids */}

      {/* Ambient Engine Depth */}
      <div className="bg-primary/3 dark:bg-primary/5 pointer-events-none absolute top-0 right-1/4 -z-10 h-[800px] w-[800px] translate-x-1/2 rounded-full opacity-100 blur-[150px]" />
      <div className="bg-primary/3 dark:bg-primary/5 pointer-events-none absolute top-[50rem] left-0 -z-10 h-[600px] w-[600px] rounded-full opacity-100 blur-[130px]" />

      <div className="relative z-10 container mx-auto w-full px-6">
        <HeroSection />
        <FeaturesSection />
        <FeaturedPosts />
      </div>
    </main>
  )
}
