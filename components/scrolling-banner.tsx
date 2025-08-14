"use client"

export function ScrollingBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white py-2 overflow-hidden">
      <div className="animate-scroll whitespace-nowrap">
        <span className="inline-block px-8">
          🔥 Get 7% OFF Your First Order | Use Code: FIRST7
        </span>
        <span className="inline-block px-8">
          🎉 New Shop Opening August 1st - Grand Opening!
        </span>
        <span className="inline-block px-8">
          📍 Visit us at 309 Kingstanding Rd, Birmingham B44 9TH
        </span>
        <span className="inline-block px-8">
          🔥 Get 7% OFF Your First Order | Use Code: FIRST7
        </span>
        <span className="inline-block px-8">
          🎉 New Shop Opening August 1st - Grand Opening!
        </span>
        <span className="inline-block px-8">
          📍 Visit us at 309 Kingstanding Rd, Birmingham B44 9TH
        </span>
      </div>
    </div>
  )
}