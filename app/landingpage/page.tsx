'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'

// Feature data
const features = [
  {
    icon: '/assets/icons/Message-2.svg',
    title: 'AI Chat',
    description: 'Tell us your ingredients and preferences, get personalized recipes instantly',
    gradient: 'from-orange-400 to-rose-400',
  },
  {
    icon: '/assets/icons/Camera.svg',
    title: 'Photo to Recipe',
    description: 'Snap a photo of any dish and get the full recipe with ingredients',
    gradient: 'from-emerald-400 to-cyan-400',
  },
  {
    icon: '/assets/icons/Star.svg',
    title: 'AI Generated',
    description: 'Create unique recipes with AI-generated images and step-by-step instructions',
    gradient: 'from-violet-400 to-purple-400',
  },
]

// Roadmap data
const roadmap = [
  {
    status: 'live',
    title: 'AI Recipe Generation',
    description: 'Generate recipes from ingredients with AI',
    icon: '/assets/icons/Fire.svg',
  },
  {
    status: 'live',
    title: 'Photo Recognition',
    description: 'Identify dishes from photos',
    icon: '/assets/icons/Camera.svg',
  },
  {
    status: 'coming',
    title: 'Meal Planning',
    description: 'Weekly meal plans based on your diet goals',
    icon: '/assets/icons/Clock.svg',
  },
  {
    status: 'coming',
    title: 'Instacart Integration',
    description: 'Order ingredients directly from recipes',
    icon: '/assets/icons/Shipping.svg',
  },
  {
    status: 'future',
    title: 'Diet Programs',
    description: 'Personalized diet programs with nutritionist guidance',
    icon: '/assets/icons/Fork.svg',
  },
  {
    status: 'future',
    title: 'Social Cooking',
    description: 'Share recipes and cook together with friends',
    icon: '/assets/icons/2User.svg',
  },
]

// Stats data
const stats = [
  { value: '10K+', label: 'Recipes Generated' },
  { value: '50+', label: 'Cuisines' },
  { value: '4.9', label: 'App Rating' },
]

// How it works data
const howItWorks = [
  {
    step: '01',
    title: 'Tell Us What You Have',
    desc: 'Enter your ingredients, snap a photo, or describe what you\'re craving',
    icon: '/assets/icons/Edit-2.svg'
  },
  {
    step: '02',
    title: 'AI Creates Your Recipe',
    desc: 'Our AI generates a personalized recipe with detailed instructions',
    icon: '/assets/icons/Setting.svg'
  },
  {
    step: '03',
    title: 'Start Cooking!',
    desc: 'Follow step-by-step instructions with AI-generated images',
    icon: '/assets/icons/Fork.svg'
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [activeFeature, setActiveFeature] = useState(0)

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const roadmapRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hero animation
    const tl = gsap.timeline()
    const hero = heroRef.current
    const phone = phoneRef.current

    if (!hero) return

    const badge = hero.querySelector('.hero-badge')
    const title = hero.querySelector('.hero-title')
    const subtitle = hero.querySelector('.hero-subtitle')
    const cta = hero.querySelector('.hero-cta')

    if (badge) {
      tl.fromTo(badge,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
    }
    if (title) {
      tl.fromTo(title,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.3'
      )
    }
    if (subtitle) {
      tl.fromTo(subtitle,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      )
    }
    if (cta) {
      tl.fromTo(cta,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.2'
      )
    }
    if (phone) {
      tl.fromTo(phone,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' },
        '-=0.4'
      )
    }

    // Scroll animations
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    if (featuresRef.current) observer.observe(featuresRef.current)
    if (roadmapRef.current) observer.observe(roadmapRef.current)
    if (ctaRef.current) observer.observe(ctaRef.current)

    return () => observer.disconnect()
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="KitchenPal"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <span className="font-bold text-xl text-gray-900">KitchenPal</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-5 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-full hover:bg-brand-primary-dark transition-all hover:shadow-lg hover:shadow-orange-200 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-white to-white pointer-events-none" />

        {/* Floating food illustrations */}
        <div className="absolute top-20 left-10 opacity-20 animate-float">
          <Image src="/assets/illustrations/food/Italian Cuisine.svg" alt="" width={80} height={80} />
        </div>
        <div className="absolute top-40 right-10 opacity-20 animate-float-delayed">
          <Image src="/assets/illustrations/food/Japanese Dishes.svg" alt="" width={60} height={60} />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-sm font-medium text-orange-700">AI-Powered Cooking Assistant</span>
            </div>

            {/* Title */}
            <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Turn Your Ingredients Into
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500"> Delicious Recipes</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              KitchenPal uses AI to generate personalized recipes from your ingredients,
              photos, or cravings. Your smart kitchen companion for every meal.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => router.push('/signup')}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-brand-primary rounded-full hover:bg-brand-primary-dark transition-all hover:shadow-xl hover:shadow-orange-200 active:scale-95"
              >
                Start Cooking Free
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all active:scale-95"
              >
                See How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone Mockup */}
          <div ref={phoneRef} className="mt-16 flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-gray-900/20">
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="absolute top-0 left-0 right-0 h-12 bg-white z-10 flex items-center justify-center">
                    <div className="w-24 h-6 bg-gray-900 rounded-full" />
                  </div>

                  {/* App Screenshot Placeholder - Home Screen */}
                  <div className="pt-12 h-full bg-gradient-to-b from-orange-50 to-white">
                    {/* Header */}
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Good morning</p>
                          <p className="text-lg font-semibold text-gray-900">What to cook today?</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-orange-100" />
                      </div>
                    </div>

                    {/* Search */}
                    <div className="px-5 mb-4">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                        <Image src="/assets/icons/Search.svg" alt="" width={18} height={18} className="opacity-40" />
                        <span className="text-sm text-gray-400">Search recipes...</span>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="px-5 mb-4">
                      <div className="flex gap-2">
                        {['All', 'Quick', 'Healthy', 'Dessert'].map((cat, i) => (
                          <div
                            key={cat}
                            className={`px-4 py-2 rounded-full text-xs font-medium ${
                              i === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recipe Cards */}
                    <div className="px-5 space-y-3">
                      {[1, 2].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-3 shadow-sm flex gap-3">
                          <div className={`w-20 h-20 rounded-xl ${i === 0 ? 'bg-gradient-to-br from-amber-200 to-orange-300' : 'bg-gradient-to-br from-emerald-200 to-teal-300'}`} />
                          <div className="flex-1">
                            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                            <div className="h-3 w-16 bg-gray-100 rounded mb-3" />
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Image src="/assets/icons/Clock.svg" alt="" width={12} height={12} className="opacity-50" />
                                <span className="text-xs text-gray-500">25 min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Image src="/assets/icons/Star-Filled.svg" alt="" width={12} height={12} />
                                <span className="text-xs text-gray-500">4.8</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Nav */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-full shadow-lg px-6 py-3 flex justify-around items-center">
                      <Image src="/assets/icons/Home-Filled.svg" alt="" width={22} height={22} />
                      <Image src="/assets/icons/Search.svg" alt="" width={22} height={22} className="opacity-40" />
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <Image src="/assets/icons/Add.svg" alt="" width={20} height={20} className="invert" />
                      </div>
                      <Image src="/assets/icons/Heart-Filled.svg" alt="" width={22} height={22} className="opacity-40" />
                      <Image src="/assets/icons/Profile-Filled.svg" alt="" width={22} height={22} className="opacity-40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -left-16 top-20 bg-white rounded-2xl shadow-xl p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center">
                    <Image src="/assets/icons/Fork.svg" alt="" width={24} height={24} className="invert" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Pasta Carbonara</p>
                    <p className="text-xs text-gray-500">Generated in 2s</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-12 top-40 bg-white rounded-2xl shadow-xl p-3 animate-float-delayed">
                <div className="flex items-center gap-2">
                  <Image src="/assets/icons/Camera.svg" alt="" width={24} height={24} className="text-emerald-500" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                  <span className="text-sm font-medium text-gray-700">Photo identified!</span>
                </div>
              </div>

              <div className="absolute -right-8 bottom-32 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-xl p-3 animate-float text-white">
                <div className="flex items-center gap-2">
                  <Image src="/assets/icons/Star.svg" alt="" width={20} height={20} className="invert" />
                  <span className="text-sm font-medium">AI Recipe Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 px-6 opacity-0 translate-y-10 transition-all duration-700 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Three Ways to Create Recipes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you have ingredients, a photo, or just a craving - KitchenPal has you covered
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`group relative p-8 rounded-3xl cursor-pointer transition-all duration-500 ${
                  activeFeature === index
                    ? 'bg-gradient-to-br ' + feature.gradient + ' text-white shadow-2xl scale-105'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 ${
                  activeFeature === index
                    ? 'bg-white/20 scale-110'
                    : 'bg-gray-100 group-hover:scale-110'
                }`}>
                  <Image
                    src={feature.icon}
                    alt=""
                    width={32}
                    height={32}
                    className={activeFeature === index ? 'invert' : 'opacity-70'}
                  />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${
                  activeFeature === index ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`${
                  activeFeature === index ? 'text-white/90' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>

                {/* Active indicator */}
                {activeFeature === index && (
                  <div className="absolute bottom-4 right-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Image src="/assets/icons/Check-Circle.svg" alt="" width={20} height={20} className="invert" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Feature Progress */}
          <div className="flex justify-center gap-2 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeFeature === index ? 'w-8 bg-orange-500' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Cook in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
                    <Image src={item.icon} alt="" width={36} height={36} className="opacity-80" />
                  </div>
                  <div className="text-sm font-bold text-orange-500 mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>

                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section ref={roadmapRef} className="py-24 px-6 opacity-0 translate-y-10 transition-all duration-700 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Roadmap</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
              What&apos;s Coming Next
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re constantly improving KitchenPal. Here&apos;s what&apos;s on our menu.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {roadmap.map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  item.status === 'live'
                    ? 'border-green-200 bg-green-50'
                    : item.status === 'coming'
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.status === 'live'
                      ? 'bg-green-100'
                      : item.status === 'coming'
                      ? 'bg-orange-100'
                      : 'bg-gray-100'
                  }`}>
                    <Image
                      src={item.icon}
                      alt=""
                      width={24}
                      height={24}
                      className="opacity-70"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        item.status === 'live'
                          ? 'bg-green-500 text-white'
                          : item.status === 'coming'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}>
                        {item.status === 'live' ? 'Live' : item.status === 'coming' ? 'Coming Soon' : 'Planned'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 px-6 opacity-0 translate-y-10 transition-all duration-700 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-orange-500 to-rose-500 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Cooking?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                Join thousands of home cooks using AI to discover new recipes every day. Free to start, no credit card required.
              </p>
              <button
                onClick={() => router.push('/signup')}
                className="px-10 py-5 text-lg font-bold bg-white text-orange-500 rounded-full hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                Get Started for Free
              </button>
              <p className="mt-4 text-sm text-white/70">
                Already have an account?{' '}
                <button onClick={() => router.push('/login')} className="underline hover:text-white">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image src="/icon.png" alt="KitchenPal" width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-gray-900">KitchenPal</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <button onClick={() => router.push('/privacy')} className="hover:text-gray-900">Privacy</button>
              <button onClick={() => router.push('/terms')} className="hover:text-gray-900">Terms</button>
              <a href="mailto:hello@kitchenpal.app" className="hover:text-gray-900">Contact</a>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} KitchenPal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}
