'use client'

import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface FloatingInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  icon?: string
  iconAlt?: string
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type, label, error, icon, iconAlt = '', id, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const inputId = id || props.name
    const hasValue = value !== undefined && value !== ''
    const isFloating = isFocused || hasValue
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    const handleClear = () => {
      if (onChange) {
        const event = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
    }

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className="w-full">
        <div className="relative">
          {/* Left Icon */}
          {icon && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Image
                src={icon}
                alt={iconAlt}
                width={20}
                height={20}
                className={cn(
                  'transition-opacity',
                  error ? 'opacity-60' : 'opacity-40'
                )}
              />
            </div>
          )}

          {/* Input Field */}
          <input
            type={inputType}
            id={inputId}
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'peer w-full rounded-xl border-2 bg-white px-4 py-4 text-base text-foreground transition-colors',
              'placeholder:text-transparent focus:outline-none',
              icon ? 'pl-12' : 'pl-4',
              hasValue && !isPassword ? 'pr-12' : '',
              isPassword ? 'pr-24' : '',
              error
                ? 'border-brand-error focus:border-brand-error'
                : 'border-gray-200 focus:border-brand-primary',
              className
            )}
            placeholder={label}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {/* Floating Label */}
          <label
            htmlFor={inputId}
            className={cn(
              'absolute bg-white px-2 transition-all duration-200 pointer-events-none z-10',
              icon ? 'left-10' : 'left-3',
              isFloating
                ? '-top-3 text-sm font-medium'
                : 'top-1/2 -translate-y-1/2 text-base',
              error
                ? 'text-brand-error'
                : isFloating
                  ? 'text-brand-primary'
                  : 'text-gray-400'
            )}
          >
            {label}
          </label>

          {/* Right Side Actions */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Clear Button - show when there's a value */}
            {hasValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 transition-opacity hover:opacity-70"
                aria-label="Clear input"
              >
                <Image
                  src="/assets/icons/X-Circle.svg"
                  alt="Clear"
                  width={20}
                  height={20}
                  className="opacity-40"
                />
              </button>
            )}

            {/* Password Toggle - show only for password type */}
            {isPassword && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="p-1 transition-opacity hover:opacity-70"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Image
                  src={showPassword ? '/assets/icons/Eye.svg' : '/assets/icons/Eye-Slash.svg'}
                  alt={showPassword ? 'Hide password' : 'Show password'}
                  width={20}
                  height={20}
                  className="opacity-40"
                />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-brand-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'

export { FloatingInput }
