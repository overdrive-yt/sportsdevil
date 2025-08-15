"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "./ui/button"
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel"
import { MapPin } from "lucide-react"

const sportSlides = [
  {
    id: 'cricket',
    image: '/images/site_hero.jpeg',
    sport: 'Cricket'
  },
  {
    id: 'tennis',
    image: '/images/tennis-hero.jpg',
    sport: 'Tennis'
  },
  {
    id: 'hockey',
    image: '/images/hockey-hero.jpg',
    sport: 'Hockey'  
  },
  {
    id: 'football',
    image: '/images/football-hero.jpg',
    sport: 'Football'
  },
  {
    id: 'badminton',
    image: '/images/badminton-hero.jpg',
    sport: 'Badminton'
  }
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isReady, setIsReady] = useState(false)

  // Auto-advance slides every 4 seconds - start immediately
  useEffect(() => {
    // Mark as ready immediately
    setIsReady(true)
    
    // Start interval immediately with no delay
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sportSlides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-[75vh] md:h-[85vh] lg:h-[90vh] overflow-hidden bg-gray-900">
      {/* Dynamic Background Carousel */}
      <div className="absolute inset-0">
        {sportSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={`${slide.sport} equipment`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center px-4">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 md:mb-6 animate-slide-up leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-red-500 bg-clip-text text-transparent">
                Unleash the Devil
              </span>
            </h1>

            {/* Subtitle */}
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 font-semibold mb-4 md:mb-6 animate-slide-up animation-delay-200">
              Sport Equipment Specialists
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-white mb-6 md:mb-8 max-w-3xl mx-auto animate-slide-up animation-delay-400 leading-relaxed">
              Transform your game with professional-grade equipment trusted by athletes worldwide. From cricket and tennis to hockey and rugby - we have everything you need to excel in your sport.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-slide-up animation-delay-600 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold transition-all duration-300 hover:scale-110"
                asChild
              >
                <Link href="/products">
                  Shop Now
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold transition-all duration-300 hover:scale-110"
                asChild
              >
                <Link href="https://maps.google.com/?q=309+Kingstanding+Rd,+Birmingham+B44+9TH" target="_blank">
                  <MapPin className="h-4 w-5 mr-2" />
                  Visit Our Shop
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 md:gap-8 mt-8 md:mt-12 animate-slide-up animation-delay-800 justify-center">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">10K+</div>
                <div className="text-sm md:text-base text-white">Happy Athletes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">6+</div>
                <div className="text-sm md:text-base text-white">Sports Covered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">1000+</div>
                <div className="text-sm md:text-base text-white">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">15+</div>
                <div className="text-sm md:text-base text-white">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {sportSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to ${slide.sport} slide`}
            />
          ))}
        </div>
      </div>

    </section>
  )
}