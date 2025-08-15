import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Sports Devil',
  description: 'Learn about how Sports Devil uses cookies and similar technologies on our website.',
}

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="space-y-8 text-gray-600">
          <section>
            <p className="text-sm text-gray-500 mb-6">Last Updated: August 2024</p>
            <p>
              This Cookie Policy explains how Sports Devil ("we," "our," or "us") uses cookies and 
              similar technologies when you visit our website at sportsdevil.co.uk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. 
              They help websites remember your preferences, analyze site traffic, and provide a 
              better user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">How We Use Cookies</h2>
            <p className="mb-4">We use cookies for several purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To remember your preferences and settings</li>
              <li>To keep you logged in to your account</li>
              <li>To maintain items in your shopping cart</li>
              <li>To analyze website traffic and performance</li>
              <li>To provide personalized content and recommendations</li>
              <li>To prevent fraud and enhance security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Types of Cookies We Use</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-green-600">Essential Cookies</h3>
                <p className="mb-2"><strong>Purpose:</strong> These cookies are necessary for the website to function properly.</p>
                <p className="mb-2"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Session management and login status</li>
                  <li>Shopping cart functionality</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing</li>
                </ul>
                <p className="text-sm mt-2"><strong>Can be disabled:</strong> No - these are required for the site to work</p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-blue-600">Performance & Analytics Cookies</h3>
                <p className="mb-2"><strong>Purpose:</strong> Help us understand how visitors use our website.</p>
                <p className="mb-2"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Google Analytics</li>
                  <li>Page view tracking</li>
                  <li>Site performance monitoring</li>
                  <li>Error tracking</li>
                </ul>
                <p className="text-sm mt-2"><strong>Can be disabled:</strong> Yes - through browser settings</p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-purple-600">Functional Cookies</h3>
                <p className="mb-2"><strong>Purpose:</strong> Remember your preferences and provide enhanced features.</p>
                <p className="mb-2"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Language preferences</li>
                  <li>Currency selection</li>
                  <li>Recently viewed products</li>
                  <li>Theme preferences (light/dark mode)</li>
                </ul>
                <p className="text-sm mt-2"><strong>Can be disabled:</strong> Yes - through browser settings</p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-orange-600">Marketing & Targeting Cookies</h3>
                <p className="mb-2"><strong>Purpose:</strong> Used to deliver relevant advertisements and measure campaign effectiveness.</p>
                <p className="mb-2"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Social media integration</li>
                  <li>Advertising personalization</li>
                  <li>Conversion tracking</li>
                  <li>Retargeting campaigns</li>
                </ul>
                <p className="text-sm mt-2"><strong>Can be disabled:</strong> Yes - through browser settings or opt-out tools</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Third-Party Cookies</h2>
            <div className="space-y-4">
              <p>
                We may use third-party services that set their own cookies. These include:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Payment Processors</h3>
                <p className="text-sm">Stripe and other payment providers use cookies for fraud prevention and payment processing.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Analytics Services</h3>
                <p className="text-sm">Google Analytics helps us understand website usage and improve our service.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Social Media</h3>
                <p className="text-sm">Social media widgets may set cookies for sharing and tracking purposes.</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Customer Support</h3>
                <p className="text-sm">Live chat and customer support tools may use cookies to maintain conversations.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Managing Your Cookie Preferences</h2>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Browser Settings</h3>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>View and delete existing cookies</li>
                <li>Block all cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block third-party cookies</li>
                <li>Delete all cookies when you close the browser</li>
              </ul>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">⚠️ Important Note</h4>
                <p className="text-sm">
                  Disabling certain cookies may limit your ability to use some features of our website, 
                  such as maintaining items in your cart or staying logged in.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Browser-Specific Instructions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Chrome</h3>
                <p className="text-sm">Settings → Privacy and security → Cookies and other site data</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Firefox</h3>
                <p className="text-sm">Options → Privacy & Security → Cookies and Site Data</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Safari</h3>
                <p className="text-sm">Preferences → Privacy → Cookies and website data</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Edge</h3>
                <p className="text-sm">Settings → Privacy, search, and services → Cookies</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Mobile Devices</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">iOS (Safari)</h3>
                <p className="text-sm">Settings → Safari → Block All Cookies</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Android (Chrome)</h3>
                <p className="text-sm">Chrome app → Settings → Site settings → Cookies</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Data Retention</h2>
            <div className="space-y-4">
              <p>Different types of cookies are stored for different periods:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Stored for a set period (typically 30 days to 2 years)</li>
                <li><strong>Analytics Cookies:</strong> Usually stored for 2 years</li>
                <li><strong>Marketing Cookies:</strong> Typically stored for 30-90 days</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or applicable laws. We will post any updates on this page with a new "Last Updated" date.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Questions About Cookies?</h2>
            <p className="mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="space-y-1">
              <p><strong>Email:</strong> info@sportsdevil.co.uk</p>
              <p><strong>Phone:</strong> 07897813165</p>
              <p><strong>Address:</strong> 309 Kingstanding Rd, Birmingham B44 9TH</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}