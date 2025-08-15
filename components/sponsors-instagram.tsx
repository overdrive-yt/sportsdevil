"use client"

import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Instagram, ExternalLink } from "lucide-react"

const sponsors = [
  { name: "Aston Manor Cricket Club", logo: "/images/Sponsor Logo Aston Manor CC.png" },
]

const instagramPosts = [
  { id: 1, image: "/placeholder.svg?height=200&width=200" },
  { id: 2, image: "/placeholder.svg?height=200&width=200" },
  { id: 3, image: "/placeholder.svg?height=200&width=200" },
  { id: 4, image: "/placeholder.svg?height=200&width=200" },
  { id: 5, image: "/placeholder.svg?height=200&width=200" },
  { id: 6, image: "/placeholder.svg?height=200&width=200" },
]

export function SponsorsInstagram() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Sponsors Section */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">We are proud to sponsor</h2>
            <div className="flex justify-center">
              <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <img
                  src="/images/Sponsor Logo Aston Manor CC.png"
                  alt="Aston Manor Cricket Club"
                  className="max-h-24 w-auto mx-auto"
                />
                <p className="text-center text-gray-600 mt-4 font-medium">Aston Manor Cricket Club</p>
              </div>
            </div>
          </div>

          {/* Instagram Section */}
          <div>
            <div className="flex items-center mb-8">
              <Instagram className="h-8 w-8 text-pink-600 mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Follow Us on Instagram</h2>
            </div>
            <p className="text-gray-600 mb-8">
              Stay updated with our latest products, athlete features, and sports tips on Instagram.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {instagramPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square overflow-hidden rounded-lg cursor-pointer group hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={`Instagram post ${post.id}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Instagram className="h-4 w-4 mr-2" />
              Follow @sportsdevil
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
