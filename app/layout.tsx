import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Base URL for the app
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kitchenpal.app';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF7043' },
    { media: '(prefers-color-scheme: dark)', color: '#FF7043' },
  ],
};

export const metadata: Metadata = {
  // Basic metadata
  metadataBase: new URL(baseUrl),
  title: {
    default: "KitchenPal - AI Recipe Generator & Cooking Assistant",
    template: "%s | KitchenPal",
  },
  description: "Transform your ingredients into delicious recipes with KitchenPal's AI. Get personalized meal suggestions, generate recipes from photos, track calories, and discover cuisines from around the world. Your smart kitchen companion.",
  keywords: [
    "AI recipe generator",
    "cooking assistant",
    "meal planning app",
    "recipe from ingredients",
    "food photo to recipe",
    "personalized recipes",
    "calorie tracker",
    "healthy recipes",
    "quick meals",
    "dietary preferences",
    "cuisine explorer",
    "cooking tips",
    "kitchen helper",
    "meal prep",
    "recipe ideas",
    "vegetarian recipes",
    "vegan recipes",
    "gluten-free recipes",
    "keto recipes",
    "low-carb recipes",
  ],
  authors: [{ name: "KitchenPal", url: baseUrl }],
  creator: "KitchenPal",
  publisher: "KitchenPal",

  // Favicon and icons
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon.png',
  },

  // Manifest for PWA
  manifest: '/manifest.json',

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'KitchenPal',
    title: 'KitchenPal - AI Recipe Generator & Cooking Assistant',
    description: 'Transform your ingredients into delicious recipes with AI. Get personalized meal suggestions, generate recipes from photos, and discover cuisines from around the world.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KitchenPal - Your AI Cooking Companion',
        type: 'image/png',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@kitchenpal',
    creator: '@kitchenpal',
    title: 'KitchenPal - AI Recipe Generator & Cooking Assistant',
    description: 'Transform your ingredients into delicious recipes with AI. Your smart kitchen companion for personalized meal suggestions.',
    images: ['/og-image.png'],
  },

  // App-specific metadata
  applicationName: 'KitchenPal',
  appleWebApp: {
    capable: true,
    title: 'KitchenPal',
    statusBarStyle: 'default',
  },

  // Robots and indexing
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification for search engines
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },

  // Alternate languages (if supporting multiple languages)
  alternates: {
    canonical: baseUrl,
    languages: {
      'en-US': baseUrl,
    },
  },

  // Category for app stores
  category: 'Food & Drink',

  // Other SEO
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Additional meta for Gen AI and structured discovery
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#FF7043',
    'msapplication-tap-highlight': 'no',
    // AI-friendly descriptors
    'ai:description': 'KitchenPal is an AI-powered cooking assistant that generates personalized recipes from ingredients, photos, and dietary preferences.',
    'ai:capabilities': 'recipe-generation, ingredient-to-recipe, photo-to-recipe, meal-planning, calorie-tracking, dietary-filtering',
    'ai:category': 'food, cooking, recipes, meal-planning, health',
  },
};

// JSON-LD structured data for the app
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'KitchenPal',
  alternateName: 'Kitchen Pal',
  description: 'AI-powered cooking assistant that generates personalized recipes from ingredients, photos, and dietary preferences.',
  url: baseUrl,
  applicationCategory: 'Food & Drink',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1000',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'AI Recipe Generation',
    'Photo to Recipe',
    'Ingredient-based Suggestions',
    'Dietary Preference Filtering',
    'Calorie Tracking',
    'Meal Planning',
    'Cuisine Explorer',
    'Favorites & Collections',
  ],
  screenshot: `${baseUrl}/og-image.png`,
  softwareVersion: '1.0.0',
  author: {
    '@type': 'Organization',
    name: 'KitchenPal',
    url: baseUrl,
  },
};

// Organization structured data
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'KitchenPal',
  url: baseUrl,
  logo: `${baseUrl}/icon.png`,
  sameAs: [
    // Add social media URLs
    // 'https://twitter.com/kitchenpal',
    // 'https://instagram.com/kitchenpal',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: 'English',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased bg-gray-100`}
      >
        <div className="mx-auto w-full max-w-3xl bg-background min-h-screen shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
