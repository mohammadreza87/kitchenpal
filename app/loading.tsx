export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-full bg-brand-primary/30" />
          <div className="absolute inset-2 animate-pulse rounded-full bg-brand-primary/50" />
          <div className="absolute inset-4 rounded-full bg-brand-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
