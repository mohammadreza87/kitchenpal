'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useProfile } from '@/hooks/useProfile'
import {
  InfoItem,
  EditableInfoItem,
  SocialItem,
  PersonalInfoSkeleton,
  AboutYouModal,
  SocialEditModal
} from '@/components/profile'

type SocialLinkKey = 'website' | 'instagram' | 'youtube' | 'tiktok'

export default function PersonalInfoPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { profile, socialLinks, loading, updateProfile, updateSocialLinks, uploadAvatar } = useProfile()

  const [isEditMode, setIsEditMode] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state for edit mode
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
  })

  // Social edit modal state
  const [socialModal, setSocialModal] = useState<{
    isOpen: boolean
    type: SocialLinkKey | null
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

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
      })
    }
  }, [profile])

  useEffect(() => {
    if (!containerRef.current || loading) return

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
  }, [loading])

  const handleBack = () => {
    if (isEditMode) {
      setIsEditMode(false)
      // Reset form data
      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
        })
      }
    } else {
      router.back()
    }
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
      })
      setIsEditMode(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBio = async (value: string) => {
    try {
      await updateProfile({ bio: value })
    } catch (error) {
      console.error('Failed to save bio:', error)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await uploadAvatar(file)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
    }
  }

  const updateFormData = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Check if form has changes
  const hasChanges = profile && (
    formData.full_name !== (profile.full_name || '') ||
    formData.phone !== (profile.phone || '') ||
    formData.location !== (profile.location || '')
  )

  // Social modal helpers
  const openSocialModal = (type: SocialLinkKey, title: string, icon: string, placeholder: string) => {
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

  const handleSaveSocialLink = async (value: string) => {
    if (socialModal.type) {
      try {
        await updateSocialLinks({ [socialModal.type]: value })
      } catch (error) {
        console.error('Failed to save social link:', error)
      }
    }
  }

  if (loading) {
    return <PersonalInfoSkeleton />
  }

  const avatarUrl = profile?.avatar_url || '/assets/illustrations/avatar-placeholder.svg'

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
              disabled={!hasChanges || saving}
              className="px-4 py-2 rounded-full text-base font-medium transition-all"
              style={{
                backgroundColor: hasChanges && !saving ? '#FFEEE8' : '#FFF9F6',
                color: hasChanges && !saving ? '#FF7043' : '#FFCCBC',
                cursor: hasChanges && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
            >
              <Image
                src="/assets/icons/Edit-2.svg"
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
                  src={avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <label className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-md transition-all hover:shadow-lg active:scale-95 cursor-pointer">
                <Image
                  src="/assets/icons/Camera.svg"
                  alt=""
                  width={16}
                  height={16}
                  style={{ filter: 'invert(52%) sepia(67%) saturate(1042%) hue-rotate(346deg) brightness(101%) contrast(97%)' }}
                />
                <span className="text-sm font-medium" style={{ color: '#FF7043' }}>Edit</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
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
                  value={formData.full_name}
                  onChange={updateFormData('full_name')}
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
                <InfoItem icon="/assets/icons/Profile.svg" value={profile?.full_name || 'Not set'} />
                <InfoItem icon="/assets/icons/Mail.svg" value={profile?.email || 'Not set'} />
                <InfoItem icon="/assets/icons/Phone.svg" value={profile?.phone || 'Not set'} />
                <InfoItem icon="/assets/icons/Global.svg" value={profile?.location || 'Not set'} />
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
                {profile?.bio || <span style={{ color: '#9ca3af' }}>Write something punchy.</span>}
              </div>
              <span className="absolute right-4 bottom-3 text-sm" style={{ color: '#656565' }}>
                {(profile?.bio || '').length}/225
              </span>
            </div>
          </button>
        </section>

        {/* Web & Social Section */}
        <section data-animate className="mb-8">
          <h2 className="mb-2 text-xl font-semibold" style={{ color: '#282828' }}>
            Web & Social{' '}
            <span className="text-base font-normal" style={{ color: '#656565' }}>(Optional)</span>
          </h2>
          <p className="mb-6 text-sm" style={{ color: '#656565' }}>
            Connect with your favorite social platforms effortlessly and share your culinary adventures with friends!
          </p>

          <div>
            <SocialItem
              icon="/assets/icons/Link.svg"
              label="Website"
              value={socialLinks?.website || undefined}
              onEdit={() => openSocialModal('website', 'Website', '/assets/icons/Link.svg', 'URL')}
            />
            <SocialItem
              icon="/assets/icons/Instagram.svg"
              label="Instagram"
              value={socialLinks?.instagram || undefined}
              onEdit={() => openSocialModal('instagram', 'Instagram', '/assets/icons/Instagram.svg', 'Username')}
            />
            <SocialItem
              icon="/assets/icons/Youtube.svg"
              label="Youtube"
              value={socialLinks?.youtube || undefined}
              onEdit={() => openSocialModal('youtube', 'Youtube', '/assets/icons/Youtube.svg', 'Channel URL')}
            />
            <SocialItem
              icon="/assets/icons/TikTok.svg"
              label="TikTok"
              value={socialLinks?.tiktok || undefined}
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
        initialValue={profile?.bio || ''}
        onSave={handleSaveBio}
      />

      {/* Social Edit Modal */}
      <SocialEditModal
        isOpen={socialModal.isOpen}
        onClose={closeSocialModal}
        title={socialModal.title}
        icon={socialModal.icon}
        placeholder={socialModal.placeholder}
        initialValue={socialModal.type && socialLinks ? (socialLinks[socialModal.type] || '') : ''}
        onSave={handleSaveSocialLink}
      />
    </div>
  )
}
