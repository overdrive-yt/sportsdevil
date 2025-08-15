import { lazy, Suspense } from "react"
import { Header } from "../components/header"
import { HeroSection } from "../components/hero-section"
import { BestSellersCarousel } from "../components/best-sellers-carousel"
import { NewArrivalsCarousel } from "../components/new-arrivals-carousel"
import { WhyChooseUs } from "../components/why-choose-us"
import { FeaturedItems } from "../components/featured-items"
import { WhatsAppFloat } from "../components/whatsapp-float"
import { WebsiteStructuredData, OrganizationStructuredData } from "../components/seo/structured-data"

// Lazy load below-the-fold components for faster initial page load
const Testimonials = lazy(() => import("../components/testimonials").then(m => ({ default: m.Testimonials })))
const InstagramSection = lazy(() => import("../components/instagram").then(m => ({ default: m.InstagramSection })))
const SponsorshipForm = lazy(() => import("../components/sponsorship-form").then(m => ({ default: m.SponsorshipForm })))
const Footer = lazy(() => import("../components/footer").then(m => ({ default: m.Footer })))

// Loading component for smooth transitions
const ComponentLoader = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center py-8 ${className}`}>
    <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg w-full h-32"></div>
  </div>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <Header />
      <main>
        <HeroSection />
        <BestSellersCarousel />
        <NewArrivalsCarousel />
        <WhyChooseUs />
        <FeaturedItems />
        
        {/* Lazy loaded components with smooth loading transitions */}
        <Suspense fallback={<ComponentLoader />}>
          <Testimonials />
        </Suspense>
        
        <Suspense fallback={<ComponentLoader />}>
          <InstagramSection />
        </Suspense>
        
        <Suspense fallback={<ComponentLoader />}>
          <SponsorshipForm />
        </Suspense>
      </main>
      
      <Suspense fallback={<ComponentLoader className="h-64" />}>
        <Footer />
      </Suspense>
      
      <WhatsAppFloat />
      {/* Homepage identifier - Version 10.0 Dynamic E-commerce */}
      <div className="hidden" data-page="homepage" data-version="10.0-dynamic-ecommerce"></div>
    </div>
  )
}
