export function ColorExamples() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Button Examples</h2>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90">
            Primary Button
          </button>
          <button className="rounded-lg bg-secondary px-6 py-3 font-medium text-secondary-foreground hover:opacity-90">
            Secondary Button
          </button>
          <button className="rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground hover:opacity-90">
            Accent Button
          </button>
          <button className="rounded-lg bg-destructive px-6 py-3 font-medium text-destructive-foreground hover:opacity-90">
            Delete
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Using Brand Colors</h2>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-lg bg-brand-primary px-6 py-3 font-medium text-white hover:bg-brand-primary-dark">
            Brand Primary
          </button>
          <button className="rounded-lg bg-brand-secondary px-6 py-3 font-medium text-brand-secondary-on-container hover:bg-brand-secondary-dark">
            Brand Secondary
          </button>
          <button className="rounded-lg bg-brand-tertiary px-6 py-3 font-medium text-white hover:bg-brand-tertiary-dark">
            Brand Tertiary
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Container Pattern</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-brand-primary-container p-6">
            <h3 className="mb-2 font-semibold text-brand-primary-on-container">Primary Container</h3>
            <p className="text-sm text-brand-primary-on-container">
              Light background with proper contrast text
            </p>
          </div>
          <div className="rounded-xl bg-brand-secondary-container p-6">
            <h3 className="mb-2 font-semibold text-brand-secondary-on-container">Secondary Container</h3>
            <p className="text-sm text-brand-secondary-on-container">
              Light background with proper contrast text
            </p>
          </div>
          <div className="rounded-xl bg-brand-tertiary-container p-6">
            <h3 className="mb-2 font-semibold text-brand-tertiary-on-container">Tertiary Container</h3>
            <p className="text-sm text-brand-tertiary-on-container">
              Light background with proper contrast text
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Cards & Surfaces</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">Card Component</h3>
            <p className="text-sm text-muted-foreground">
              Using semantic card colors for consistent theming
            </p>
          </div>
          <div className="rounded-xl border bg-muted p-6">
            <h3 className="mb-2 text-lg font-semibold">Muted Background</h3>
            <p className="text-sm text-muted-foreground">
              Subtle background for less emphasis
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Alerts & Messages</h2>
        <div className="space-y-4">
          <div className="rounded-lg bg-brand-error-container p-4">
            <p className="font-medium text-brand-error-on-container">
              ⚠️ Error: Something went wrong
            </p>
          </div>
          <div className="rounded-lg bg-brand-primary-container p-4">
            <p className="font-medium text-brand-primary-on-container">
              ℹ️ Info: Your changes have been saved
            </p>
          </div>
          <div className="rounded-lg bg-brand-secondary-container p-4">
            <p className="font-medium text-brand-secondary-on-container">
              ⭐ Success: Recipe added to favorites
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
