import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Information | Sports Devil',
  description: 'Learn about our shipping options, delivery times, and costs for cricket equipment orders.',
}

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shipping Information</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">UK Shipping</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Standard Delivery (3-5 Business Days)</h3>
                <p className="text-gray-600 mb-2">Perfect for most orders</p>
                <p className="font-semibold">FREE on orders over £50 | £4.99 for orders under £50</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Express Delivery (1-2 Business Days)</h3>
                <p className="text-gray-600 mb-2">For urgent orders</p>
                <p className="font-semibold">£9.99</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Next Day Delivery</h3>
                <p className="text-gray-600 mb-2">Order before 2 PM for next day delivery</p>
                <p className="font-semibold">£12.99</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">International Shipping</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Europe (5-7 Business Days)</h3>
                <p className="font-semibold">£15.99</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Rest of World (7-14 Business Days)</h3>
                <p className="font-semibold">£25.99</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Collection Service</h2>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">In-Store Collection</h3>
              <p className="text-gray-600 mb-2">Collect from our Birmingham store</p>
              <p className="font-semibold">FREE</p>
              <p className="text-sm text-gray-600 mt-2">
                Available during store hours. Order online and collect within 7 days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Important Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Processing Time</h3>
                <p className="text-gray-600">Orders are typically processed within 1-2 business days.</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Large Items</h3>
                <p className="text-gray-600">
                  Some large cricket equipment may require special delivery arrangements. 
                  We'll contact you if this applies to your order.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Custom Equipment</h3>
                <p className="text-gray-600">
                  Custom-made bats and equipment may take 2-4 weeks for delivery depending on specifications.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Tracking</h3>
                <p className="text-gray-600">
                  You'll receive tracking information via email once your order ships.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Questions about shipping?</h2>
            <p className="text-gray-600 mb-4">
              Contact our customer service team for any shipping-related questions.
            </p>
            <div className="space-y-1">
              <p><strong>Phone:</strong> 07897813165</p>
              <p><strong>Email:</strong> info@sportsdevil.co.uk</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}