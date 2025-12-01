import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KitchenPal - Your AI Cooking Companion",
    template: "%s | KitchenPal",
  },
  description: "Transform your ingredients into delicious recipes with KitchenPal. Get personalized meal suggestions based on what you have in your kitchen.",
  keywords: ["recipes", "cooking", "meal planning", "ingredients", "kitchen", "food"],
  authors: [{ name: "KitchenPal" }],
  openGraph: {
    title: "KitchenPal - Your AI Cooking Companion",
    description: "Transform your ingredients into delicious recipes with KitchenPal.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "KitchenPal - Your AI Cooking Companion",
    description: "Transform your ingredients into delicious recipes with KitchenPal.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
