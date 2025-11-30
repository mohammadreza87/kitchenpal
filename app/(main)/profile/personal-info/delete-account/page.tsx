'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from '@/lib/gsap'

export default function DeleteAccountPage() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const sections = containerRef.current.querySelectorAll('[data-animate]')

        gsap.fromTo(
            sections,
            { y: 20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.4,
                stagger: 0.05,
                ease: 'power2.out',
            }
        )
    }, [])

    const handleDelete = () => {
        // In a real app, this would trigger the deletion logic
        console.log('Account deleted')
        router.push('/login')
    }

    return (
        <div ref={containerRef} className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-background px-6 py-8">
            {/* Header */}
            <div data-animate className="mb-8 flex items-center gap-4">
                <Link href="/profile/personal-info" className="transition-opacity hover:opacity-70">
                    <Image
                        src="/assets/icons/Arrow-Left.svg"
                        alt="Back"
                        width={24}
                        height={24}
                    />
                </Link>
                <h1 className="text-2xl font-bold">Delete Account</h1>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center pb-20">
                {/* Illustration */}
                <div data-animate className="mb-8 relative h-64 w-full max-w-[280px]">
                    <Image
                        src="/assets/illustrations/auth/DeleteAccountProperty 1=1.svg"
                        alt="Sad illustration"
                        fill
                        className="object-contain"
                    />
                </div>

                {/* Warning Text */}
                <div data-animate className="mb-12 text-center">
                    <p className="text-base leading-relaxed text-gray-600">
                        When you delete your account, all your information will be permanently removed.
                        We're sad to see you go, but we respect your decision to move on.
                    </p>
                </div>

                {/* Actions */}
                <div data-animate className="w-full space-y-4">
                    <button
                        onClick={handleDelete}
                        className="w-full rounded-full border border-red-500 py-3.5 text-base font-medium text-red-500 transition-all hover:bg-red-50 active:scale-[0.98]"
                    >
                        Delete My Account
                    </button>

                    <Link
                        href="/profile/personal-info"
                        className="flex w-full items-center justify-center rounded-full bg-brand-primary py-3.5 text-base font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                        Cancel
                    </Link>
                </div>
            </div>

            {/* Background Shape */}
            <div className="absolute bottom-0 left-0 right-0 -z-0">
                <Image
                    src="/assets/backgrounds/Backgroud Shape.svg"
                    alt=""
                    width={400}
                    height={200}
                    className="w-full object-cover"
                />
            </div>
        </div>
    )
}
