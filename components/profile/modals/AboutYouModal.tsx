'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { gsap } from '@/lib/gsap'

interface AboutYouModalProps {
  isOpen: boolean
  onClose: () => void
  initialValue: string
  onSave: (value: string) => void
  maxLength?: number
}

export function AboutYouModal({ 
  isOpen, 
  onClose, 
  initialValue, 
  onSave,
  maxLength = 225 
}: AboutYouModalProps) {
  const [value, setValue] = useState(initialValue)
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
              textareaRef.current?.focus()
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

  if (!mounted || !isOpen) return null

  const hasChanges = value !== initialValue

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
        style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 24px) + 80px)', maxHeight: '85vh', transform: 'translateX(-50%) translateY(100%)' }}
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
          About you
        </h2>
        <p className="mb-3 text-sm" style={{ color: '#656565' }}>
          Share a bit about yourself! Your cooking story, favorite recipes, or just something fun.
        </p>

        <div className="relative mb-1">
          <div className="absolute left-4 top-4 z-10">
            <Image
              src="/assets/icons/Edit-2.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-40"
            />
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
            placeholder="Write something punchy."
            className="w-full rounded-lg bg-white pl-12 pr-4 pt-4 pb-4 text-base resize-none focus:outline-none transition-all"
            style={{
              border: value ? '3px solid #FF7043' : '2px solid #e5e7eb',
              height: '100px'
            }}
          />
        </div>

        <div className="text-right mb-4">
          <span className="text-sm" style={{ color: '#656565' }}>
            {value.length}/{maxLength}
          </span>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`w-full rounded-full py-3.5 font-medium transition-all ${
            hasChanges
              ? 'bg-amber-100 text-foreground hover:bg-amber-200 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Save
        </button>
      </div>
    </div>,
    document.body
  )
}
