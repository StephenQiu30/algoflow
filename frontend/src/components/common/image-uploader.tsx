'use client'
import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { uploadFile } from '@/api/file/fileController'
import { FileUploadBizEnum } from '@/enums/FileUploadBizEnum'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
export function ImageUploader({value,onChange,biz=FileUploadBizEnum.POST_COVER,className,placeholder='上传图片'}:{value?:string;onChange?:(value:string)=>void;biz?:string;className?:string;placeholder?:string}) {
 const ref=useRef<HTMLInputElement>(null),[pending,setPending]=useState(false)
 async function upload(file?:File){if(!file)return;if(!file.type.startsWith('image/')||file.size>10*1024*1024){toast.error('请选择 10MB 以内的图片');return}setPending(true);try{const r=await uploadFile({fileUploadRequest:{biz}},{},file);if(r.code!==0||!r.data?.url)throw Error(r.message||'上传失败');onChange?.(r.data.url);toast.success('图片已上传，保存资料后生效')}catch(e){toast.error(e instanceof Error?e.message:'上传失败，请重试')}finally{setPending(false)}}
 return <div className={cn('flex flex-col items-start gap-3',className)}>{value&&<Avatar className="size-16"><AvatarImage src={value} alt="头像预览" /><AvatarFallback>头像</AvatarFallback></Avatar>}<Input type="file" ref={ref} accept="image/*" className="hidden" aria-label="选择上传图片" onChange={e=>{void upload(e.target.files?.[0]);e.target.value=''}} /><div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" disabled={pending} onClick={()=>ref.current?.click()}>{pending?<Spinner />:<ImagePlus data-icon="inline-start" />}{value?'更换图片':placeholder}</Button>{value&&<Button type="button" variant="ghost" disabled={pending} onClick={()=>onChange?.('')}>移除</Button>}</div></div>
}
