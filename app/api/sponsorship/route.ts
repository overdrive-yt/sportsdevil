import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import * as z from 'zod'

// Validation schema (server-side)
const sponsorshipSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid name format"),
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email required"),
  phone: z
    .string()
    .min(1, "Phone required")
    .regex(
      /^(?:(?:\+44|0044|0)\s?[1-9]\d{8,9}|(?:\+44|0044)\s?[1-9]\d{9})$/,
      "Invalid UK phone format"
    ),
  team: z
    .string()
    .min(2, "Team name too short")
    .max(100, "Team name too long"),
  message: z
    .string()
    .min(50, "Message too short")
    .max(500, "Message too long"),
})

// Rate limiting map (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = 3

  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

function generateEmailHTML(data: z.infer<typeof sponsorshipSchema>): string {
  const timestamp = new Date().toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Sponsorship Request - Sports Devil</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #2563eb 0%, #dc2626 100%); color: white; padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🏏 New Athlete Sponsorship Application</h1>
    <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Sports Devil Cricket Store</p>
  </div>

  <!-- Content Container -->
  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 0;">
    
    <!-- Athlete Information -->
    <div style="background: #f8fafc; padding: 25px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
        🏏 Athlete Information
      </h2>
      
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; align-items: center;">
          <span style="font-weight: 600; color: #374151; min-width: 80px; display: inline-block;">Name:</span>
          <span style="color: #1f2937; font-size: 16px;">${data.fullName}</span>
        </div>
        
        <div style="display: flex; align-items: center;">
          <span style="font-weight: 600; color: #374151; min-width: 80px; display: inline-block;">Email:</span>
          <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none; font-size: 16px;">${data.email}</a>
        </div>
        
        <div style="display: flex; align-items: center;">
          <span style="font-weight: 600; color: #374151; min-width: 80px; display: inline-block;">Phone:</span>
          <a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none; font-size: 16px;">${data.phone}</a>
        </div>
        
        <div style="display: flex; align-items: center;">
          <span style="font-weight: 600; color: #374151; min-width: 80px; display: inline-block;">Team:</span>
          <span style="color: #1f2937; font-size: 16px;">${data.team}</span>
        </div>
      </div>
    </div>

    <!-- Cricket Journey & Application -->
    <div style="padding: 25px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
        🏆 Cricket Journey & Application
      </h2>
      
      <div style="background: #f9fafb; border-left: 4px solid #2563eb; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">${data.message}</p>
      </div>
    </div>

    <!-- Action Items -->
    <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; margin: 0 25px 25px 25px; border-radius: 8px;">
      <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">📋 Next Steps:</h3>
      <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
        <li>Review athlete's cricket background and achievements</li>
        <li>Assess sponsorship potential and equipment needs</li>
        <li>Contact athlete within 2 business days</li>
        <li>Schedule interview/meeting if selected</li>
        <li>Prepare sponsorship package and equipment offer</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="background: #f3f4f6; padding: 20px 25px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">🕒 Submitted: ${timestamp}</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">🌐 Source: Sports Devil Website - Athlete Application</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">Sports Devil Cricket Store</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">309 Kingstanding Rd, Birmingham B44 9TH</p>
        </div>
      </div>
    </div>
    
  </div>

  <!-- Email Footer -->
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">This email was automatically generated from the Sports Devil athlete sponsorship application form.</p>
    <p style="margin: 8px 0 0 0;">Please review the application promptly and respond within 2 business days to maintain athlete engagement.</p>
  </div>

</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = sponsorshipSchema.parse(body)

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Verify SMTP connection
    await transporter.verify()

    // Email options
    const mailOptions = {
      from: `"Sports Devil Website" <${process.env.SMTP_USER}>`,
      to: process.env.SPONSORSHIP_EMAIL || 'info@sportsdevil.co.uk',
      subject: `🏏 New Athlete Sponsorship Application from ${validatedData.fullName} (${validatedData.team})`,
      html: generateEmailHTML(validatedData),
      text: `
New Athlete Sponsorship Application - Sports Devil

Athlete Information:
Name: ${validatedData.fullName}
Email: ${validatedData.email}
Phone: ${validatedData.phone}
Team/Club: ${validatedData.team}

Cricket Journey & Application:
${validatedData.message}

Submitted: ${new Date().toLocaleString('en-GB')}
Source: Sports Devil Website - Athlete Sponsorship Application
      `.trim(),
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    
    console.log('📧 Athlete sponsorship application sent:', {
      messageId: info.messageId,
      athlete: validatedData.fullName,
      team: validatedData.team,
      email: validatedData.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Athlete sponsorship application sent successfully',
      messageId: info.messageId
    })

  } catch (error) {
    console.error('❌ Sponsorship form error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid form data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send sponsorship application. Please try again or contact us directly.' 
      },
      { status: 500 }
    )
  }
}