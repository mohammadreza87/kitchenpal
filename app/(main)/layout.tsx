'use client'

import { BottomNav } from '@/components/navigation/BottomNav'
import { PageTransition } from '@/components/transitions'
import { FavoritesProvider, GeneratedRecipesProvider, ReviewsProvider } from '@/hooks'
import { usePathname } from 'next/navigation'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const basePath = '/' + (pathname?.split('/')[1] || '')
  const isChat = basePath === '/chat'

  return (
    <GeneratedRecipesProvider>
      <FavoritesProvider>
        <ReviewsProvider>
          <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1 pb-24 overflow-hidden">
              {isChat ? children : <PageTransition>{children}</PageTransition>}
            </main>
            <BottomNav />
          </div>
        </ReviewsProvider>
      </FavoritesProvider>
    </GeneratedRecipesProvider>
  )
}
