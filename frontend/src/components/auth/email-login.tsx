'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail, Send } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().length(6, '请输入6位验证码'),
})

type FormValues = z.infer<typeof formSchema>

interface EmailLoginProps {
  emailForm: { email: string; code: string }
  setEmailForm: React.Dispatch<React.SetStateAction<{ email: string; code: string }>>
  onSendCode: () => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  loading: boolean
  countdown: number
  error: string
  success: string
}

export function EmailLogin({
  emailForm,
  setEmailForm,
  onSendCode,
  onSubmit,
  onBack,
  loading,
  countdown,
  error,
  success,
}: EmailLoginProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailForm.email,
      code: emailForm.code,
    },
    mode: 'onChange',
  })

  React.useEffect(() => {
    const subscription = form.watch(value => {
      setEmailForm({
        email: value.email || '',
        code: value.code || '',
      })
    })
    return () => subscription.unsubscribe()
  }, [form, setEmailForm])

  const handleSubmit = (data: FormValues) => {
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent
    onSubmit(syntheticEvent)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-foreground/30 px-1 text-[10px] font-black tracking-[0.25em] uppercase">
                邮箱地址
              </FormLabel>
              <div className="group relative">
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    className="border-border/50 bg-muted/20 group-hover:bg-muted/30 focus:bg-background focus:border-primary/50 h-14 rounded-[1.25rem] px-6 pl-12 text-base font-black tracking-tight shadow-sm transition-all duration-500 focus:ring-0"
                    {...field}
                  />
                </FormControl>
                <Mail className="text-foreground/20 group-focus-within:text-primary absolute top-4.5 left-4.5 mt-[18px] h-5 w-5 transition-colors" />
              </div>
              <FormMessage className="px-1 text-[10px] font-bold" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-foreground/30 px-1 text-[10px] font-black tracking-[0.25em] uppercase">
                验证码
              </FormLabel>
              <div className="flex gap-3">
                <div className="group relative flex-1">
                  <FormControl>
                    <Input
                      placeholder="6位验证码"
                      maxLength={6}
                      className="border-border/50 bg-muted/20 group-hover:bg-muted/30 focus:bg-background focus:border-primary/50 h-14 rounded-[1.25rem] px-6 pl-12 text-base font-black tracking-tight shadow-sm transition-all duration-500 focus:ring-0"
                      {...field}
                    />
                  </FormControl>
                  <CheckCircle2 className="text-foreground/20 group-focus-within:text-primary absolute top-4.5 left-4.5 mt-[18px] h-5 w-5 transition-colors" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSendCode}
                  disabled={loading || countdown > 0}
                  className="border-border/50 bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/30 h-14 min-w-[120px] rounded-[1.25rem] text-[12px] font-black tracking-tight transition-all duration-300 disabled:opacity-50"
                >
                  {countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-3.5 w-3.5" />
                      获取验证
                    </span>
                  )}
                </Button>
              </div>
              <FormMessage className="px-1 text-[10px] font-bold" />
            </FormItem>
          )}
        />

        {(error || success) && (
          <div
            className={`animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border p-4 text-xs font-black tracking-tight duration-500 ${
              error
                ? 'border-red-500/10 bg-red-500/5 text-red-600'
                : 'border-emerald-500/10 bg-emerald-500/5 text-emerald-600'
            }`}
          >
            {error ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span>{error || success}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="bg-primary text-primary-foreground shadow-primary/20 h-14 w-full rounded-full text-sm font-black tracking-tight shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-70"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : '登录 / 注册'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="group text-foreground/30 hover:text-foreground hover:bg-muted/30 h-12 w-full rounded-full text-[11px] font-black tracking-widest uppercase transition-all duration-500"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            返回登录方式
          </Button>
        </div>
      </form>
    </Form>
  )
}
