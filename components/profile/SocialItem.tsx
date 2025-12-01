'use client'

import Image from 'next/image'

interface SocialItemProps {
  icon: string
  label: string
  value?: string
  onEdit: () => void
}

export function SocialItem({ icon, label, value, onEdit }: SocialItemProps) {
  return (
    <div
      className="flex items-center justify-between py-4 border-b"
      style={{ borderColor: '#c8c8c8' }}
    >
      <div className="flex items-center gap-4">
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
        />
        <span className="text-base" style={{ color: '#363636' }}>{value || label}</span>
      </div>
      <button
        onClick={onEdit}
        className="p-2 rounded-full hover:bg-muted transition-colors"
      >
        <Image
          src="/assets/icons/Edit-2.svg"
          alt="Edit"
          width={20}
          height={20}
        />
      </button>
    </div>
  )
}
