'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'

// Mock user data - in real app, this would come from user's profile/database
const initialUserData = {
  name: 'Hannah Andrew',
  email: 'hannah.1989@gmail.com',
  phone: '+31612222222',
  location: 'Amsterdam, Netherlands',
  bio: '',
  avatarUrl: '/assets/illustrations/avatar-placeholder.svg',
}

interface EditableInfoItemProps {
  icon: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}

function EditableInfoItem({ icon, label, value, onChange, type = 'text' }: EditableInfoItemProps) {
  return (
    <div className="mb-4 rounded-2xl bg-gray-100 px-4 py-3">
      <div className="flex items-center gap-4">
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
          className="opacity-60"
        />
        <div className="flex-1">
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: '#FF7043' }}
          >
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-base bg-transparent border-none outline-none pb-1"
            style={{
              color: '#363636',
              borderBottom: '2px solid #FF7043',
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface AboutYouModalProps {
  isOpen: boolean
  onClose: () => void
  initialValue: string
  onSave: (value: string) => void
}

function AboutYouModal({ isOpen, onClose, initialValue, onSave }: AboutYouModalProps) {
  const [value, setValue] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const maxLength = 225
  const modalRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
      gsap.fromTo(modalRef.current, { y: '100%' }, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          setTimeout(() => {
            textareaRef.current?.focus()
          }, 50)
        }
      })
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 })
    gsap.to(modalRef.current, { y: '100%', duration: 0.2, ease: 'power2.in', onComplete: onClose })
  }

  const handleSave = () => {
    onSave(value)
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal - fixed to bottom */}
      <div
        ref={modalRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl px-6 pt-6"
        style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 24px) + 80px)', maxHeight: '85vh' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <Image
            src="/assets/icons/X-Circle.svg"
            alt="Close"
            width={24}
            height={24}
          />
        </button>

        {/* Title */}
        <h2 className="mb-1 text-xl font-semibold" style={{ color: '#282828' }}>
          About you
        </h2>
        <p className="mb-3 text-sm" style={{ color: '#656565' }}>
          Share a bit about yourself! Your cooking story, favorite recipes, or just something fun.
        </p>

        {/* Textarea */}
        <div className="relative mb-1">
          <div className="absolute left-4 top-4 z-10">
            <Image
              src="/assets/icons/Edit-2.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-40"
            />
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Write something punchy."
            className="w-full rounded-lg bg-white pl-12 pr-4 pt-4 pb-4 text-base resize-none focus:outline-none transition-all"
            style={{
              border: value ? '3px solid #FF7043' : '2px solid #e5e7eb',
              height: '100px'
            }}
          />
        </div>

        {/* Character Counter */}
        <div className="text-right mb-4">
          <span className="text-sm" style={{ color: '#656565' }}>
            {value.length}/{maxLength}
          </span>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={value === initialValue}
          className={`w-full rounded-full py-3.5 font-medium transition-all ${
            value === initialValue
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-amber-100 text-foreground hover:bg-amber-200 active:scale-[0.98]'
          }`}
        >
          Save
        </button>
      </div>
    </div>
  )
}

interface InfoItemProps {
  icon: string
  value: string
}

function InfoItem({ icon, value }: InfoItemProps) {
  return (
    <div
      className="flex items-center gap-4 py-4 border-b"
      style={{ borderColor: '#c8c8c8' }}
    >
      <Image
        src={icon}
        alt=""
        width={24}
        height={24}
      />
      <span className="text-base" style={{ color: '#363636' }}>{value}</span>
    </div>
  )
}

interface SocialEditModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon: string
  placeholder: string
  initialValue: string
  onSave: (value: string) => void
}

function SocialEditModal({ isOpen, onClose, title, icon, placeholder, initialValue, onSave }: SocialEditModalProps) {
  const [value, setValue] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasValue = value.length > 0
  const isFloating = hasValue // Only float when there's a value, not on focus

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue, isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
      gsap.fromTo(modalRef.current, { y: '100%' }, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          setTimeout(() => {
            inputRef.current?.focus()
          }, 50)
        }
      })
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 })
    gsap.to(modalRef.current, { y: '100%', duration: 0.2, ease: 'power2.in', onComplete: onClose })
  }

  const handleSave = () => {
    onSave(value)
    handleClose()
  }

  const hasChanges = value !== initialValue

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal - fixed to bottom, will float with keyboard */}
      <div
        ref={modalRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl px-6 pt-6"
        style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 24px) + 80px)' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <Image
            src="/assets/icons/X-Circle.svg"
            alt="Close"
            width={24}
            height={24}
          />
        </button>

        {/* Title */}
        <h2 className="mb-6 text-xl font-semibold text-center" style={{ color: '#282828' }}>
          {title}
        </h2>

        {/* Input - FloatingInput style */}
        <div className="relative mb-6">
          {/* Left Icon */}
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Image
              src={icon}
              alt=""
              width={20}
              height={20}
              className="opacity-40"
            />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full rounded-lg bg-white py-4 pl-12 pr-4 text-base text-foreground transition-all placeholder:text-transparent focus:outline-none"
            style={{
              border: hasValue ? '3px solid #FF7043' : '2px solid #e5e7eb',
            }}
          />

          {/* Floating Label */}
          <label
            className={`absolute px-2 transition-all duration-200 pointer-events-none z-10 left-10 ${
              isFloating
                ? '-top-3 text-sm font-medium bg-white'
                : 'top-1/2 -translate-y-1/2 text-base'
            } ${
              isFloating
                ? 'text-brand-primary'
                : 'text-gray-400'
            }`}
          >
            {placeholder}
          </label>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`w-full rounded-full py-4 font-medium transition-all mb-3 ${
            hasChanges
              ? 'bg-amber-100 text-foreground hover:bg-amber-200 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Save
        </button>

        {/* Cancel Button */}
        <button
          onClick={handleClose}
          className="w-full rounded-full py-4 font-medium transition-all border hover:bg-gray-50 active:scale-[0.98]"
          style={{ borderColor: '#c8c8c8', color: '#FF7043' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

interface SocialItemProps {
  icon: string
  label: string
  value?: string
  onEdit: () => void
}

function SocialItem({ icon, label, value, onEdit }: SocialItemProps) {
  return (
    <div
      className="flex items-center justify-between py-4 border-b"
      style={{ borderColor: '#c8c8c8' }}
    >
      <div className="flex items-center gap-4">
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
        />
        <span className="text-base" style={{ color: '#363636' }}>{value || label}</span>
      </div>
      <button
        onClick={onEdit}
        className="p-2 rounded-full hover:bg-muted transition-colors"
      >
        <Image
          src="/assets/icons/Edit-2.svg"
          alt="Edit"
          width={20}
          height={20}
        />
      </button>
    </div>
  )
}

export default function PersonalInfoPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [bio, setBio] = useState(initialUserData.bio)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)

  // Social links state
  const [socialLinks, setSocialLinks] = useState({
    website: '',
    instagram: '',
    youtube: '',
    tiktok: '',
  })

  // Social edit modal state
  const [socialModal, setSocialModal] = useState<{
    isOpen: boolean
    type: keyof typeof socialLinks | null
    title: string
    icon: string
    placeholder: string
  }>({
    isOpen: false,
    type: null,
    title: '',
    icon: '',
    placeholder: '',
  })

  // Form state for edit mode
  const [formData, setFormData] = useState({
    name: initialUserData.name,
    email: initialUserData.email,
    phone: initialUserData.phone,
    location: initialUserData.location,
  })

  useEffect(() => {
    if (!containerRef.current) return

    const sections = containerRef.current.querySelectorAll('[data-animate]')

    gsap.fromTo(
      sections,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      }
    )
  }, [])

  const handleBack = () => {
    if (isEditMode) {
      setIsEditMode(false)
      // Reset form data
      setFormData({
        name: initialUserData.name,
        email: initialUserData.email,
        phone: initialUserData.phone,
        location: initialUserData.location,
      })
    } else {
      router.back()
    }
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleSave = () => {
    // TODO: Save to database
    setIsEditMode(false)
  }

  const handleSaveBio = (value: string) => {
    setBio(value)
    // TODO: Save to database
  }

  const updateFormData = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Check if form has changes
  const hasChanges =
    formData.name !== initialUserData.name ||
    formData.email !== initialUserData.email ||
    formData.phone !== initialUserData.phone ||
    formData.location !== initialUserData.location

  // Social modal helpers
  const openSocialModal = (type: keyof typeof socialLinks, title: string, icon: string, placeholder: string) => {
    setSocialModal({
      isOpen: true,
      type,
      title,
      icon,
      placeholder,
    })
  }

  const closeSocialModal = () => {
    setSocialModal(prev => ({ ...prev, isOpen: false }))
  }

  const handleSaveSocialLink = (value: string) => {
    if (socialModal.type) {
      setSocialLinks(prev => ({ ...prev, [socialModal.type!]: value }))
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div ref={containerRef} className="relative z-10 mx-auto w-full max-w-md px-6 py-8">
        {/* Header */}
        <div data-animate className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <Image
              src="/assets/icons/Arrow-Left.svg"
              alt="Back"
              width={24}
              height={24}
            />
          </button>
          {isEditMode ? (
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 rounded-full text-base font-medium transition-all"
              style={{
                backgroundColor: hasChanges ? '#FFEEE8' : '#FFF9F6',
                color: hasChanges ? '#FF7043' : '#FFCCBC',
                cursor: hasChanges ? 'pointer' : 'not-allowed',
              }}
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
            >
              <Image
                src="/assets/icons/Edit.svg"
                alt="Edit"
                width={24}
                height={24}
              />
            </button>
          )}
        </div>

        {/* Title */}
        <h1 data-animate className="mb-8 text-2xl font-bold" style={{ color: '#282828' }}>
          {isEditMode ? 'Edit Personal Information' : 'Profile'}
        </h1>

        {/* Profile Picture - only show when not in edit mode */}
        {!isEditMode && (
          <div data-animate className="mb-8 flex flex-col items-center">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-2xl bg-gray-200">
                <Image
                  src={initialUserData.avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-md transition-all hover:shadow-lg active:scale-95"
                onClick={handleEdit}
              >
                <Image
                  src="/assets/icons/Camera.svg"
                  alt=""
                  width={16}
                  height={16}
                  style={{ filter: 'invert(52%) sepia(67%) saturate(1042%) hue-rotate(346deg) brightness(101%) contrast(97%)' }}
                />
                <span className="text-sm font-medium" style={{ color: '#FF7043' }}>Edit</span>
              </button>
            </div>
          </div>
        )}

        {/* Personal Information Section */}
        <section data-animate className="mb-8">
          {!isEditMode && (
            <>
              <h2 className="mb-2 text-xl font-semibold" style={{ color: '#282828' }}>
                Personal Information
              </h2>
              <p className="mb-6 text-sm" style={{ color: '#656565' }}>
                Manage and update your essential details easily in one place. Your profile, your way.
              </p>
            </>
          )}

          <div>
            {isEditMode ? (
              <>
                <EditableInfoItem
                  icon="/assets/icons/Profile.svg"
                  label="Full Name"
                  value={formData.name}
                  onChange={updateFormData('name')}
                />
                <EditableInfoItem
                  icon="/assets/icons/Mail.svg"
                  label="Email Address"
                  value={formData.email}
                  onChange={updateFormData('email')}
                  type="email"
                />
                <EditableInfoItem
                  icon="/assets/icons/Phone.svg"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={updateFormData('phone')}
                  type="tel"
                />
                <EditableInfoItem
                  icon="/assets/icons/Global.svg"
                  label="Location"
                  value={formData.location}
                  onChange={updateFormData('location')}
                />
              </>
            ) : (
              <>
                <InfoItem icon="/assets/icons/Profile.svg" value={formData.name} />
                <InfoItem icon="/assets/icons/Mail.svg" value={formData.email} />
                <InfoItem icon="/assets/icons/Phone.svg" value={formData.phone} />
                <InfoItem icon="/assets/icons/Global.svg" value={formData.location} />
              </>
            )}
          </div>
        </section>

        {/* About You Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-2 text-xl font-semibold" style={{ color: '#282828' }}>
            About you
          </h2>
          <p className="mb-4 text-sm" style={{ color: '#656565' }}>
            Share a bit about yourself! Your cooking story, favorite recipes, or just something fun. This space is for you!
          </p>

          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="w-full text-left"
          >
            <div className="relative">
              <div className="absolute left-4 top-4">
                <Image
                  src="/assets/icons/Edit-2.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-50"
                />
              </div>
              <div
                className="w-full rounded-xl border pl-12 pr-4 pt-4 pb-8 text-sm min-h-[140px]"
                style={{ borderColor: '#c8c8c8' }}
              >
                {bio || <span style={{ color: '#9ca3af' }}>Write something punchy.</span>}
              </div>
              <span className="absolute right-4 bottom-3 text-sm" style={{ color: '#656565' }}>
                {bio.length}/225
              </span>
            </div>
          </button>
        </section>

        {/* Web & Social Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-2 text-xl font-semibold" style={{ color: '#282828' }}>
            Web & Social
            <span className="text-base font-normal" style={{ color: '#656565' }}>(Optional)</span>
          </h2>
          <p className="mb-6 text-sm" style={{ color: '#656565' }}>
            Connect with your favorite social platforms effortlessly and share your culinary adventures with friends!
          </p>

          <div>
            <SocialItem
              icon="/assets/icons/Link.svg"
              label="Website"
              value={socialLinks.website}
              onEdit={() => openSocialModal('website', 'Website', '/assets/icons/Link.svg', 'URL')}
            />
            <SocialItem
              icon="/assets/icons/Instagram.svg"
              label="Instagram"
              value={socialLinks.instagram}
              onEdit={() => openSocialModal('instagram', 'Instagram', '/assets/icons/Instagram.svg', 'Username')}
            />
            <SocialItem
              icon="/assets/icons/Youtube.svg"
              label="Youtube"
              value={socialLinks.youtube}
              onEdit={() => openSocialModal('youtube', 'Youtube', '/assets/icons/Youtube.svg', 'Channel URL')}
            />
            <SocialItem
              icon="/assets/icons/TikTok.svg"
              label="TikTok"
              value={socialLinks.tiktok}
              onEdit={() => openSocialModal('tiktok', 'TikTok', '/assets/icons/TikTok.svg', 'Username')}
            />
          </div>
        </section>

        {/* Delete Account */}
        <section data-animate className="mb-8">
          <Link href="/profile/personal-info/delete-account" className="flex items-center gap-3 py-2">
            <Image
              src="/assets/icons/Trash.svg"
              alt=""
              width={24}
              height={24}
              className="text-red-500"
              style={{ filter: 'invert(36%) sepia(95%) saturate(2404%) hue-rotate(337deg) brightness(91%) contrast(89%)' }}
            />
            <span className="text-base font-medium" style={{ color: '#E53935' }}>
              Delete Account
            </span>
          </Link>
        </section>
      </div>

      {/* About You Modal */}
      <AboutYouModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        initialValue={bio}
        onSave={handleSaveBio}
      />

      {/* Social Edit Modal */}
      <SocialEditModal
        isOpen={socialModal.isOpen}
        onClose={closeSocialModal}
        title={socialModal.title}
        icon={socialModal.icon}
        placeholder={socialModal.placeholder}
        initialValue={socialModal.type ? socialLinks[socialModal.type] : ''}
        onSave={handleSaveSocialLink}
      />
    </div>
  )
}
