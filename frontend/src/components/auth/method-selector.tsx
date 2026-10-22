'use client'

import { Button } from '@/components/ui/button'
import { Github, Mail } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import * as React from 'react'

interface MethodSelectorProps {
  onGitHubLogin: () => void
  onEmailClick: () => void
}

export function MethodSelector({ onGitHubLogin, onEmailClick }: MethodSelectorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from('.method-btn', {
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="grid grid-cols-2 items-center gap-4">
      <Button
        variant="outline"
        onClick={onGitHubLogin}
        className="method-btn group border-border/50 bg-card/30 hover:border-primary/30 hover:bg-primary/5 hover:shadow-primary/10 relative flex h-36 flex-col items-center justify-center rounded-[2.5rem] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
      >
        <div className="bg-muted/50 border-border/10 group-hover:bg-background mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Github className="text-foreground/70 group-hover:text-primary h-7 w-7 transition-colors" />
        </div>
        <div className="flex h-12 flex-col items-center justify-center gap-1">
          <span className="text-foreground text-[15px] leading-none font-black tracking-tight">
            GitHub
          </span>
          <span className="text-foreground/30 text-[10px] leading-none font-bold tracking-[0.2em] uppercase">
            快捷登录
          </span>
        </div>
      </Button>

      <Button
        variant="outline"
        onClick={onEmailClick}
        className="method-btn group border-border/50 bg-card/30 hover:border-primary/30 hover:bg-primary/5 hover:shadow-primary/10 relative flex h-36 flex-col items-center justify-center rounded-[2.5rem] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
      >
        <div className="bg-muted/50 border-border/10 group-hover:bg-background mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Mail className="text-foreground/70 group-hover:text-primary h-7 w-7 transition-colors" />
        </div>
        <div className="flex h-12 flex-col items-center justify-center gap-1">
          <span className="text-foreground text-[15px] leading-none font-black tracking-tight">
            邮箱
          </span>
          <span className="text-foreground/30 text-[10px] leading-none font-bold tracking-[0.2em] uppercase">
            验证码
          </span>
        </div>
      </Button>
    </div>
  )
}
