'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'

export default function ChatPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      sections,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }
    )
  }, [])

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-md px-6 py-8">
      <h1 data-animate className="mb-2 text-2xl font-bold">Chat</h1>
      <p data-animate className="text-muted-foreground">Chat with your cooking assistant</p>

      <div data-animate className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
          <Image
            src="/assets/icons/Message.svg"
            alt=""
            width={32}
            height={32}
            className="opacity-60"
          />
        </div>
        <p className="text-center text-muted-foreground">
          Coming soon...
        </p>
      </div>
    </div>
  )
}
