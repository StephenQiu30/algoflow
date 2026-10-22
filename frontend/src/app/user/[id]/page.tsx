'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/header/user-avatar'
import { Badge } from '@/components/ui/badge'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import dayjs from '@/lib/dayjs'
import {
  ArrowLeft,
  Award,
  Calendar,
  FileWarning,
  Loader2,
  Shield,
  User as UserIcon,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { searchUserByPage, searchPostByPage } from '@/api/search/searchController'
import { PostCard } from '@/components/blog/post-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppSelector } from '@/store/hooks'
import type { RootState } from '@/store'

export default function UserDetailPage() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const { user: loginUser } = useAppSelector((state: RootState) => state.user)
  const [user, setUser] = React.useState<UserAPI.UserVO | null>(null)
  const [posts, setPosts] = React.useState<PostAPI.PostVO[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingPosts, setLoadingPosts] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Use ES search to find user by ID
        const userRes = (await searchUserByPage({
          id: userId as unknown as number,
          current: 1,
          pageSize: 1,
        })) as unknown as SearchAPI.BaseResponsePage

        if (
          userRes.code === 0 &&
          userRes.data?.records &&
          (userRes.data.records as UserAPI.UserVO[]).length > 0
        ) {
          const userData = (userRes.data.records as UserAPI.UserVO[])[0] as UserAPI.UserVO
          setUser(userData)

          // Fetch user's posts from ES
          setLoadingPosts(true)
          const postsRes = await searchPostByPage({
            userId: userId as unknown as number,
            current: 1,
            pageSize: 20,
          })
          if (postsRes.code === 0 && postsRes.data?.records) {
            setPosts(postsRes.data.records as PostAPI.PostVO[])
          }
          setLoadingPosts(false)
        } else {
          setError('用户不存在')
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
        setError('获取信息失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  useGSAP(
    () => {
      if (!loading && user) {
        gsap.from('.animate-in', {
          opacity: 0,
          y: 30,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power4.out',
        })
      }
    },
    { scope: containerRef, dependencies: [loading, user] }
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-secondary-foreground/50 h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
        <FileWarning className="text-muted-foreground/30 h-16 w-16" />
        <h2 className="text-foreground text-2xl font-black tracking-tight">
          {error || '用户不存在'}
        </h2>
        <Link href="/">
          <Button variant="outline" className="h-12 rounded-full px-8 font-bold tracking-tight">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </Link>
      </div>
    )
  }

  // Use dayjs for dates and relative time
  const joinedDate = user.createTime ? dayjs(user.createTime).format('MMMM D, YYYY') : 'Unknown'
  const joinedAgo = user.createTime ? dayjs(user.createTime).fromNow(true) : '0 days'

  // Role config (Read-Only)
  const roleConfig = {
    admin: {
      label: '管理员',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800',
      icon: Shield,
    },
    ban: {
      label: '已封禁',
      color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
      icon: Shield,
    },
    user: {
      label: '普通用户',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
      icon: UserIcon,
    },
  }

  const roleInfo = roleConfig[user.userRole as keyof typeof roleConfig] || roleConfig.user
  const RoleIcon = roleInfo.icon

  return (
    <div
      ref={containerRef}
      className="selection:bg-primary/20 container mx-auto max-w-7xl space-y-12 px-6 py-8 md:space-y-16 md:py-16"
    >
      {/* Header - Back Button Only */}
      <div className="animate-in flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="group text-foreground/30 hover:text-foreground flex items-center text-[11px] font-black tracking-[0.25em] uppercase transition-all duration-300"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          返回
        </button>
      </div>

      {/* Huge Typography Profile Header */}
      <div className="animate-in relative">
        {/* Subtle Background Accent */}
        <div className="bg-primary/5 pointer-events-none absolute -top-12 -left-20 h-80 w-80 rounded-full blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 -bottom-10 h-60 w-60 rounded-full bg-indigo-500/5 blur-[80px]" />

        <div className="relative z-10 flex flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="flex-1 space-y-8">
            <Badge
              variant="secondary"
              className="animate-in bg-primary/10 text-primary border-primary/20 mb-4 rounded-full border px-5 py-2 text-[10px] font-black tracking-[0.2em] uppercase shadow-sm"
            >
              {roleInfo.label} • LV.1 成员
            </Badge>
            <h1
              className={`animate-in text-foreground leading-[0.8] font-black tracking-tighter text-balance ${
                user.userName?.length && user.userName.length > 10
                  ? 'text-5xl md:text-6xl lg:text-7xl'
                  : 'text-8xl md:text-9xl lg:text-[10rem]'
              }`}
            >
              {user.userName || '匿名用户'}
            </h1>
            <p className="animate-in text-foreground/40 max-w-xl text-xl leading-relaxed font-bold tracking-tight italic">
              {user.userProfile || '目前还没有填写个性签名。'}
            </p>
          </div>
          <div className="animate-in group relative shrink-0">
            <div className="bg-primary/20 absolute inset-0 rounded-full opacity-0 blur-3xl transition-opacity duration-1000 group-hover:opacity-100" />
            <UserAvatar
              user={user}
              size="xl"
              className="border-background relative z-10 h-40 w-40 border-4 shadow-2xl transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-3 md:h-56 md:w-56"
            />
            <div className="border-primary/10 absolute -inset-2 scale-95 rounded-full border opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" />
          </div>
        </div>

        {/* Action Buttons & Quick Stats */}
        <div className="animate-in border-border/5 mt-16 flex flex-wrap items-center gap-12 border-t pt-12">
          <StatItem label="加入时间" value={joinedAgo} icon={<Calendar className="h-4 w-4" />} />
          <StatItem label="发布见解" value={posts.length} icon={<Zap className="h-4 w-4" />} />
          <StatItem label="获赞总数" value={0} icon={<Award className="h-4 w-4" />} />
          <div className="ml-auto">
            {loginUser && String(loginUser.id) === String(user.id) && (
              <Link href="/user/settings">
                <Button
                  variant="outline"
                  className="border-border/10 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-primary/20 h-12 rounded-full border-2 px-8 font-black tracking-tight shadow-sm transition-all duration-300"
                >
                  编辑个人资料
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="animate-in space-y-12">
        <Tabs defaultValue="posts" className="w-full space-y-12">
          <TabsList className="border-border/10 h-auto w-full justify-start gap-8 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:text-foreground data-[state=active]:border-primary text-muted-foreground/40 rounded-none border-b-2 border-transparent px-0 pb-4 text-xl font-black tracking-tight transition-all data-[state=active]:bg-transparent"
            >
              已发布见解 ({posts.length})
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:text-foreground data-[state=active]:border-primary text-muted-foreground/40 rounded-none border-b-2 border-transparent px-0 pb-4 text-xl font-black tracking-tight transition-all data-[state=active]:bg-transparent"
            >
              成员资料
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="animate-in space-y-12 pt-4 outline-none">
            <div className="grid gap-16 md:grid-cols-2">
              <InfoItem
                label="昵称"
                value={user.userName || '未设置'}
                description="在社区中显示的公开名称。"
              />
              <InfoItem
                label="用户 ID"
                value={user.id ? `#${user.id}` : '未知'}
                description="系统的唯一标识代码。"
              />
              <InfoItem label="入驻日期" value={joinedDate} />
            </div>
          </TabsContent>

          <TabsContent value="posts" className="animate-in pt-4 outline-none">
            {loadingPosts ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="text-muted-foreground/30 h-8 w-8 animate-spin" />
              </div>
            ) : posts.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2">
                {posts.map(post => (
                  <PostCard key={`post-${post.id}`} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center">
                <FileWarning className="text-muted-foreground/10 h-16 w-16" />
                <p className="text-muted-foreground/40 text-lg font-bold tracking-tight">
                  尚未发布任何见解。
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string
  value: number | string
  icon?: React.ReactNode
}) {
  return (
    <div className="group flex items-center gap-5 transition-all duration-500 hover:translate-y-[-2px]">
      <div className="bg-primary/5 text-primary/30 border-primary/5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-primary/20 flex h-14 w-14 items-center justify-center rounded-[20px] border transition-all duration-500 group-hover:shadow-lg">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="text-foreground text-4xl leading-none font-black tracking-tighter">
          {value}
        </div>
        <div className="text-foreground/30 text-[10px] font-black tracking-[0.25em] uppercase">
          {label}
        </div>
      </div>
    </div>
  )
}

function InfoItem({
  label,
  value,
  description,
}: {
  label: string
  value: React.ReactNode
  description?: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <div className="text-foreground text-2xl leading-tight font-bold tracking-tight">{value}</div>
      {description && (
        <p className="text-muted-foreground/60 text-sm font-medium tracking-tight">{description}</p>
      )}
    </div>
  )
}
