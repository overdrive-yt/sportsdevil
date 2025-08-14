"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Calendar, Phone, Mail } from "lucide-react"

export function AppointmentsWhatsApp() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "1234567890" // Replace with actual WhatsApp number
    const message = "Hi! I'm interested in booking a consultation for sports equipment."
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Appointments Section */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Book a Consultation</h2>
              </div>
              <p className="text-gray-600 mb-8">
                Need expert advice on choosing the right equipment? Book a free consultation with our sports
                specialists.
              </p>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Your Name" className="border-gray-300" />
                  <Input placeholder="Phone Number" className="border-gray-300" />
                </div>
                <Input placeholder="Email Address" type="email" className="border-gray-300" />
                <Input placeholder="Preferred Sport/Activity" className="border-gray-300" />
                <Textarea placeholder="Tell us about your requirements..." className="border-gray-300 min-h-[100px]" />
                <Button className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* WhatsApp Section */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <MessageCircle className="h-8 w-8 text-green-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Quick Support</h2>
              </div>
              <p className="text-gray-600 mb-8">
                Need immediate assistance? Chat with us on WhatsApp for instant support and product recommendations.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                  <Phone className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Call Us</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                  <Mail className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Email Us</p>
                    <p className="text-gray-600">support@sportsdevil.com</p>
                  </div>
                </div>

                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat on WhatsApp
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">Available Monday - Saturday, 9 AM - 8 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
