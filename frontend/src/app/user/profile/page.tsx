'use client'

import * as React from 'react'
import { useAppSelector } from '@/store/hooks'
import type { RootState } from '@/store'
import { UserAvatar } from '@/components/header/user-avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/auth-modal'
import { LoginPromptCard } from '@/components/auth/login-prompt-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookMarked,
  FileText,
  Heart,
  User as UserIcon,
  Award,
  AtSign,
  Shield,
  Zap,
  Edit,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { PostCard } from '@/components/blog/post-card'
import { searchPostByPage } from '@/api/search/searchController'
import { listMyThumbPostByPage } from '@/api/post/postThumbController'
import { listMyFavourPostByPage } from '@/api/post/postFavourController'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function ProfilePage() {
  const { user } = useAppSelector((state: RootState) => state.user)
  const [authModalOpen, setAuthModalOpen] = React.useState(false)

  // 选项卡状态与数据
  const [activeTab, setActiveTab] = React.useState('about')
  const [posts, setPosts] = React.useState<PostAPI.PostVO[]>([])
  const [likedPosts, setLikedPosts] = React.useState<PostAPI.PostVO[]>([])
  const [favoritedPosts, setFavoritedPosts] = React.useState<PostAPI.PostVO[]>([])

  const [loadingPosts, setLoadingPosts] = React.useState(false)
  const [loadingLikes, setLoadingLikes] = React.useState(false)
  const [loadingFavorites, setLoadingFavorites] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)

  // Fetch functions
  const fetchMyPosts = async () => {
    try {
      setLoadingPosts(true)
      const res = await searchPostByPage({
        userId: user?.id,
        current: 1,
        pageSize: 20,
      })
      if (res.code === 0 && res.data?.records) {
        setPosts(res.data.records as PostAPI.PostVO[])
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const fetchMyLikes = async () => {
    try {
      setLoadingLikes(true)
      const res = await listMyThumbPostByPage({ current: 1, pageSize: 20 })
      if (res.code === 0 && res.data?.records) {
        setLikedPosts(res.data.records)
      }
    } catch (error) {
      console.error('Failed to fetch liked posts:', error)
    } finally {
      setLoadingLikes(false)
    }
  }

  const fetchMyFavorites = async () => {
    try {
      setLoadingFavorites(true)
      const res = await listMyFavourPostByPage({ current: 1, pageSize: 20 })
      if (res.code === 0 && res.data?.records) {
        setFavoritedPosts(res.data.records)
      }
    } catch (error) {
      console.error('Failed to fetch favorited posts:', error)
    } finally {
      setLoadingFavorites(false)
    }
  }

  // Effect to load data when tab changes or component mounts
  React.useEffect(() => {
    if (!user) return
    if (posts.length === 0 && !loadingPosts) fetchMyPosts()
    if (likedPosts.length === 0 && !loadingLikes) fetchMyLikes()
    if (favoritedPosts.length === 0 && !loadingFavorites) fetchMyFavorites()
  }, [user])

  // If no user, we render the page with a blurred overlay
  const isUnauthorized = !user

  useGSAP(
    () => {
      if (isUnauthorized) {
        gsap.from('.login-overlay-content', {
          y: 60,
          opacity: 0,
          scale: 0.95,
          duration: 1.2,
          ease: 'expo.out',
        })
      } else {
        gsap.from('.profile-animate-item', {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
        })
      }
    },
    { scope: containerRef, dependencies: [isUnauthorized] }
  )

  // 计算账户年龄
  const accountAge = user?.createTime
    ? Math.floor((Date.now() - new Date(user.createTime).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // 用户角色配置
  const roleConfig = {
    admin: { label: '管理员', color: 'bg-purple-500/10 text-purple-600', icon: Shield },
    ban: { label: '已封禁', color: 'bg-red-500/10 text-red-600', icon: Shield },
    user: { label: '普通用户', color: 'bg-blue-500/10 text-blue-600', icon: UserIcon },
  }

  const roleInfo = roleConfig[(user?.userRole as keyof typeof roleConfig) || 'user']
  const RoleIcon = roleInfo.icon

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Login Overlay */}
      {isUnauthorized && (
        <div className="bg-background/50 fixed inset-0 z-[40] mt-20 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="from-background pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b to-transparent" />
          <div className="login-overlay-content relative z-20 w-full max-w-lg">
            <LoginPromptCard
              onLoginClick={() => setAuthModalOpen(true)}
              title="个人中心"
              description="登录以解锁您的完整创作足迹与个性化体验"
            />
          </div>
        </div>
      )}

      <div
        className={`relative z-10 container mx-auto w-full space-y-12 px-6 pt-12 pb-40 transition-all duration-1000 md:pt-20 ${
          isUnauthorized
            ? 'pointer-events-none opacity-40 blur-2xl grayscale-[0.5] select-none'
            : 'opacity-100'
        }`}
      >
        {/* 顶部标题栏 */}
        <div className="profile-animate-item flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <h1 className="text-foreground text-3xl font-black tracking-tight text-balance sm:text-4xl">
              个人中心
            </h1>
            <p className="text-foreground/40 max-w-2xl text-base leading-relaxed font-bold tracking-tight">
              你好，<span className="text-foreground">{user?.userName || '探索者'}</span>
              。这里记录了你的创作足迹与个人成长。
            </p>
          </div>
          <Link href="/user/settings">
            <Button
              size="lg"
              className="hover:shadow-primary/20 bg-primary h-12 rounded-full px-8 text-sm font-black tracking-tight shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑资料
            </Button>
          </Link>
        </div>

        <div className="profile-animate-item grid gap-8 lg:grid-cols-12">
          {/* 左侧 - 用户名片 (4cols) */}
          <div className="self-start lg:sticky lg:top-24 lg:col-span-4">
            <Card className="border-border/50 bg-card/30 relative flex w-full flex-col overflow-hidden rounded-3xl shadow-sm backdrop-blur-xl">
              <div className="bg-muted/20 border-border/5 relative h-40 border-b">
                <div className="bg-background/60 border-border/10 absolute top-6 right-6 flex items-center gap-2.5 rounded-full border px-4 py-1.5 shadow-sm backdrop-blur-2xl">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="text-foreground/40 text-[10px] font-black tracking-[0.2em] uppercase">
                    在线
                  </span>
                </div>
              </div>

              <CardContent className="relative px-8 pt-0 pb-8">
                <div className="-mt-16 mb-6 flex justify-center">
                  <div className="relative">
                    <UserAvatar
                      user={user}
                      size="xl"
                      className="border-background h-32 w-32 border-[6px] shadow-xl"
                    />
                    <div className="border-background absolute right-2 bottom-2 h-5 w-5 rounded-full border-4 bg-emerald-500 shadow-sm" />
                  </div>
                </div>

                <div className="space-y-5 text-center">
                  <div className="space-y-2">
                    <h2 className="text-foreground text-2xl font-black tracking-tight transition-all">
                      {user?.userName || '未设置用户名'}
                    </h2>
                    <p className="text-foreground/30 flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
                      <AtSign className="h-3 w-3 opacity-50" />
                      {user?.userEmail?.split('@')[0] || '未知身份'}
                    </p>
                  </div>

                  <div className="flex justify-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-muted/50 text-foreground/60 rounded-full border-transparent px-3 py-1 text-[10px] font-black tracking-wider uppercase"
                    >
                      <RoleIcon className="mr-1.5 h-3 w-3 opacity-60" />
                      {roleInfo.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-border/50 text-foreground/40 rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase"
                    >
                      <Award className="mr-1.5 h-3 w-3 opacity-60" />
                      Lv.1 成员
                    </Badge>
                  </div>

                  <div className="text-foreground/60 px-2 pt-2 text-sm leading-relaxed font-bold italic">
                    &quot;{user?.userProfile || '致力于构建更美好的数字化世界...'}&quot;
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    <div className="bg-muted/20 border-border/10 hover:bg-muted/30 group/stat flex cursor-default flex-col items-center justify-center rounded-[20px] border p-4 transition-all">
                      <StatItem
                        label="天数"
                        value={isUnauthorized ? '—' : accountAge}
                        icon={
                          <Zap className="text-foreground/30 group-hover/stat:text-primary mb-1 h-4 w-4 transition-all duration-300" />
                        }
                      />
                    </div>
                    <div className="bg-muted/20 border-border/10 hover:bg-muted/30 group/stat flex cursor-default flex-col items-center justify-center rounded-[20px] border p-4 transition-all">
                      <StatItem
                        label="动态"
                        value={
                          isUnauthorized
                            ? '—'
                            : loadingPosts && posts.length === 0
                              ? '—'
                              : posts.length
                        }
                        icon={
                          <FileText className="text-foreground/30 group-hover/stat:text-primary mb-1 h-4 w-4 transition-all duration-300" />
                        }
                      />
                    </div>
                    <div className="bg-muted/20 border-border/10 hover:bg-muted/30 group/stat flex cursor-default flex-col items-center justify-center rounded-[20px] border p-4 transition-all">
                      <StatItem
                        label="获赞"
                        value={
                          isUnauthorized
                            ? '—'
                            : loadingLikes && likedPosts.length === 0
                              ? '—'
                              : likedPosts.length
                        }
                        icon={
                          <Heart className="text-foreground/30 group-hover/stat:text-primary mb-1 h-4 w-4 transition-all duration-300" />
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧 - 动态与详情模块 (8cols) */}
          <div className="space-y-6 lg:col-span-8">
            <Tabs
              defaultValue="about"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full space-y-8"
            >
              <TabsList className="bg-muted/30 border-border/10 h-14 w-full justify-start rounded-2xl border p-1.5 backdrop-blur-2xl">
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground h-full rounded-xl px-8 text-[13px] font-black tracking-tight transition-all data-[state=active]:shadow-sm"
                >
                  <UserIcon className="mr-2.5 h-4 w-4 shrink-0 opacity-40" /> 关于我
                </TabsTrigger>
                <TabsTrigger
                  value="posts"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground h-full rounded-xl px-8 text-[13px] font-black tracking-tight transition-all data-[state=active]:shadow-sm"
                >
                  <FileText className="mr-2.5 h-4 w-4 shrink-0 opacity-40" /> 我的动态{' '}
                  {loadingPosts && posts.length === 0 ? '' : `(${posts.length})`}
                </TabsTrigger>
                <TabsTrigger
                  value="likes"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground h-full rounded-xl px-8 text-[13px] font-black tracking-tight transition-all data-[state=active]:shadow-sm"
                >
                  <Heart className="mr-2.5 h-4 w-4 shrink-0 opacity-40" /> 赞过{' '}
                  {loadingLikes && likedPosts.length === 0 ? '' : `(${likedPosts.length})`}
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground h-full rounded-xl px-8 text-[13px] font-black tracking-tight transition-all data-[state=active]:shadow-sm"
                >
                  <BookMarked className="mr-2.5 h-4 w-4 shrink-0 opacity-40" /> 收藏{' '}
                  {loadingFavorites && favoritedPosts.length === 0
                    ? ''
                    : `(${favoritedPosts.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-8 outline-none">
                <Card className="border-border/10 bg-card/20 space-y-8 rounded-[2.5rem] p-8 shadow-sm backdrop-blur-xl">
                  <h3 className="text-foreground text-base font-black tracking-[0.2em] tracking-tight uppercase opacity-40">
                    基本资料
                  </h3>
                  <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
                    <InfoItem label="用户昵称" value={user?.userName || '未设置'} />
                    <InfoItem label="电子邮箱" value={user?.userEmail || '未绑定'} />
                    <InfoItem label="手机号码" value={user?.userPhone || '未绑定'} />
                    <InfoItem label="系统 ID" value={user?.id ? `#${user.id}` : '未知'} />
                  </div>
                </Card>
                <Card className="border-border/10 bg-card/20 space-y-8 rounded-[2.5rem] p-8 shadow-sm backdrop-blur-xl">
                  <h3 className="text-foreground text-base font-black tracking-[0.2em] tracking-tight uppercase opacity-40">
                    活跃历程
                  </h3>
                  <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
                    <InfoItem
                      label="注册日期"
                      value={
                        user?.createTime
                          ? new Date(user.createTime).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '未知'
                      }
                    />
                    <InfoItem label="常用活跃地" value="已开启地理屏蔽" />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="posts" className="space-y-8 outline-none">
                {loadingPosts ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid gap-8 sm:grid-cols-2">
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center font-black tracking-widest uppercase italic opacity-20">
                    暂无内容
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
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
    <div className="flex flex-col items-center justify-center">
      {icon}
      <div className="text-foreground mb-1 text-xl leading-none font-black tracking-tight md:text-2xl">
        {value}
      </div>
      <div className="text-foreground/30 text-[10px] font-black tracking-widest uppercase md:text-[11px]">
        {label}
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
      <p className="text-foreground/30 text-[10px] font-black tracking-[0.25em] uppercase">
        {label}
      </p>
      <div className="text-foreground text-lg leading-tight font-black tracking-tight">{value}</div>
      {description && <p className="text-foreground/50 text-xs font-bold">{description}</p>}
    </div>
  )
}
