export default function OnboardingLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-2 h-8 w-48 rounded bg-gray-200" />
      <div className="mb-6 h-4 w-64 rounded bg-gray-200" />
      <div className="flex flex-wrap gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-gray-200" />
        ))}
      </div>
    </div>
  )
}
