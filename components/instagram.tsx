import Link from "next/link"
import Script from "next/script"
import { Button } from "./ui/button"
import { Instagram, ExternalLink } from "lucide-react"

export function InstagramSection() {
  const widgetId = process.env.NEXT_PUBLIC_ELFSIGHT_WIDGET_ID;

  // Static Instagram-style preview posts for immediate loading
  const previewPosts = [
    {
      id: 1,
      image: "/images/instagram/post1.jpg",
      caption: "Premium cricket equipment arrives at Sports Devil! 🏏✨",
      likes: 45,
      comments: 8,
    },
    {
      id: 2,
      image: "/images/instagram/post2.jpg", 
      caption: "Behind the scenes at our Birmingham store 📍",
      likes: 32,
      comments: 5,
    },
    {
      id: 3,
      image: "/images/instagram/post3.jpg",
      caption: "New arrivals: Professional grade cricket bats 🔥",
      likes: 67,
      comments: 12,
    },
    {
      id: 4,
      image: "/images/instagram/post4.jpg",
      caption: "Customer spotlight: Match-winning gear! 🏆",
      likes: 89,
      comments: 15,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Instagram Section Header */}
          <div className="flex items-center justify-center mb-8">
            <Instagram className="h-8 w-8 text-pink-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {widgetId && widgetId !== "WIDGET_ID_PLACEHOLDER" ? "Live Instagram Feed" : "Follow Us on Instagram"}
            </h2>
          </div>
          <p className="text-gray-600 mb-8 text-center">
            Stay updated with our latest cricket equipment, products, and store highlights on Instagram.
          </p>
          

          {/* Live Widget Container - Loads asynchronously */}
          {widgetId && widgetId !== "WIDGET_ID_PLACEHOLDER" && (
            <>
              <Script
                src="https://static.elfsight.com/platform/platform.js"
                strategy="afterInteractive"
              />
              <div className="mb-8">
                {/* Async Instagram Widget - Simple div for external script */}
                <div className={`elfsight-app-${widgetId}`} data-elfsight-app-lazy>
                  {/* Widget loads here automatically via external script */}
                </div>
              </div>
            </>
          )}

          
          {/* Follow Button */}
          <div className="text-center">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" asChild>
              <Link href="https://www.instagram.com/sportsdevil1/" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4 mr-2" />
                Follow @sportsdevil1
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          
        </div>
      </div>
    </section>
  )
}

