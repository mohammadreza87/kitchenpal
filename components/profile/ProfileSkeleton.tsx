'use client'

export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-6 h-8 w-24 rounded bg-gray-200" />

      {/* Profile Info */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="mb-2 h-5 w-32 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-200" />
        </div>
      </div>

      {/* Banner */}
      <div className="mb-8 h-32 rounded-2xl bg-gray-200" />

      {/* Section */}
      <div className="mb-6">
        <div className="mb-2 h-5 w-24 rounded bg-gray-200" />
        <div className="h-14 rounded-xl bg-gray-200" />
      </div>

      {/* Section */}
      <div className="mb-6">
        <div className="mb-2 h-5 w-20 rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-14 rounded-xl bg-gray-200" />
          <div className="h-14 rounded-xl bg-gray-200" />
          <div className="h-14 rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export function PersonalInfoSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="h-10 w-10 rounded-full bg-gray-200" />
      </div>

      {/* Title */}
      <div className="mb-8 h-8 w-32 rounded bg-gray-200" />

      {/* Avatar */}
      <div className="mb-8 flex flex-col items-center">
        <div className="h-32 w-32 rounded-2xl bg-gray-200" />
      </div>

      {/* Info Items */}
      <div className="mb-8">
        <div className="mb-2 h-6 w-40 rounded bg-gray-200" />
        <div className="mb-4 h-4 w-full rounded bg-gray-200" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100">
              <div className="h-6 w-6 rounded bg-gray-200" />
              <div className="h-5 w-48 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NotificationsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-6 h-10 w-10 rounded-full bg-gray-200" />

      {/* Title */}
      <div className="mb-8 h-8 w-32 rounded bg-gray-200" />

      {/* Section */}
      <div className="mb-8">
        <div className="mb-6 h-5 w-36 rounded bg-gray-200" />
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-5 w-40 rounded bg-gray-200" />
              <div className="h-6 w-12 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Section */}
      <div className="mb-12">
        <div className="mb-6 h-5 w-36 rounded bg-gray-200" />
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-5 w-40 rounded bg-gray-200" />
              <div className="h-6 w-12 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SecuritySkeleton() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-6 h-10 w-10 rounded-full bg-gray-200" />

      {/* Title */}
      <div className="mb-8 h-8 w-40 rounded bg-gray-200" />

      {/* Section */}
      <div className="mb-8">
        <div className="mb-6 h-5 w-36 rounded bg-gray-200" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1 h-5 w-40 rounded bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
                <div className="h-6 w-12 rounded-full bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Devices */}
      <div className="mb-8">
        <div className="mb-4 h-5 w-36 rounded bg-gray-200" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  )
}
