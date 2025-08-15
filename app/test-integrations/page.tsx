"use client"

import { useState, useEffect } from "react"
import { InstagramSection } from "../../components/instagram"

export default function TestIntegrationsPage() {
  const [googleReviewsStatus, setGoogleReviewsStatus] = useState('loading')
  const [googleReviewsData, setGoogleReviewsData] = useState(null)

  useEffect(() => {
    // Test Google Reviews API
    fetch('/api/google-reviews')
      .then(res => res.json())
      .then(data => {
        setGoogleReviewsData(data)
        setGoogleReviewsStatus(data.error ? 'error' : 'success')
      })
      .catch(err => {
        setGoogleReviewsStatus('error')
        console.error('Google Reviews test error:', err)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Integration Tests</h1>
        
        {/* Google Reviews API Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Google Reviews API Test</h2>
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              googleReviewsStatus === 'loading' ? 'bg-yellow-100 text-yellow-800' :
              googleReviewsStatus === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {googleReviewsStatus === 'loading' ? 'Loading...' :
               googleReviewsStatus === 'success' ? 'API Working' :
               'API Error'}
            </span>
          </div>
          
          {googleReviewsData && (
            <div className="bg-gray-50 rounded p-4">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(googleReviewsData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Environment Variables Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div>Google Places API Key: {process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ? '✅ Set' : '❌ Missing'}</div>
            <div>Google Place ID: {process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID ? '✅ Set' : '❌ Missing'}</div>
            <div>Elfsight Widget ID: {process.env.NEXT_PUBLIC_ELFSIGHT_WIDGET_ID ? '✅ Set' : '❌ Missing'}</div>
            <div>Widget ID Value: {process.env.NEXT_PUBLIC_ELFSIGHT_WIDGET_ID || 'Not set'}</div>
          </div>
        </div>

        {/* Instagram Widget Test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Instagram Widget Test</h2>
          <InstagramSection />
        </div>
      </div>
    </div>
  )
}