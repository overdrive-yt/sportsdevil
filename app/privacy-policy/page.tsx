import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, Mail, MapPin, Phone, Calendar } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const lastUpdated = "10 August 2025"
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            We are committed to protecting your personal data and respecting your privacy rights.
          </p>
          <Badge variant="secondary" className="text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            Last updated: {lastUpdated}
          </Badge>
        </div>

        {/* Data Controller Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Data Controller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>W3 Sports Devil Ltd</strong><br />
              Company Registration: [To be added]<br />
              VAT Number: [To be added]
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <strong>Privacy Contact:</strong> privacy@sportsdevil.co.uk
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <strong>General Contact:</strong> info@sportsdevil.co.uk
            </div>
            <div>
              <strong>ICO Registration:</strong> [To be added when registered]
            </div>
          </CardContent>
        </Card>

        {/* What Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle>1. What Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Information You Provide</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Name, email address, phone number</li>
                <li>Billing and delivery addresses</li>
                <li>Payment information (processed securely by Stripe)</li>
                <li>Account preferences and communication settings</li>
                <li>Product reviews and ratings</li>
                <li>Customer service correspondence</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Information Collected Automatically</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Device information (browser, operating system)</li>
                <li>Usage data (pages visited, time spent, clicks)</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Shopping behavior and preferences</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Contract Performance</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  We process your data to fulfill our contract with you:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Process and fulfill orders</li>
                  <li>Provide customer support</li>
                  <li>Manage your account</li>
                  <li>Send order confirmations and updates</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Consent-Based Processing</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  With your consent, we use your data for:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Marketing communications</li>
                  <li>Personalized recommendations</li>
                  <li>Analytics and website optimization</li>
                  <li>Social media integration</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Legitimate Interests</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  We may process your data for our legitimate business interests:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Fraud prevention and security</li>
                  <li>Website performance monitoring</li>
                  <li>Business analytics and improvements</li>
                  <li>Legal compliance and dispute resolution</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>3. Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              We use cookies to improve your browsing experience and provide personalized services. 
              Our cookie categories include:
            </p>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <strong className="text-sm">Essential Cookies</strong>
                  <p className="text-xs text-muted-foreground">Required for basic website functionality</p>
                </div>
                <Badge variant="secondary">Always Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <strong className="text-sm">Performance Cookies</strong>
                  <p className="text-xs text-muted-foreground">Help us understand website usage</p>
                </div>
                <Badge variant="outline">Optional</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <strong className="text-sm">Marketing Cookies</strong>
                  <p className="text-xs text-muted-foreground">Enable targeted advertising</p>
                </div>
                <Badge variant="outline">Optional</Badge>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              You can manage your cookie preferences at any time through our cookie settings banner 
              or by contacting us directly.
            </p>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>4. How We Share Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              We do not sell your personal data. We may share information with:
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Service Providers</h4>
                <ul className="list-disc pl-6 space-y-1 text-xs text-muted-foreground">
                  <li>Stripe (payment processing)</li>
                  <li>Royal Mail / DPD (shipping)</li>
                  <li>Google Analytics (website analytics)</li>
                  <li>Sentry (error monitoring)</li>
                  <li>Email service providers</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm">Legal Requirements</h4>
                <p className="text-xs text-muted-foreground">
                  We may disclose information when required by law or to protect our rights, 
                  property, or safety.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm">Business Transfers</h4>
                <p className="text-xs text-muted-foreground">
                  In the event of a merger, acquisition, or sale, your information may be 
                  transferred as part of the transaction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights Under GDPR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              As a UK/EU resident, you have the following rights regarding your personal data:
            </p>
            
            <div className="grid gap-3">
              {[
                { right: "Right of Access", description: "Request a copy of your personal data" },
                { right: "Right to Rectification", description: "Correct inaccurate or incomplete data" },
                { right: "Right to Erasure", description: "Request deletion of your personal data" },
                { right: "Right to Restrict Processing", description: "Limit how we use your data" },
                { right: "Right to Data Portability", description: "Receive your data in a portable format" },
                { right: "Right to Object", description: "Object to certain types of processing" },
                { right: "Right to Withdraw Consent", description: "Withdraw consent at any time" }
              ].map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <h4 className="font-semibold text-sm">{item.right}</h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">How to Exercise Your Rights</h4>
              <p className="text-xs text-muted-foreground">
                To exercise any of these rights, please contact us at privacy@sportsdevil.co.uk 
                or use our online data request form in your account dashboard. We will respond 
                within 30 days of receiving your request.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>6. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              We retain your personal data only as long as necessary for the purposes outlined in this policy:
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Account Data</span>
                <span className="text-muted-foreground">Until account deletion</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Order History</span>
                <span className="text-muted-foreground">7 years (tax requirements)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Marketing Consent</span>
                <span className="text-muted-foreground">3 years from last interaction</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Analytics Data</span>
                <span className="text-muted-foreground">2 years</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Session Data</span>
                <span className="text-muted-foreground">30 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>7. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and staff training</li>
              <li>Secure payment processing via Stripe</li>
              <li>Regular data backups and disaster recovery</li>
            </ul>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card>
          <CardHeader>
            <CardTitle>8. International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Some of our service providers may be located outside the UK/EU. When we transfer 
              your data internationally, we ensure adequate protection through:
            </p>
            
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Adequacy decisions by the UK/EU authorities</li>
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Provider certification schemes</li>
              <li>Other appropriate safeguards as required by law</li>
            </ul>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>9. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Our services are not intended for children under 13. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected 
              information from a child under 13, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle>10. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              We may update this privacy policy from time to time. We will notify you of any 
              material changes by posting the new policy on our website and updating the 
              "last updated" date. Your continued use of our services after such changes 
              constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>11. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              If you have any questions about this privacy policy or our data practices, 
              please contact us:
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">privacy@sportsdevil.co.uk</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">info@sportsdevil.co.uk</span>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Supervisory Authority</h4>
              <p className="text-xs text-muted-foreground">
                You have the right to lodge a complaint with the Information Commissioner's Office (ICO) 
                if you believe we have not handled your personal data properly. You can contact the ICO 
                at ico.org.uk or call their helpline on 0303 123 1113.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}