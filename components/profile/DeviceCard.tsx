'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface DeviceCardProps {
  id: string
  name: string
  location: string
  lastSeen: string
  isCurrent?: boolean
  loading?: boolean
  onSignOut: (id: string) => void
}

export function DeviceCard({ 
  id, 
  name, 
  location, 
  lastSeen, 
  isCurrent,
  loading,
  onSignOut 
}: DeviceCardProps) {
  return (
    <div
      className={cn(
        'mb-3 rounded-2xl border bg-white px-4 py-3',
        isCurrent ? 'border-brand-primary' : 'border-gray-200'
      )}
      style={{ borderColor: isCurrent ? '#FF7043' : '#e5e7eb' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-2xl',
              isCurrent ? 'bg-amber-100' : 'bg-gray-100'
            )}
          >
            <Image
              src={isCurrent ? '/assets/icons/Lock-2.svg' : '/assets/icons/Global.svg'}
              alt=""
              width={22}
              height={22}
              style={isCurrent ? { filter: 'invert(52%) sepia(67%) saturate(1042%) hue-rotate(346deg) brightness(101%) contrast(97%)' } : {}}
            />
          </div>
          <div>
            <p className="text-base font-semibold" style={{ color: '#363636' }}>
              {name}
            </p>
            <p className="text-sm" style={{ color: '#656565' }}>
              {location}
            </p>
            <p className="mt-1 text-xs font-medium" style={{ color: '#332B10' }}>
              {lastSeen}
            </p>
          </div>
        </div>
        {!isCurrent && (
          <button
            onClick={() => onSignOut(id)}
            disabled={loading}
            className="rounded-full border px-3 py-2 text-sm font-medium transition-all hover:bg-brand-primary/5 active:scale-[0.98] disabled:opacity-50"
            style={{ borderColor: '#ffc5b4', color: '#FF7043' }}
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        )}
      </div>
    </div>
  )
}
