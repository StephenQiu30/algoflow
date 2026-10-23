'use client'
import { useRef, useState } from 'react'
import { Bold, Italic, Code, ImagePlus, Link2, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MarkdownRender } from './markdown-render'
import { uploadFile } from '@/api/file/fileController'
import { FileUploadBizEnum } from '@/enums/FileUploadBizEnum'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className,
  viewMode = 'edit',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  viewMode?: 'edit' | 'preview' | 'split'
}) {
  const [view, setView] = useState(viewMode === 'preview' ? 'preview' : 'edit'),
    [uploading, setUploading] = useState(false),
    textRef = useRef<HTMLTextAreaElement>(null),
    fileRef = useRef<HTMLInputElement>(null)
  function insert(before: string, after = '') {
    const input = textRef.current,
      start = input?.selectionStart ?? value.length,
      end = input?.selectionEnd ?? value.length
    onChange(value.slice(0, start) + before + value.slice(start, end) + after + value.slice(end))
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + before.length, end + before.length)
    })
  }
  async function upload(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      toast.error('请选择 10MB 以内的图片')
      return
    }
    setUploading(true)
    try {
      const r = await uploadFile(
        { fileUploadRequest: { biz: FileUploadBizEnum.POST_IMAGE_COVER } },
        {},
        file
      )
      if (r.code !== 0 || !r.data?.url) throw Error(r.message || '图片上传失败')
      insert(`![图片](${r.data.url})`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '图片上传失败')
    } finally {
      setUploading(false)
    }
  }
  return (
    <Tabs
      value={view}
      onValueChange={setView}
      className={cn('flex min-w-0 flex-col gap-3', className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="edit">编辑</TabsTrigger>
          <TabsTrigger value="preview">预览</TabsTrigger>
        </TabsList>
        {view === 'edit' && (
          <div className="flex flex-wrap gap-1">
            {[
              { Icon: Bold, label: '粗体', before: '**', after: '**' },
              { Icon: Italic, label: '斜体', before: '*', after: '*' },
              { Icon: Code, label: '代码', before: '\n```javascript\n', after: '\n```\n' },
              { Icon: Link2, label: '链接', before: '[', after: '](url)' },
              { Icon: List, label: '列表', before: '\n- ', after: '' },
            ].map(({ Icon, label, before, after }) => (
              <Button
                key={label}
                type="button"
                size="icon"
                variant="ghost"
                aria-label={label}
                onClick={() => insert(before, after)}
              >
                <Icon />
              </Button>
            ))}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="插入图片"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus />
            </Button>
            <Input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="上传正文图片"
              onChange={e => {
                void upload(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>
        )}
      </div>
      <TabsContent value="edit">
        <Textarea
          ref={textRef}
          aria-label="内容正文"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '使用 Markdown 记录思路…'}
          className="min-h-80 font-mono"
          onPaste={e => {
            const file = e.clipboardData.files?.[0]
            if (file?.type.startsWith('image/')) {
              e.preventDefault()
              void upload(file)
            }
          }}
        />
      </TabsContent>
      <TabsContent value="preview" className="min-h-80">
        {value ? (
          <MarkdownRender content={value} />
        ) : (
          <p className="text-muted-foreground">填写正文后在这里预览。</p>
        )}
      </TabsContent>
    </Tabs>
  )
}
