import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Returns & Exchanges | Sports Devil',
  description: 'Learn about our returns policy, exchange process, and how to return cricket equipment.',
}

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Returns & Exchanges</h1>
        
        <div className="space-y-8">
          <section className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-green-800">30-Day Return Policy</h2>
            <p className="text-green-700">
              We offer a 30-day return policy on most items. Items must be returned in original condition 
              with all tags and packaging intact.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What Can Be Returned</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-600">✓ Eligible for Return</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Cricket bats (unused, in original condition)</li>
                  <li>• Protective equipment (unopened packaging)</li>
                  <li>• Clothing and footwear (with tags)</li>
                  <li>• Training equipment</li>
                  <li>• Accessories and grips</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-600">✗ Not Eligible for Return</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Custom-made equipment</li>
                  <li>• Personalized items</li>
                  <li>• Used protective equipment (hygiene reasons)</li>
                  <li>• Sale/clearance items (unless faulty)</li>
                  <li>• Items damaged by misuse</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How to Return an Item</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Step 1: Contact Us</h3>
                <p className="text-gray-600">
                  Email us at info@sportsdevil.co.uk or call 07897813165 with your order number 
                  and reason for return.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Step 2: Get Return Authorization</h3>
                <p className="text-gray-600">
                  We'll provide you with a return authorization number and return instructions.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Step 3: Package Your Return</h3>
                <p className="text-gray-600">
                  Pack items securely in original packaging with all tags and accessories included.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Step 4: Send Your Return</h3>
                <p className="text-gray-600">
                  Ship to the address provided or drop off at our Birmingham store during business hours.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Exchanges</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                We're happy to exchange items for different sizes or colors, subject to availability.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Size Exchange Policy</h3>
                <p className="text-gray-600">
                  For cricket bats and protective equipment, we offer free size exchanges within 14 days 
                  of purchase if the item is unused and in original condition.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Refund Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Processing Time</h3>
                <p className="text-gray-600">
                  Refunds are processed within 5-7 business days of receiving your return.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Refund Method</h3>
                <p className="text-gray-600">
                  Refunds will be issued to the original payment method used for the purchase.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Return Shipping</h3>
                <p className="text-gray-600">
                  Customers are responsible for return shipping costs unless the item is faulty or incorrect.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Damaged or Faulty Items</h2>
            <div className="bg-red-50 p-6 rounded-lg">
              <p className="text-red-700 mb-4">
                If you receive a damaged or faulty item, please contact us immediately.
              </p>
              <div className="space-y-2">
                <p><strong>Phone:</strong> 07897813165</p>
                <p><strong>Email:</strong> info@sportsdevil.co.uk</p>
              </div>
              <p className="text-red-600 mt-4">
                We'll arrange collection and provide a full refund or replacement at no cost to you.
              </p>
            </div>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Need Help?</h2>
            <p className="text-gray-600 mb-4">
              Our customer service team is here to help with any return or exchange questions.
            </p>
            <div className="space-y-1">
              <p><strong>Store Address:</strong> 309 Kingstanding Rd, Birmingham B44 9TH</p>
              <p><strong>Phone:</strong> 07897813165</p>
              <p><strong>Email:</strong> info@sportsdevil.co.uk</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}