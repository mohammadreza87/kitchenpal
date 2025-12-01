'use client'

import Image from 'next/image'

interface InfoItemProps {
  icon: string
  value: string
}

export function InfoItem({ icon, value }: InfoItemProps) {
  return (
    <div
      className="flex items-center gap-4 py-4 border-b"
      style={{ borderColor: '#c8c8c8' }}
    >
      <Image
        src={icon}
        alt=""
        width={24}
        height={24}
      />
      <span className="text-base" style={{ color: '#363636' }}>{value}</span>
    </div>
  )
}
