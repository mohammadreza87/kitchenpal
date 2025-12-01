'use client'

interface PreferenceChipProps {
  label: string
  onRemove?: () => void
}

export function PreferenceChip({ label, onRemove }: PreferenceChipProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-amber-50 px-3 py-2">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
        <svg
          className="h-3 w-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg
            className="h-3 w-3 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
