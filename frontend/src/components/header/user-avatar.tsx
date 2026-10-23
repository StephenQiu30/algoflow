import { cn } from '@/lib/utils'
import { UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
  user?: UserAPI.UserVO | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  alt?: string
}

const sizeMap = {
  sm: 'size-5',
  md: 'size-10',
  lg: 'size-16',
  xl: 'size-32',
}

const iconSizeMap = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-10',
  xl: 'size-20',
}

export function UserAvatar({ user, size = 'md', className, alt }: UserAvatarProps) {
  const sizeClass = sizeMap[size]
  const iconSizeClass = iconSizeMap[size]
  const avatarUrl = user?.userAvatar
  const userName = user?.userName || alt || '用户头像'

  return (
    <Avatar className={cn(sizeClass, className)}>
      <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />
      <AvatarFallback className={cn(size === 'lg' || size === 'xl' ? 'bg-primary/10' : 'bg-muted')}>
        <UserCircle
          className={cn(
            size === 'lg' || size === 'xl' ? 'text-primary' : 'text-muted-foreground',
            iconSizeClass
          )}
        />
      </AvatarFallback>
    </Avatar>
  )
}
