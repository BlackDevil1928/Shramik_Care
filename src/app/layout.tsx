import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import EmergencyButton from '@/components/EmergencyButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kerala Migrant Health System | Digital Health Records for Migrant Workers',
  description: 'Voice-first, multilingual digital health record management system for migrant workers in Kerala. Supports Hindi, Bengali, Oriya, Tamil, Nepali, Malayalam, and English.',
  keywords: 'Kerala, migrant workers, health records, voice AI, multilingual, digital health, UN SDG',
  authors: [{ name: 'Health Service Department, Govt of Kerala' }],
  creator: 'Health Service Department, Govt of Kerala',
  publisher: 'Government of Kerala',
  robots: 'index, follow',
  openGraph: {
    title: 'Kerala Migrant Health System',
    description: 'Digital health records for migrant workers in Kerala',
    url: 'https://kerala-migrant-health.gov.in',
    siteName: 'Kerala Migrant Health System',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kerala Migrant Health System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kerala Migrant Health System',
    description: 'Voice-first health records for migrant workers',
    images: ['/twitter-image.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#008B8B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#008B8B" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/_next/static/media/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        
        {/* Healthcare compliance and security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Permissions for voice and location access */}
        <meta httpEquiv="Permissions-Policy" content="microphone=*, camera=*, geolocation=*" />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen`}>
        {/* Global loading indicator */}
        <div id="global-loading" className="fixed inset-0 bg-kerala-teal bg-opacity-20 backdrop-blur-sm z-50 hidden">
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse-neon text-white text-xl">
              Loading Kerala Health System...
            </div>
          </div>
        </div>

        {/* Accessibility skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-kerala-teal text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>

        {/* Main application content */}
        <div className="relative">
          {/* Background pattern for futuristic feel */}
          <div className="fixed inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-kerala-teal via-neon-blue to-health-green animate-gradient-x"></div>
          </div>
          
          <main id="main-content" className="relative z-10">
            {children}
          </main>
        </div>

        {/* Emergency contact floating button - always visible */}
        <EmergencyButton />

        {/* Service worker registration for offline capability */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}