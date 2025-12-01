'use client'

import Image from 'next/image'

interface EditableInfoItemProps {
  icon: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}

export function EditableInfoItem({ 
  icon, 
  label, 
  value, 
  onChange, 
  type = 'text' 
}: EditableInfoItemProps) {
  return (
    <div className="mb-4 rounded-2xl bg-gray-100 px-4 py-3">
      <div className="flex items-center gap-4">
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
          className="opacity-60"
        />
        <div className="flex-1">
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: '#FF7043' }}
          >
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-base bg-transparent border-none outline-none pb-1"
            style={{
              color: '#363636',
              borderBottom: '2px solid #FF7043',
            }}
          />
        </div>
      </div>
    </div>
  )
}
