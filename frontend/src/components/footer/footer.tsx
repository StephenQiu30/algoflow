import Link from 'next/link'
export function Footer() {
  return (
    <footer className="page-container text-muted-foreground flex flex-wrap items-center justify-between gap-4 py-8 text-xs">
      <span>衍序 AlgoFlow · 每一次比较，都更接近理解。</span>
      <Link className="hover:text-foreground rounded-sm focus-visible:outline-2" href="/sorting">
        算法学习
      </Link>
    </footer>
  )
}
