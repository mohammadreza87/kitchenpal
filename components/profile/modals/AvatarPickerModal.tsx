'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

// Pre-made avatar options
const avatarOptions = [
  '/assets/illustrations/profile/Profile Pic.svg',
  '/assets/illustrations/profile/Profile Pic-1.svg',
  '/assets/illustrations/profile/Profile Pic-2.svg',
  '/assets/illustrations/profile/Profile Pic-3.svg',
  '/assets/illustrations/profile/Profile Pic-4.svg',
  '/assets/illustrations/profile/Profile Pic-5.svg',
  '/assets/illustrations/profile/Profile Pic-6.svg',
  '/assets/illustrations/profile/Profile Pic-7.svg',
]

interface AvatarPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatar: string
  onSelectAvatar: (avatarUrl: string) => void
  onUploadAvatar: (file: File) => void
}

export function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar,
  onUploadAvatar,
}: AvatarPickerModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setSelectedAvatar(null)
  }, [isOpen])

  // Handle open animation
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Use setTimeout to ensure DOM is painted before triggering animation
      timer = setTimeout(() => {
        setIsVisible(true)
      }, 50)
    } else {
      setIsVisible(false)
    }
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200) // Match transition duration
  }

  const handleSave = () => {
    if (selectedAvatar) {
      onSelectAvatar(selectedAvatar)
      handleClose()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await onUploadAvatar(file)
      handleClose()
    } catch (error) {
      console.error('Failed to upload avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  if (!mounted || (!isOpen && !isClosing)) return null

  const hasSelection = selectedAvatar !== null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s ease-out'
        }}
        onClick={handleClose}
      />

      <div
        className="fixed bottom-0 left-1/2 w-full max-w-3xl bg-white rounded-t-3xl px-6 pt-6 max-h-[85vh] overflow-y-auto"
        style={{
          paddingBottom: 'calc(max(env(safe-area-inset-bottom), 24px) + 80px)',
          transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100%)',
          transition: 'transform 0.3s ease-out'
        }}
      >
        <button
          onClick={handleClose}
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <Image
            src="/assets/icons/X-Circle.svg"
            alt="Close"
            width={24}
            height={24}
          />
        </button>

        <h2 className="mb-1 text-xl font-semibold" style={{ color: '#282828' }}>
          Choose your avatar
        </h2>
        <p className="mb-6 text-sm" style={{ color: '#656565' }}>
          Select from our collection or upload your own photo.
        </p>

        {/* Avatar Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {avatarOptions.map((avatar, index) => {
            const isSelected = selectedAvatar === avatar
            const isCurrent = currentAvatar === avatar && !selectedAvatar

            return (
              <button
                key={index}
                onClick={() => setSelectedAvatar(avatar)}
                className={cn(
                  'relative aspect-square rounded-full overflow-hidden transition-all',
                  isSelected && 'ring-3 ring-brand-primary ring-offset-2',
                  isCurrent && !isSelected && 'ring-2 ring-gray-300 ring-offset-1'
                )}
              >
                <Image
                  src={avatar}
                  alt={`Avatar option ${index + 1}`}
                  fill
                  className="object-cover scale-110"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Upload Custom Photo */}
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium transition-colors hover:border-brand-primary hover:bg-brand-primary/5 disabled:opacity-50"
          style={{ color: '#656565' }}
        >
          <Image
            src="/assets/icons/Camera.svg"
            alt=""
            width={20}
            height={20}
            className="opacity-60"
          />
          {uploading ? 'Uploading...' : 'Upload your own photo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!hasSelection}
          className={cn(
            'w-full rounded-full py-3.5 font-medium transition-all',
            hasSelection
              ? 'bg-amber-100 text-foreground hover:bg-amber-200 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          Save
        </button>
      </div>
    </div>,
    document.body
  )
}
