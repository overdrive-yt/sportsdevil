"use client"

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Checkbox } from '../ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import {
  ProductVariationTemplate,
  VariationField,
  VariationOption,
  ProductVariation,
  validateSelections,
  calculateVariationPrice,
  generateVariationSKU,
  getVariationDescription,
  getAvailableOptionsForField
} from '../../lib/variations/universal-variations'

interface UniversalVariationSelectorProps {
  template: ProductVariationTemplate
  basePrice: number
  baseSku: string
  onVariationChange?: (variation: Partial<ProductVariation> | null) => void
  disabled?: boolean
}

export function UniversalVariationSelector({
  template,
  basePrice,
  baseSku,
  onVariationChange,
  disabled = false
}: UniversalVariationSelectorProps) {
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [currentPrice, setCurrentPrice] = useState(basePrice)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Update price and validation when selections change
  useEffect(() => {
    const validation = validateSelections(template, selections)
    setValidationErrors(validation.errors)

    if (validation.isValid) {
      const newPrice = calculateVariationPrice(basePrice, template, selections)
      setCurrentPrice(newPrice)

      const variation: Partial<ProductVariation> = {
        productId: '', // Will be set by parent
        selections: Object.entries(selections).map(([fieldId, optionId]) => ({
          fieldId,
          optionId,
          value: optionId
        })),
        sku: generateVariationSKU(baseSku, template, selections),
        price: newPrice,
        isAvailable: true,
        description: getVariationDescription(template, selections)
      }

      onVariationChange?.(variation)
    } else {
      setCurrentPrice(basePrice)
      onVariationChange?(null)
    }
  }, [selections, template, basePrice, baseSku, onVariationChange])

  const handleSelectionChange = (fieldId: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const renderField = (field: VariationField) => {
    const availableOptions = getAvailableOptionsForField(field, selections)
    const selectedValue = selections[field.id] || ''

    if (availableOptions.length === 0) {
      return null
    }

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={selectedValue}
              onValueChange={(value) => handleSelectionChange(field.id, value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {option.priceModifier !== 0 && (
                        <span className={`ml-2 text-sm ${
                          option.priceModifier > 0 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {option.priceModifier > 0 ? `+£${option.priceModifier}` : `£${option.priceModifier}`}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={selectedValue}
              onValueChange={(value) => handleSelectionChange(field.id, value)}
              disabled={disabled}
            >
              {availableOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={option.id} className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-gray-600">{option.description}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            option.priceModifier > 0 ? 'text-green-600' :
                            option.priceModifier < 0 ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {option.priceModifier > 0 ? `+£${option.priceModifier}` :
                             option.priceModifier < 0 ? `£${option.priceModifier}` : 'Included'}
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 'color':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex flex-wrap gap-3">
              {availableOptions.map((option) => (
                <div
                  key={option.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${
                    selectedValue === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !disabled && handleSelectionChange(field.id, option.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: option.value }}
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                    {selectedValue === option.id && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'size':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedValue === option.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => !disabled && handleSelectionChange(field.id, option.id)}
                  disabled={disabled || !option.isAvailable}
                  className="min-w-[3rem]"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )

      case 'image-select':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableOptions.map((option) => (
                <div
                  key={option.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    selectedValue === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !disabled && handleSelectionChange(field.id, option.id)}
                >
                  {option.image && (
                    <div className="aspect-square relative mb-2 bg-gray-100 rounded">
                      {/* In a real app, you'd use Next.js Image component */}
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        {option.label}
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.priceModifier !== 0 && (
                      <div className={`text-xs ${
                        option.priceModifier > 0 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {option.priceModifier > 0 ? `+£${option.priceModifier}` : `£${option.priceModifier}`}
                      </div>
                    )}
                  </div>
                  {selectedValue === option.id && (
                    <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {availableOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedValue === option.id}
                    onCheckedChange={(checked) => 
                      handleSelectionChange(field.id, checked ? option.id : '')
                    }
                    disabled={disabled}
                  />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <span>{option.label}</span>
                        {option.description && (
                          <div className="text-sm text-gray-600">{option.description}</div>
                        )}
                      </div>
                      {option.priceModifier !== 0 && (
                        <span className={`text-sm ${
                          option.priceModifier > 0 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {option.priceModifier > 0 ? `+£${option.priceModifier}` : `£${option.priceModifier}`}
                        </span>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )

      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              value={selectedValue}
              onChange={(e) => handleSelectionChange(field.id, e.target.value)}
              disabled={disabled}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        )

      default:
        return null
    }
  }

  const isSelectionComplete = template.fields
    .filter(field => field.required)
    .every(field => selections[field.id])

  const hasValidSelections = validationErrors.length === 0 && isSelectionComplete

  return (
    <Card className={`w-full ${disabled ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {template.name}
          <Badge variant="outline">
            {Object.keys(selections).length}/{template.fields.filter(f => f.required).length} Required
          </Badge>
        </CardTitle>
        {template.description && (
          <p className="text-sm text-gray-600">{template.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Render all fields */}
        {template.fields
          .sort((a, b) => a.order - b.order)
          .map(renderField)}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-700">Please fix the following issues:</span>
            </div>
            <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Selection Summary */}
        {hasValidSelections && (
          <div className="border-t pt-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Configuration Complete</span>
              </div>
              
              <p className="text-sm text-gray-600">
                {getVariationDescription(template, selections)}
              </p>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Total Price:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    £{currentPrice.toFixed(2)}
                  </div>
                  {currentPrice !== basePrice && (
                    <div className="text-sm text-gray-500">
                      Base: £{basePrice.toFixed(2)} + £{(currentPrice - basePrice).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}