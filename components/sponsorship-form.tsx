"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Handshake, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Validation schema
const sponsorshipFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(?:(?:\+44|0044|0)\s?[1-9]\d{8,9}|(?:\+44|0044)\s?[1-9]\d{9})$/,
      "Please enter a valid UK phone number (e.g., 07xxx xxx xxx or +44 xxx xxx xxxx)"
    ),
  team: z
    .string()
    .min(2, "Team/Club name must be at least 2 characters")
    .max(100, "Team/Club name must be less than 100 characters"),
  message: z
    .string()
    .min(50, "Message must be at least 50 characters")
    .max(500, "Message must be less than 500 characters"),
})

type SponsorshipFormData = z.infer<typeof sponsorshipFormSchema>

export function SponsorshipForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { toast } = useToast()

  const form = useForm<SponsorshipFormData>({
    resolver: zodResolver(sponsorshipFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      team: "",
      message: "",
    },
  })

  const onSubmit = async (data: SponsorshipFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/sponsorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit sponsorship request')
      }

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        form.reset()
        toast({
          title: "Application Submitted!",
          description: "We'll review your application and be in touch within 2 business days.",
        })
      } else {
        throw new Error(result.error || 'Failed to send sponsorship request')
      }
    } catch (error) {
      console.error('Sponsorship form error:', error)
      setSubmitStatus('error')
      toast({
        title: "Error",
        description: "Failed to send your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-red-600 p-3 rounded-full">
                <Handshake className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Become Sponsored
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join the Sports Devil family! We sponsor talented cricket players and teams by providing 
              high-quality equipment and gear. Apply to become part of our sponsored athlete program.
            </p>
          </div>

          {/* Sponsorship Form */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Athlete Sponsorship Application
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Tell us about yourself, your cricket journey, and why you'd like to join the Sports Devil sponsored athlete family.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Success Message */}
              {submitStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    <strong>Thank you for your sponsorship application!</strong>
                    <br />
                    We've received your application and will review it within 2 business days. If selected, we'll contact you to discuss equipment sponsorship opportunities.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    We're sorry, but there was an error sending your application. 
                    Please try again or contact us directly at <strong>info@sportsdevil.co.uk</strong>
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Email Address *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@company.com"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="07xxx xxx xxx or +44 xxx xxx xxxx"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Team/Club */}
                  <FormField
                    control={form.control}
                    name="team"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Team/Club Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Birmingham Cricket Club, Warwickshire U21s, School Team"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Tell us about your cricket journey and why you'd like sponsorship *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your cricket experience, playing position, achievements, current level (club/county/academy), and why you'd like to be sponsored by Sports Devil. What equipment would be most beneficial for your game?"
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="text-xs text-gray-500 mt-1">
                          {field.value.length}/500 characters (minimum 50 required)
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-center pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white px-8 py-3 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Sending Application...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Sponsorship Application
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Additional Info */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Questions about our athlete sponsorship program?{" "}
                  <a
                    href="mailto:info@sportsdevil.co.uk"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Contact us directly
                  </a>{" "}
                  or call{" "}
                  <a
                    href="tel:07897813165"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    07897 813 165
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}