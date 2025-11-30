import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display styles
        'display-lg': ['3.5625rem', { lineHeight: '4rem', letterSpacing: '-0.015625rem', fontWeight: '400' }],     // 57/64, -0.25px
        'display-md': ['2.8125rem', { lineHeight: '3.25rem', letterSpacing: '0', fontWeight: '400' }],              // 45/52, 0
        'display-sm': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '0', fontWeight: '400' }],                // 36/44, 0

        // Heading styles
        'heading-lg': ['2rem', { lineHeight: '2.5rem', letterSpacing: '0', fontWeight: '400' }],                    // 32/40, 0
        'heading-md': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0', fontWeight: '400' }],                // 28/36, 0
        'heading-sm': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0', fontWeight: '400' }],                    // 24/32, 0

        // Title styles
        'title-lg': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '0', fontWeight: '400' }],                 // 22/28, 0
        'title-md': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.009375rem', fontWeight: '500' }],            // 16/24, +0.15px
        'title-sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.00625rem', fontWeight: '500' }],        // 14/20, +0.1px

        // Label styles
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.00625rem', fontWeight: '500' }],        // 14/20, +0.1px
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.03125rem', fontWeight: '500' }],            // 12/16, +0.5px
        'label-sm': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.03125rem', fontWeight: '500' }],          // 11/16, +0.5px

        // Body styles
        'body-lg': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.03125rem', fontWeight: '400' }],              // 16/24, +0.5px
        'body-md': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.015625rem', fontWeight: '400' }],        // 14/20, +0.25px
        'body-sm': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025rem', fontWeight: '400' }],               // 12/16, +0.4px
      },
  		colors: {
        // KitchenPal Brand Colors (direct hex values)
        brand: {
          primary: {
            DEFAULT: '#ff7043', // P-60
            light: '#ffa88e', // P-80
            dark: '#cc5835', // P-50
            container: '#ffd4c6', // P-95
            'on-container': '#33160d', // P-10
            fixed: '#ffe2d9', // P-98
            'fixed-dim': '#ffc5b4', // P-90
          },
          secondary: {
            DEFAULT: '#ffd54f', // S-60
            light: '#ffe695', // S-80
            dark: '#ccab3f', // S-50
            container: '#fff3ca', // S-95
            'on-container': '#332b10', // S-10
            fixed: '#fff7dc', // S-98
            'fixed-dim': '#ffefb9', // S-90
          },
          tertiary: {
            DEFAULT: '#ff4081', // T-60
            light: '#ff8cb3', // T-80
            dark: '#cc3366', // T-50
            container: '#ffc6d9', // T-95
            'on-container': '#330d1a', // T-10
            fixed: '#ffd9e6', // T-98
            'fixed-dim': '#ffb3cc', // T-90
          },
          error: {
            DEFAULT: '#e33338', // E-60
            light: '#ee7f82', // E-80
            dark: '#b6282d', // E-50
            container: '#fce9e9', // E-99
            'on-container': '#440f11', // E-20
          },
        },
        // Semantic tokens (shadcn/ui compatible)
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
