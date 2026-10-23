'use client'
import Link from 'next/link'
import { PageState } from '@/components/design/page-state'
import { Button } from '@/components/ui/button'
export function GitHubAuthStatus({status,message,onRetry}:{status:'loading'|'success'|'error';message:string;progress:number;onRetry?:()=>void}) {
 return <PageState title={status==='loading'?'正在验证 GitHub 登录':status==='success'?'登录成功':'登录未完成'} description={message} loading={status==='loading'}>{status==='error'&&<><Button variant="secondary" onClick={onRetry}>重试</Button><Button asChild variant="ghost"><Link href="/">返回首页</Link></Button></>}</PageState>
}
