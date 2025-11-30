'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ProfileMenuItemProps {
  icon: string
  label: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'danger'
}

export function ProfileMenuItem({
  icon,
  label,
  href,
  onClick,
  variant = 'default'
}: ProfileMenuItemProps) {
  const content = (
    <div
      className={cn(
        'flex items-center justify-between py-4 border-b transition-colors',
        onClick && 'cursor-pointer'
      )}
      style={{ borderColor: '#c8c8c8' }}
    >
      <div className="flex items-center gap-4">
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
        />
        <span className={cn(
          'text-base',
          variant === 'danger' ? 'text-brand-primary font-medium' : 'text-foreground'
        )}>
          {label}
        </span>
      </div>
      {href && (
        <Image
          src="/assets/icons/Chevron-Right.svg"
          alt=""
          width={20}
          height={20}
        />
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return content
}
