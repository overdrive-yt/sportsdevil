import type { Metadata, Viewport } from 'next'
// Temporary fix for Vercel build issues - using system fonts instead of Geist
// import { GeistSans } from 'geist/font/sans'
// import { GeistMono } from 'geist/font/mono'
import { ReactQueryProvider } from '../lib/react-query'
import { SessionProvider } from '../lib/session-provider'
import { Toaster } from '../components/ui/toaster'
import { ScrollToTop } from '../components/scroll-to-top'
import { CartSyncProvider } from '../components/cart-sync-provider'
import { PerformanceMonitor } from '../components/performance-monitor'
import { ChunkErrorBoundary } from '../components/chunk-error-boundary'
import { ChunkLoadingProvider } from '../components/chunk-loading-provider'
import { ProductsProvider } from '../contexts/products-context'
import Script from 'next/script'
import './globals.css'

// Environment-aware base URL helper
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXTAUTH_URL || 'http://localhost:3001'
  }
  return 'https://www.sportsdevil.co.uk'
}

const baseUrl = getBaseUrl()

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Sports Devil - Premium Cricket Equipment | Birmingham Cricket Store',
    template: '%s | Sports Devil Cricket',
  },
  description: 'Sports Devil Birmingham - Premium cricket equipment specialists. Professional cricket bats, protective gear, and accessories. Located at 309 Kingstanding Rd, Birmingham B44 9TH. Call 07897813165.',
  keywords: [
    'cricket equipment Birmingham',
    'cricket bats Birmingham',
    'cricket gear UK',
    'professional cricket equipment',
    'batting pads',
    'cricket helmets',
    'wicket keeping gloves',
    'cricket accessories',
    'Sports Devil Birmingham',
    'Kingstanding cricket store',
    'English willow cricket bats',
    'cricket protective gear',
  ],
  authors: [{ name: 'Sports Devil', url: baseUrl }],
  creator: 'Sports Devil Cricket Equipment',
  publisher: 'Sports Devil',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Sports Devil - Premium Cricket Equipment | Birmingham Cricket Store',
    description: 'Sports Devil Birmingham - Premium cricket equipment specialists. Professional bats, protective gear, and accessories.',
    type: 'website',
    locale: 'en_GB',
    url: baseUrl,
    siteName: 'Sports Devil Cricket',
    images: [
      {
        url: '/images/sports-devil-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sports Devil Cricket Equipment - Birmingham Store',
      },
    ],
  },
  alternates: {
    canonical: baseUrl,
  },
  other: {
    'google-site-verification': 'your-google-verification-code',
    'msvalidate.01': 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-GB" className="font-sans">
      <head>
        <style>{`
html {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace;
}
        `}</style>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Structured Data for Sports Devil Cricket Equipment Store */}
        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "Sports Devil",
            "description": "Premium cricket equipment specialists in Birmingham",
            "url": baseUrl,
            "logo": `${baseUrl}/images/sports-devil-logo.png`,
            "image": `${baseUrl}/images/sports-devil-store.jpg`,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "309 Kingstanding Rd",
              "addressLocality": "Birmingham",
              "postalCode": "B44 9TH",
              "addressCountry": "GB"
            },
            "telephone": "+447897813165",
            "openingHours": [
              "Mo-Sa 09:00-18:00",
              "Su 10:00-16:00"
            ],
            "priceRange": "£5-£500",
            "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Online Payment"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Cricket Equipment",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Cricket Bats",
                    "category": "Sports Equipment"
                  }
                },
                {
                  "@type": "Offer", 
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Protective Gear",
                    "category": "Sports Equipment"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product", 
                    "name": "Cricket Accessories",
                    "category": "Sports Equipment"
                  }
                }
              ]
            },
            "sameAs": [
              "https://www.facebook.com/sportsdevil1",
              "https://www.instagram.com/sportsdevil1",
              "https://www.tiktok.com/@sportsdevil1"
            ]
          })}
        </Script>

        {/* Service Worker Registration for Ultra-Fast Caching (Production Only) */}
        <Script id="service-worker-registration" strategy="afterInteractive">
          {`
            // Only register Service Worker in production to avoid caching issues in dev
            if ('serviceWorker' in navigator && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && location.protocol === 'https:') {
              navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                  console.log('✅ Service Worker registered successfully:', registration.scope);
                  
                  // Warm critical resources immediately
                  registration.active?.postMessage({ type: 'WARM_CACHE' });
                })
                .catch((error) => {
                  console.warn('⚠️ Service Worker registration failed:', error);
                });
              
              // Listen for service worker updates
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Service Worker updated, reloading page...');
                window.location.reload();
              });
            } else if ('serviceWorker' in navigator) {
              // Always clear service worker in development to prevent cache conflicts
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                  console.log('🧹 Cleared service worker for development');
                }
              });
            }
          `}
        </Script>

        {/* Performance optimization initialization */}
        <Script id="performance-init" strategy="afterInteractive">
          {`
            // Initialize performance monitoring
            if (typeof window !== 'undefined') {
              // DNS prefetch for critical domains
              const domains = ['fonts.googleapis.com', 'api.stripe.com', 'maps.googleapis.com'];
              domains.forEach(domain => {
                const link = document.createElement('link');
                link.rel = 'dns-prefetch';
                link.href = '//' + domain;
                document.head.appendChild(link);
              });

              // Web Vitals monitoring (optimized)
              if ('PerformanceObserver' in window) {
                try {
                  // Measure Largest Contentful Paint (LCP)
                  new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.startTime < 2500) { // Good LCP
                        console.log('🚀 Excellent LCP:', entry.startTime + 'ms');
                      } else {
                        console.log('⚡ LCP:', entry.startTime + 'ms');
                      }
                    }
                  }).observe({ entryTypes: ['largest-contentful-paint'] });
                  
                  // Measure First Input Delay (FID)
                  new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      console.log('🖱️ FID:', entry.processingStart - entry.startTime + 'ms');
                    }
                  }).observe({ entryTypes: ['first-input'] });
                } catch (e) {
                  console.warn('Performance monitoring not available');
                }
              }
            }
          `}
        </Script>

        <SessionProvider>
          <ReactQueryProvider>
            <ProductsProvider>
              {/* Temporarily disable ChunkLoadingProvider and ChunkErrorBoundary to fix infinite refresh */}
              <CartSyncProvider>
                {children}
                <Toaster />
                <ScrollToTop />
                <PerformanceMonitor />
              </CartSyncProvider>
            </ProductsProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
