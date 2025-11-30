'use client'

import { BottomNav } from '@/components/navigation/BottomNav'
import { PageTransition } from '@/components/transitions'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 pb-20 overflow-hidden">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <BottomNav />
    </div>
  )
}
