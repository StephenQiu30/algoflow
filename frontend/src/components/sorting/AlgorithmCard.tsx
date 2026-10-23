import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SortingAlgorithmInfo } from '@/lib/sortingAlgorithms'
import { cn } from '@/lib/utils'
export type AlgorithmInfo = SortingAlgorithmInfo
export function AlgorithmCard({
  algorithm,
  href,
  className,
}: {
  algorithm: SortingAlgorithmInfo
  href: string
  className?: string
}) {
  return (
    <Card className={cn('bg-muted flex h-full flex-col', className)}>
      <CardHeader>
        <CardTitle>{algorithm.name}</CardTitle>
        <CardDescription className="line-clamp-3">{algorithm.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-xs">
          平均 {algorithm.timeComplexity.average} · {algorithm.stability}
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button asChild variant="ghost">
          <Link href={href}>
            学习原理
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
