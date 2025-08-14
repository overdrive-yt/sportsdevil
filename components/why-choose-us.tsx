'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Award, Truck, MessageSquare, Headphones } from 'lucide-react'

const features = [
  {
    icon: Award,
    title: 'Multi-Sport Excellence',
    description: 'Professional-grade equipment trusted by athletes across cricket, tennis, hockey, rugby, and more.',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free delivery on orders over £100. Fast and reliable shipping across the UK for all sports.',
  },
  {
    icon: MessageSquare,
    title: 'Sport Specialists',
    description: 'Get expert guidance from our multi-sport specialists to choose the perfect equipment for your game.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support for equipment advice, sizing help, and technical questions.',
  },
]

export function WhyChooseUs() {
  return (
    <section className="pt-16 pb-8 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Sports Devil?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing the best multi-sport equipment and service across cricket, tennis, hockey, rugby, and more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}