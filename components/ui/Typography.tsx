import { type ReactNode, type ElementType } from 'react'
import { cn } from '@/lib/utils'
import { type TypographyVariant } from '@/lib/typography'

interface TypographyProps {
  variant: TypographyVariant
  children: ReactNode
  className?: string
  as?: ElementType
  color?: 'default' | 'muted' | 'primary' | 'error'
}

const variantToElement: Record<string, ElementType> = {
  'display-lg': 'h1',
  'display-md': 'h1',
  'display-sm': 'h2',
  'heading-lg': 'h1',
  'heading-md': 'h2',
  'heading-sm': 'h3',
  'title-lg': 'h4',
  'title-md': 'h5',
  'title-sm': 'h6',
  'label-lg': 'span',
  'label-md': 'span',
  'label-sm': 'span',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
}

const colorClasses = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-brand-primary',
  error: 'text-brand-error',
}

/**
 * Typography component
 *
 * Enforces the KitchenPal typography system with Poppins font.
 * Use this component for consistent text styling across the app.
 *
 * @example
 * <Typography variant="heading-lg">Page Title</Typography>
 * <Typography variant="body-md" color="muted">Description text</Typography>
 * <Typography variant="label-lg" as="button">Button Text</Typography>
 */
export function Typography({
  variant,
  children,
  className,
  as,
  color = 'default',
}: TypographyProps) {
  const Component = as || variantToElement[variant] || 'span'

  return (
    <Component
      className={cn(
        `text-${variant}`,
        colorClasses[color],
        className
      )}
    >
      {children}
    </Component>
  )
}

// Convenience components for common use cases
export function DisplayLarge({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="display-lg" className={className} {...props}>{children}</Typography>
}

export function DisplayMedium({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="display-md" className={className} {...props}>{children}</Typography>
}

export function DisplaySmall({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="display-sm" className={className} {...props}>{children}</Typography>
}

export function HeadingLarge({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading-lg" className={className} {...props}>{children}</Typography>
}

export function HeadingMedium({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading-md" className={className} {...props}>{children}</Typography>
}

export function HeadingSmall({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading-sm" className={className} {...props}>{children}</Typography>
}

export function TitleLarge({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="title-lg" className={className} {...props}>{children}</Typography>
}

export function TitleMedium({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="title-md" className={className} {...props}>{children}</Typography>
}

export function TitleSmall({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="title-sm" className={className} {...props}>{children}</Typography>
}

export function LabelLarge({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="label-lg" className={className} {...props}>{children}</Typography>
}

export function LabelMedium({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="label-md" className={className} {...props}>{children}</Typography>
}

export function LabelSmall({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="label-sm" className={className} {...props}>{children}</Typography>
}

export function BodyLarge({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body-lg" className={className} {...props}>{children}</Typography>
}

export function BodyMedium({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body-md" className={className} {...props}>{children}</Typography>
}

export function BodySmall({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body-sm" className={className} {...props}>{children}</Typography>
}
