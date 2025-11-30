'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const skillLevels = [
  { id: 'beginner', label: 'Beginner', icon: '/assets/icons/Beginner.svg' },
  { id: 'enthusiast', label: 'Enthusiast', icon: '/assets/icons/Enthusiast.svg' },
  { id: 'advanced', label: 'Advanced', icon: '/assets/icons/Advanced.svg' },
]

export default function CookingSkillsPage() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  return (
    <>
      <section className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Cooking Skills</h1>
        <p className="mb-6 text-muted-foreground">
          Share your cooking expertise with us so we can recommend recipes that match your skill level.
        </p>

        <div className="flex flex-wrap gap-3">
          {skillLevels.map((skill) => {
            const isSelected = selectedSkill === skill.id
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => setSelectedSkill(skill.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-200 active:scale-95',
                  isSelected
                    ? 'border-gray-300 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                {/* Icon with checkmark overlay */}
                <div className="relative h-8 w-8 flex-shrink-0">
                  <Image
                    src={skill.icon}
                    alt={skill.label}
                    width={32}
                    height={32}
                    className={cn(
                      'h-8 w-8 transition-all duration-200',
                      isSelected && 'scale-90 opacity-30'
                    )}
                  />
                  {/* Checkmark overlay - centered on image */}
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center transition-all duration-200',
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full bg-foreground transition-transform duration-300',
                        isSelected && 'animate-check-pop'
                      )}
                    >
                      <svg
                        className={cn(
                          'h-3.5 w-3.5 text-white transition-all duration-200 delay-75',
                          isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                          style={{
                            strokeDasharray: 24,
                            strokeDashoffset: isSelected ? 0 : 24,
                            transition: 'stroke-dashoffset 0.3s ease-out 0.1s'
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <span className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  isSelected ? 'text-foreground' : 'text-gray-700'
                )}>
                  {skill.label}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}
