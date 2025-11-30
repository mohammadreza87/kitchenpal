'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked)
            props.onChange?.(e)
        }

        return (
            <label
                className={cn(
                    'relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out',
                    disabled ? 'cursor-not-allowed opacity-50' : '',
                    className
                )}
                style={{ backgroundColor: checked ? '#FF7043' : '#E5E7EB' }}
            >
                <input
                    type="checkbox"
                    className="peer sr-only"
                    ref={ref}
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    {...props}
                />
                <span
                    className={cn(
                        'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                        checked ? 'translate-x-7' : 'translate-x-1'
                    )}
                />
            </label>
        )
    }
)
Switch.displayName = 'Switch'

export { Switch }
