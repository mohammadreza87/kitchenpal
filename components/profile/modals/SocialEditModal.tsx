'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { gsap } from '@/lib/gsap'

interface SocialEditModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon: string
  placeholder: string
  initialValue: string
  onSave: (value: string) => void
}

export function SocialEditModal({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  placeholder, 
  initialValue, 
  onSave 
}: SocialEditModalProps) {
  const [value, setValue] = useState(initialValue)
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasValue = value.length > 0
  const isFloating = hasValue

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue, isOpen])

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined

    if (isOpen && modalRef.current && backdropRef.current) {
      document.body.style.overflow = 'hidden'

      // Small delay to ensure DOM is painted with initial styles
      timer = setTimeout(() => {
        gsap.to(backdropRef.current, { opacity: 1, duration: 0.2 })
        gsap.to(modalRef.current, {
          y: '0%',
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            setTimeout(() => {
              inputRef.current?.focus()
            }, 50)
          }
        })
      }, 10)
    }

    return () => {
      if (timer) clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 })
    gsap.to(modalRef.current, { y: '100%', duration: 0.2, ease: 'power2.in', onComplete: onClose })
  }

  const handleSave = () => {
    onSave(value)
    handleClose()
  }

  const hasChanges = value !== initialValue

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50"
        style={{ opacity: 0 }}
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-white rounded-t-3xl px-6 pt-6"
        style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 24px) + 80px)', transform: 'translateX(-50%) translateY(100%)' }}
      >
        <button
          onClick={handleClose}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <Image
            src="/assets/icons/X-Circle.svg"
            alt="Close"
            width={24}
            height={24}
          />
        </button>

        <h2 className="mb-6 text-xl font-semibold text-center" style={{ color: '#282828' }}>
          {title}
        </h2>

        <div className="relative mb-6">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Image
              src={icon}
              alt=""
              width={20}
              height={20}
              className="opacity-40"
            />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg bg-white py-4 pl-12 pr-4 text-base text-foreground transition-all placeholder:text-transparent focus:outline-none"
            style={{
              border: hasValue ? '3px solid #FF7043' : '2px solid #e5e7eb',
            }}
          />

          <label
            className={`absolute px-2 transition-all duration-200 pointer-events-none z-10 left-10 ${
              isFloating
                ? '-top-3 text-sm font-medium bg-white'
                : 'top-1/2 -translate-y-1/2 text-base'
            } ${
              isFloating
                ? 'text-brand-primary'
                : 'text-gray-400'
            }`}
          >
            {placeholder}
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`w-full rounded-full py-4 font-medium transition-all mb-3 ${
            hasChanges
              ? 'bg-amber-100 text-foreground hover:bg-amber-200 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Save
        </button>

        <button
          onClick={handleClose}
          className="w-full rounded-full py-4 font-medium transition-all border hover:bg-gray-50 active:scale-[0.98]"
          style={{ borderColor: '#c8c8c8', color: '#FF7043' }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  )
}
