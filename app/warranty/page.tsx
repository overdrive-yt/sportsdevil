import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Warranty Information | Sports Devil',
  description: 'Learn about warranty coverage for cricket equipment, terms and conditions, and how to make warranty claims.',
}

export default function WarrantyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Warranty Information</h1>
        
        <div className="space-y-8">
          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">Our Warranty Promise</h2>
            <p className="text-blue-700">
              We stand behind the quality of our cricket equipment. All products come with manufacturer 
              warranties against defects in materials and workmanship.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Warranty Coverage by Product Type</h2>
            <div className="grid gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-green-600">Cricket Bats</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>English Willow Bats:</strong> 12 months against manufacturing defects</p>
                  <p><strong>Kashmir Willow Bats:</strong> 6 months against manufacturing defects</p>
                  <p><strong>Junior/Youth Bats:</strong> 6 months against manufacturing defects</p>
                  <p className="text-sm text-gray-500 mt-2">
                    *Excludes damage from normal wear, impacts, or misuse
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-green-600">Protective Equipment</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Helmets:</strong> 24 months against structural defects</p>
                  <p><strong>Pads & Gloves:</strong> 12 months against manufacturing defects</p>
                  <p><strong>Wicket Keeping Gear:</strong> 12 months against manufacturing defects</p>
                  <p className="text-sm text-gray-500 mt-2">
                    *Subject to proper care and maintenance
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-green-600">Clothing & Footwear</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Cricket Clothing:</strong> 6 months against material defects</p>
                  <p><strong>Cricket Shoes:</strong> 6 months against sole separation and material defects</p>
                  <p className="text-sm text-gray-500 mt-2">
                    *Excludes normal wear and tear
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-green-600">Accessories</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Bat Grips:</strong> 3 months against adhesive failure</p>
                  <p><strong>Kit Bags:</strong> 12 months against zipper and material defects</p>
                  <p><strong>Training Equipment:</strong> 6-12 months depending on product</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What's Covered</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-600">✓ Covered</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Manufacturing defects</li>
                  <li>• Material failure under normal use</li>
                  <li>• Structural defects</li>
                  <li>• Adhesive failures (grips, protective gear)</li>
                  <li>• Workmanship issues</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-600">✗ Not Covered</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Normal wear and tear</li>
                  <li>• Damage from misuse or abuse</li>
                  <li>• Impact damage (ball marks, edge damage)</li>
                  <li>• Damage from improper storage</li>
                  <li>• Modifications or repairs by others</li>
                  <li>• Cosmetic damage that doesn't affect function</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How to Make a Warranty Claim</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Step 1: Contact Us</h3>
                <p className="text-gray-600">
                  Contact our customer service team with your order number, product details, and 
                  description of the issue.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Step 2: Provide Documentation</h3>
                <p className="text-gray-600">
                  We may request photos of the defect and your original purchase receipt or order confirmation.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Step 3: Assessment</h3>
                <p className="text-gray-600">
                  Our team will assess your claim and determine if it's covered under warranty.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Step 4: Resolution</h3>
                <p className="text-gray-600">
                  If approved, we'll arrange repair, replacement, or refund as appropriate.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Care Instructions</h2>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Proper Care Helps Maintain Warranty Coverage</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Cricket Bats</h4>
                  <p className="text-gray-600 text-sm">
                    Oil regularly, store in protective cover, avoid exposure to extreme temperatures.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Protective Equipment</h4>
                  <p className="text-gray-600 text-sm">
                    Clean after use, allow to dry completely, store in cool, dry place.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Clothing & Footwear</h4>
                  <p className="text-gray-600 text-sm">
                    Follow care label instructions, avoid harsh chemicals, proper storage.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Extended Warranty Options</h2>
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Premium Equipment Protection</h3>
              <p className="text-gray-600 mb-4">
                For high-value cricket bats and equipment, we offer extended warranty options 
                that can extend coverage up to 2 years beyond the standard warranty period.
              </p>
              <p className="text-gray-600">
                Ask about extended warranty options when making your purchase or contact us for details.
              </p>
            </div>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Warranty Support</h2>
            <p className="text-gray-600 mb-4">
              For all warranty claims and questions, contact our customer service team.
            </p>
            <div className="space-y-1">
              <p><strong>Phone:</strong> 07897813165</p>
              <p><strong>Email:</strong> info@sportsdevil.co.uk</p>
              <p><strong>Store Address:</strong> 309 Kingstanding Rd, Birmingham B44 9TH</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Please have your order number and product details ready when contacting us.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}