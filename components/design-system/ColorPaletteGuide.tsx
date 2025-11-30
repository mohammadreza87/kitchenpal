'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ColorSwatch {
  name: string
  hex: string
  tone?: string
  usage?: string
}

interface ColorGroup {
  title: string
  description: string
  colors: ColorSwatch[]
}

export function ColorPaletteGuide() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedColor(hex)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const colorGroups: ColorGroup[] = [
    {
      title: 'Primary Colors (Orange)',
      description: 'Warm, energetic orange tones for main brand identity and key actions',
      colors: [
        { name: 'Primary 0', hex: '#1a0b07', tone: 'P-0' },
        { name: 'Primary 10', hex: '#33160d', tone: 'P-10', usage: 'On Primary Fixed Variant' },
        { name: 'Primary 20', hex: '#4d2114', tone: 'P-20' },
        { name: 'Primary 30', hex: '#662c1b', tone: 'P-30' },
        { name: 'Primary 40', hex: '#994228', tone: 'P-40' },
        { name: 'Primary 50', hex: '#cc5835', tone: 'P-50' },
        { name: 'Primary 60', hex: '#ff7043', tone: 'P-60', usage: 'Primary (Main)' },
        { name: 'Primary 70', hex: '#ff8b68', tone: 'P-70' },
        { name: 'Primary 80', hex: '#ffa88e', tone: 'P-80', usage: 'Inverse Primary' },
        { name: 'Primary 90', hex: '#ffc5b4', tone: 'P-90', usage: 'Primary Fixed Dim' },
        { name: 'Primary 95', hex: '#ffd4c6', tone: 'P-95', usage: 'Primary Container' },
        { name: 'Primary 98', hex: '#ffe2d9', tone: 'P-98', usage: 'Primary Fixed' },
        { name: 'Primary 100', hex: '#fff9f8', tone: 'P-100' },
      ],
    },
    {
      title: 'Secondary Colors (Yellow)',
      description: 'Vibrant yellow tones for secondary elements and highlights',
      colors: [
        { name: 'Secondary 10', hex: '#332b10', tone: 'S-10', usage: 'On Secondary Fixed/Container' },
        { name: 'Secondary 20', hex: '#4d4018', tone: 'S-20', usage: 'On Secondary Fixed Variant' },
        { name: 'Secondary 40', hex: '#99802f', tone: 'S-40' },
        { name: 'Secondary 50', hex: '#ccab3f', tone: 'S-50' },
        { name: 'Secondary 60', hex: '#ffd54f', tone: 'S-60', usage: 'Secondary (Main)' },
        { name: 'Secondary 70', hex: '#ffde72', tone: 'S-70' },
        { name: 'Secondary 80', hex: '#ffe695', tone: 'S-80' },
        { name: 'Secondary 90', hex: '#ffefb9', tone: 'S-90', usage: 'Secondary Fixed Dim' },
        { name: 'Secondary 95', hex: '#fff3ca', tone: 'S-95', usage: 'Secondary Container' },
        { name: 'Secondary 98', hex: '#fff7dc', tone: 'S-98', usage: 'Secondary Fixed' },
      ],
    },
    {
      title: 'Tertiary Colors (Pink)',
      description: 'Playful pink tones for accents and tertiary elements',
      colors: [
        { name: 'Tertiary 10', hex: '#330d1a', tone: 'T-10', usage: 'On Tertiary Fixed/Container' },
        { name: 'Tertiary 20', hex: '#4d1326', tone: 'T-20', usage: 'On Tertiary Fixed Variant' },
        { name: 'Tertiary 40', hex: '#99264d', tone: 'T-40' },
        { name: 'Tertiary 50', hex: '#cc3366', tone: 'T-50' },
        { name: 'Tertiary 60', hex: '#ff4081', tone: 'T-60', usage: 'Tertiary (Main)' },
        { name: 'Tertiary 70', hex: '#ff6699', tone: 'T-70' },
        { name: 'Tertiary 80', hex: '#ff8cb3', tone: 'T-80' },
        { name: 'Tertiary 90', hex: '#ffb3cc', tone: 'T-90', usage: 'Tertiary Fixed Dim' },
        { name: 'Tertiary 95', hex: '#ffc6d9', tone: 'T-95', usage: 'Tertiary Container' },
        { name: 'Tertiary 98', hex: '#ffd9e6', tone: 'T-98', usage: 'Tertiary Fixed' },
      ],
    },
    {
      title: 'Error Colors (Red)',
      description: 'Red tones for error states, warnings, and destructive actions',
      colors: [
        { name: 'Error 20', hex: '#440f11', tone: 'E-20', usage: 'On Error Container' },
        { name: 'Error 40', hex: '#881e21', tone: 'E-40' },
        { name: 'Error 50', hex: '#b6282d', tone: 'E-50' },
        { name: 'Error 60', hex: '#e33338', tone: 'E-60', usage: 'Error (Main)' },
        { name: 'Error 70', hex: '#e9575c', tone: 'E-70' },
        { name: 'Error 80', hex: '#ee7f82', tone: 'E-80' },
        { name: 'Error 90', hex: '#f4a8aa', tone: 'E-90' },
        { name: 'Error 99', hex: '#fce9e9', tone: 'E-99', usage: 'Error Container' },
      ],
    },
    {
      title: 'Neutral Colors',
      description: 'Grayscale tones for text, backgrounds, and borders',
      colors: [
        { name: 'Neutral 10', hex: '#282828', tone: 'N-10', usage: 'On Primary/Surface Container' },
        { name: 'Neutral 20', hex: '#3c3c3c', tone: 'N-20' },
        { name: 'Neutral 40', hex: '#797979', tone: 'N-40', usage: 'Outline' },
        { name: 'Neutral 60', hex: '#c9c9c9', tone: 'N-60' },
        { name: 'Neutral 80', hex: '#dfdfdf', tone: 'N-80' },
        { name: 'Neutral 90', hex: '#eaeaea', tone: 'N-90', usage: 'Surface Container Highest' },
        { name: 'Neutral 95', hex: '#efefef', tone: 'N-95', usage: 'Surface Dim/Container' },
        { name: 'Neutral 98', hex: '#f4f4f4', tone: 'N-98', usage: 'Surface Bright' },
        { name: 'Neutral 99', hex: '#fafafa', tone: 'N-99', usage: 'Surface' },
        { name: 'Neutral 100', hex: '#ffffff', tone: 'N-100', usage: 'On Primary/Tertiary/Error' },
      ],
    },
  ]

  const keyColors = [
    { name: 'Primary', hex: '#ff7043', description: 'Main brand color' },
    { name: 'Secondary', hex: '#ffd54f', description: 'Secondary actions' },
    { name: 'Tertiary', hex: '#ff4081', description: 'Accent color' },
    { name: 'Error', hex: '#e33338', description: 'Error states' },
    { name: 'Surface Bright', hex: '#f4f4f4', description: 'Light backgrounds' },
    { name: 'Surface Dim', hex: '#dddddd', description: 'Subtle backgrounds' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Kitchen Pal Color Palette</h1>
        <p className="max-w-3xl text-gray-600">
          A comprehensive color system following Material Design 3 principles with warm, food-friendly tones.
        </p>
      </div>

      {/* Key Colors */}
      <div className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold">Key Colors</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {keyColors.map((color) => (
            <div
              key={color.hex}
              className="group cursor-pointer"
              onClick={() => copyToClipboard(color.hex)}
            >
              <div
                className="mb-3 h-24 w-full rounded-xl shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: color.hex }}
              />
              <p className="mb-1 text-sm font-medium text-gray-900">{color.name}</p>
              <p className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                {color.hex}
                {copiedColor === color.hex ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </p>
              <p className="text-xs text-gray-400">{color.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="mb-16 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold">Usage Guidelines</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-medium">Color Roles</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <span className="font-medium text-gray-900">Primary (P-60):</span> Main brand identity, key actions, CTAs
              </li>
              <li>
                <span className="font-medium text-gray-900">Secondary (S-60):</span> Secondary actions, highlights, tags
              </li>
              <li>
                <span className="font-medium text-gray-900">Tertiary (T-60):</span> Accents, special features
              </li>
              <li>
                <span className="font-medium text-gray-900">Error (E-60):</span> Error states, destructive actions
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-medium">Accessibility</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <span className="font-medium text-gray-900">Contrast:</span> Main colors (60) provide 4.5:1 with white
              </li>
              <li>
                <span className="font-medium text-gray-900">Outline (N-40):</span> 3:1 contrast for borders
              </li>
              <li>
                <span className="font-medium text-gray-900">Inverse Colors:</span> For dark theme support
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Full Color Groups */}
      {colorGroups.map((group) => (
        <div key={group.title} className="mb-16">
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-semibold">{group.title}</h2>
            <p className="text-gray-600">{group.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {group.colors.map((color) => (
              <div
                key={color.hex}
                className="group cursor-pointer"
                onClick={() => copyToClipboard(color.hex)}
              >
                <div
                  className="mb-2 h-20 w-full rounded-lg border border-gray-200 shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="mb-0.5 text-sm font-medium text-gray-900">{color.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span>{color.hex}</span>
                  {copiedColor === color.hex ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </p>
                {color.tone && <p className="text-xs text-gray-400">{color.tone}</p>}
                {color.usage && <p className="mt-1 text-xs text-blue-600">{color.usage}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="mt-16 rounded-xl bg-gray-100 p-6 text-center">
        <p className="text-gray-600">💡 Click any color swatch to copy the hex code to your clipboard</p>
      </div>
    </div>
  )
}
