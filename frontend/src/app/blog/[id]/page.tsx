'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  CommentSection,
  MarkdownRender,
  MarkdownToc,
  PostActionBar,
  PostHeader,
} from '@/components/blog'
import { UserAvatar } from '@/components/header/user-avatar'
import { Button } from '@/components/ui/button'
import { searchPostByPage } from '@/api/search/searchController'
import { doThumb } from '@/api/post/postThumbController'
import { doFavour } from '@/api/post/postFavourController'
import { useAppSelector } from '@/store/hooks'
import type { RootState } from '@/store'
import { ArrowLeft, ChevronLeft, FileWarning, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function PostDetailPage() {
  const container = React.useRef<HTMLDivElement>(null)
  const progressBarRef = React.useRef<HTMLDivElement>(null)
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const { user } = useAppSelector((state: RootState) => state.user)

  const [post, setPost] = React.useState<PostAPI.PostVO | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [hasThumb, setHasThumb] = React.useState(false)
  const [hasFavour, setHasFavour] = React.useState(false)
  const [thumbNum, setThumbNum] = React.useState(0)
  const [favourNum, setFavourNum] = React.useState(0)
  const [commentNum, setCommentNum] = React.useState(0)

  // 获取文章详情
  React.useEffect(() => {
    if (!postId) return

    const fetchPost = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await searchPostByPage({
          id: postId as unknown as number,
          current: 1,
          pageSize: 1,
        })
        if (res && res.code === 0 && res.data?.records && (res.data.records as PostAPI.PostVO[]).length > 0) {
          const postData = (res.data.records as PostAPI.PostVO[])[0] as PostAPI.PostVO
          setPost(postData)
          setHasThumb(postData.hasThumb || false)
          setHasFavour(postData.hasFavour || false)
          setThumbNum(postData.thumbNum || 0)
          setFavourNum(postData.favourNum || 0)
        } else {
          setError(`${res?.message || '见解已飞往星际'} (ID: ${postId})`)
          setPost(null)
        }
      } catch (err: unknown) {
        console.error('Failed to load story:', err)
        setError('Network error, please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const handleThumb = async () => {
    if (!user) return router.push('/')
    try {
      const res = (await doThumb({
        postId: postId as unknown as number,
      })) as unknown as PostAPI.BaseResponseInteger
      if (res.code === 0) {
        const delta = res.data || 0
        setHasThumb(delta > 0)
        setThumbNum(prev => prev + delta)
      }
    } catch (err) {
      console.error('Like failed', err)
    }
  }

  const handleFavour = async () => {
    if (!user) return router.push('/')
    try {
      const res = (await doFavour({
        postId: postId as unknown as number,
      })) as unknown as PostAPI.BaseResponseInteger
      if (res.code === 0) {
        const delta = res.data || 0
        setHasFavour(delta > 0)
        setFavourNum(prev => prev + delta)
      }
    } catch (err) {
      console.error('Favorite failed', err)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || 'Share Story',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  useGSAP(
    () => {
      if (!loading && post) {
        // Entrance reveals
        gsap.from('.gsap-reveal', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        })

        // Scroll Progress Bar
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        })
      }
    },
    { scope: container, dependencies: [loading, post] }
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-secondary-foreground/50 h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
        <FileWarning className="text-muted-foreground/30 h-16 w-16" />
        <h2 className="text-foreground text-2xl font-semibold">Story unavailable</h2>
        <Link href="/blog">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div ref={container} className="bg-background relative min-h-screen pt-16 pb-40 md:pt-20">
      <div
        ref={progressBarRef}
        className="from-primary fixed top-0 right-0 left-0 z-50 h-[3px] origin-left scale-x-0 bg-gradient-to-r to-indigo-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
      />

      {/* Mobile Navbar */}
      <div className="border-border/40 bg-background/80 relative sticky top-0 z-10 mb-4 flex h-14 items-center border-b px-4 backdrop-blur-2xl md:hidden">
        <Link
          href="/blog"
          className="text-foreground/80 hover:text-foreground flex items-center text-[15px] font-medium transition-colors"
        >
          <ChevronLeft className="mr-0.5 h-5 w-5" />
          返回博客
        </Link>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px] xl:gap-12">
          <article className="w-full max-w-[760px]">
            {/* Minimal Back Button (Apple Style) */}
            <div className="gsap-reveal mb-16 flex">
              <Link
                href="/blog"
                className="group text-foreground/30 hover:text-foreground flex items-center text-[11px] font-black tracking-[0.25em] uppercase transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                返回文章见解
              </Link>
            </div>

            <PostHeader post={post} className="gsap-reveal" />

            <MarkdownRender content={post.content || ''} className="gsap-reveal" />

            {/* Author Bio Footer (Minimalist) */}
            <hr className="border-border/40 my-16" />
            <div className="gsap-reveal mx-auto w-full">
              <div className="border-border/10 bg-card/30 hover:bg-card/40 hover:shadow-primary/5 group/author flex flex-col items-center justify-between gap-8 rounded-[2rem] border p-8 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl sm:flex-row sm:items-stretch">
                <div className="flex flex-1 flex-col items-center gap-8 text-center sm:flex-row sm:items-center sm:text-left">
                  <Link href={`/user/${post.userVO?.id}`} className="relative shrink-0">
                    <div className="bg-primary/20 absolute inset-0 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover/author:opacity-100" />
                    <UserAvatar
                      user={post.userVO}
                      size="xl"
                      className="border-background relative h-24 w-24 border-2 shadow-2xl transition-transform duration-700 ease-out group-hover/author:scale-105 group-hover/author:rotate-3"
                    />
                  </Link>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="bg-primary/10 mb-3 inline-flex items-center rounded-full px-3 py-1">
                        <p className="text-primary text-[10px] font-black tracking-[0.2em] uppercase">
                          发布见解于轨迹
                        </p>
                      </div>
                      <Link href={`/user/${post.userVO?.id}`}>
                        <h3 className="text-foreground hover:text-primary text-3xl font-black tracking-tight transition-all">
                          {post.userVO?.userName || '匿名用户'}
                        </h3>
                      </Link>
                    </div>
                    <p className="text-foreground/60 max-w-[520px] text-[15px] leading-relaxed font-medium">
                      {post.userVO?.userProfile ||
                        '致力于构建更美好的数字化世界，感谢并见证每一次阅读与成长。'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Link href={`/user/${post.userVO?.id}`} className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="bg-background/50 border-border/20 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-primary/20 group/btn h-12 w-full rounded-full px-8 font-bold shadow-sm transition-all duration-300 sm:w-auto"
                    >
                      查看主页
                      <ChevronLeft className="ml-2 h-4 w-4 rotate-180 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Comment Section */}
              <div id="comments" className="mt-16 scroll-mt-32 pb-16">
                <CommentSection postId={postId} onTotalChange={setCommentNum} />
              </div>
            </div>
          </article>

          {/* Desktop MarkdownToc */}
          <aside className="relative hidden lg:block">
            <div className="sticky top-24 pl-4">
              <MarkdownToc content={post.content || ''} />
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Bar */}
      <PostActionBar
        hasThumb={hasThumb}
        hasFavour={hasFavour}
        onThumb={handleThumb}
        onFavour={handleFavour}
        onShare={handleShare}
        onComment={() => {
          document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
        }}
        commentNum={commentNum}
        thumbNum={thumbNum}
        favourNum={favourNum}
      />
    </div>
  )
}
