import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Sports Devil',
  description: 'Read our terms and conditions for using Sports Devil website and purchasing cricket equipment.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-8 text-gray-600">
          <section>
            <p className="text-sm text-gray-500 mb-6">Last Updated: August 2024</p>
            <p>
              Welcome to Sports Devil. These Terms of Service ("Terms") govern your use of our website 
              and the purchase of products from Sports Devil ("we," "our," or "us").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing our website or making a purchase, you agree to be bound by these Terms. 
              If you do not agree to these Terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Products and Services</h2>
            <div className="space-y-4">
              <p>
                Sports Devil specializes in cricket equipment and sporting goods. We strive to provide 
                accurate product descriptions and images, but we cannot guarantee that all details are 
                completely accurate.
              </p>
              <p>
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or discontinue products without notice</li>
                <li>Limit quantities of products sold</li>
                <li>Refuse service to anyone for any reason</li>
                <li>Update prices without prior notice</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Orders and Payment</h2>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Order Acceptance</h3>
              <p>
                All orders are subject to acceptance by Sports Devil. We reserve the right to refuse 
                or cancel any order for any reason, including product availability, errors in pricing 
                or product information, or suspected fraudulent activity.
              </p>
              
              <h3 className="font-semibold text-lg">Pricing</h3>
              <p>
                All prices are listed in British Pounds (GBP) and include VAT where applicable. 
                Prices may change without notice. The price charged will be the price displayed 
                at the time of order confirmation.
              </p>
              
              <h3 className="font-semibold text-lg">Payment</h3>
              <p>
                We accept major credit cards, debit cards, and other payment methods as displayed 
                during checkout. Payment is due at the time of order placement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Shipping and Delivery</h2>
            <div className="space-y-4">
              <p>
                Shipping costs and delivery times are displayed during checkout. We are not responsible 
                for delays caused by shipping carriers or customs processing.
              </p>
              <p>
                Risk of loss and title for products pass to you upon delivery to the shipping address.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Returns and Refunds</h2>
            <p>
              Our return policy is detailed on our Returns page. Returns must be initiated within 
              30 days of purchase and items must be in original condition. Custom-made items are 
              not eligible for return unless defective.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. User Accounts</h2>
            <div className="space-y-4">
              <p>
                You may create an account to make purchases and track orders. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintaining the confidentiality of your account information</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Intellectual Property</h2>
            <p>
              All content on our website, including text, images, logos, and product descriptions, 
              is owned by Sports Devil or our suppliers and is protected by copyright and trademark laws. 
              You may not use our content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand 
              how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Limitation of Liability</h2>
            <div className="space-y-4">
              <p>
                Sports Devil's liability is limited to the maximum extent permitted by law. We are not 
                liable for any indirect, incidental, special, or consequential damages arising from 
                your use of our products or services.
              </p>
              <p>
                Our total liability for any claim will not exceed the amount you paid for the product 
                or service in question.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. Warranty Disclaimer</h2>
            <p>
              Products are sold with manufacturer warranties as applicable. Except for these warranties, 
              we provide products "as is" without any additional warranties or guarantees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any disputes will be resolved 
              in the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">12. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Changes will be posted on this page with 
              an updated "Last Updated" date. Your continued use of our services after changes 
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">13. Age Restrictions</h2>
            <p>
              You must be at least 18 years old to make purchases. Purchases by minors must be made 
              with parental consent and supervision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions 
              will continue in full force and effect.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Contact Information</h2>
            <p className="mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="space-y-1">
              <p><strong>Sports Devil</strong></p>
              <p>309 Kingstanding Rd, Birmingham B44 9TH</p>
              <p><strong>Phone:</strong> 07897813165</p>
              <p><strong>Email:</strong> info@sportsdevil.co.uk</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}