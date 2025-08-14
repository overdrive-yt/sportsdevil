'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface PasswordRequirement {
  regex: RegExp
  text: string
  met: boolean
}

export function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { regex: /.{8,}/, text: 'At least 8 characters', met: false },
    { regex: /[a-z]/, text: 'At least one lowercase letter', met: false },
    { regex: /[A-Z]/, text: 'At least one uppercase letter', met: false },
    { regex: /\d/, text: 'At least one number', met: false },
  ])

  const [strength, setStrength] = useState(0)
  const [strengthText, setStrengthText] = useState('Too weak')
  const [strengthColor, setStrengthColor] = useState('bg-red-500')

  useEffect(() => {
    const updatedRequirements = requirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }))

    setRequirements(updatedRequirements)

    const metCount = updatedRequirements.filter(req => req.met).length
    setStrength(metCount)

    // Update strength text and color
    if (metCount === 0) {
      setStrengthText('Enter password')
      setStrengthColor('bg-gray-300')
    } else if (metCount === 1) {
      setStrengthText('Too weak')
      setStrengthColor('bg-red-500')
    } else if (metCount === 2) {
      setStrengthText('Weak')
      setStrengthColor('bg-orange-500')
    } else if (metCount === 3) {
      setStrengthText('Good')
      setStrengthColor('bg-yellow-500')
    } else if (metCount === 4) {
      setStrengthText('Strong')
      setStrengthColor('bg-green-500')
    }
  }, [password])

  if (!password) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Password strength:</span>
          <span className={`font-medium ${
            strength === 4 ? 'text-green-600' : 
            strength === 3 ? 'text-yellow-600' : 
            strength >= 2 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {strengthText}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(strength / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Password must contain:</p>
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {req.met ? (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}