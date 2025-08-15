"use client"

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Gift, 
  Wrench, 
  User, 
  Plus,
  Minus,
  Package,
  Percent
} from 'lucide-react'
import {
  ADD_ON_SERVICES,
  ADD_ON_BUNDLES,
  getAvailableServicesForProduct,
  calculateServicePrice,
  calculateAddOnTotal,
  getApplicableBundles,
  validateAddOnSelection,
  getServiceDescription,
  type SelectedAddOn,
  type AddOnService
} from '../../lib/add-ons/services'

interface AddOnServiceSelectorProps {
  productType: string
  basePrice: number
  onAddOnsChange?: (addOns: SelectedAddOn[], total: number) => void
  disabled?: boolean
}

interface ServiceSelection {
  serviceId: string
  optionId?: string
  quantity: number
  customText?: string
}

export function AddOnServiceSelector({
  productType,
  basePrice,
  onAddOnsChange,
  disabled = false
}: AddOnServiceSelectorProps) {
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const availableServices = getAvailableServicesForProduct(productType)

  // Calculate totals when selections change
  useEffect(() => {
    const selectedAddOns: SelectedAddOn[] = []
    const errors: Record<string, string[]> = {}

    selectedServices.forEach(selection => {
      const service = ADD_ON_SERVICES.find(s => s.id === selection.serviceId)
      if (!service) return

      const validation = validateAddOnSelection(
        selection.serviceId,
        selection.optionId,
        selection.quantity,
        productType,
        selection.customText
      )

      if (!validation.isValid) {
        errors[selection.serviceId] = validation.errors
      } else {
        selectedAddOns.push({
          serviceId: selection.serviceId,
          optionId: selection.optionId,
          quantity: selection.quantity,
          customText: selection.customText,
          totalPrice: calculateServicePrice(
            selection.serviceId,
            selection.optionId,
            selection.quantity
          ),
          estimatedDays: service.estimatedDays
        })
      }
    })

    setValidationErrors(errors)

    const totals = calculateAddOnTotal(selectedAddOns)
    onAddOnsChange?.(selectedAddOns, totals.total)
  }, [selectedServices, productType, onAddOnsChange])

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.serviceId === serviceId)
      if (existing) {
        return prev.filter(s => s.serviceId !== serviceId)
      } else {
        return [...prev, { serviceId, quantity: 1 }]
      }
    })
  }

  const updateServiceOption = (serviceId: string, optionId: string) => {
    setSelectedServices(prev =>
      prev.map(s =>
        s.serviceId === serviceId
          ? { ...s, optionId }
          : s
      )
    )
  }

  const updateServiceQuantity = (serviceId: string, change: number) => {
    setSelectedServices(prev =>
      prev.map(s => {
        if (s.serviceId === serviceId) {
          const service = ADD_ON_SERVICES.find(svc => svc.id === serviceId)
          const newQuantity = Math.max(1, Math.min(s.quantity + change, service?.maxQuantity || 1))
          return { ...s, quantity: newQuantity }
        }
        return s
      })
    )
  }

  const updateCustomText = (serviceId: string, text: string) => {
    setSelectedServices(prev =>
      prev.map(s =>
        s.serviceId === serviceId
          ? { ...s, customText: text }
          : s
      )
    )
  }

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'personalization': return <User className="h-4 w-4" />
      case 'maintenance': return <Wrench className="h-4 w-4" />
      case 'customization': return <Package className="h-4 w-4" />
      default: return <Gift className="h-4 w-4" />
    }
  }

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId)
  }

  const getSelectedService = (serviceId: string) => {
    return selectedServices.find(s => s.serviceId === serviceId)
  }

  // Calculate totals for display
  const selectedAddOns: SelectedAddOn[] = selectedServices
    .filter(selection => {
      const validation = validateAddOnSelection(
        selection.serviceId,
        selection.optionId,
        selection.quantity,
        productType,
        selection.customText
      )
      return validation.isValid
    })
    .map(selection => {
      const service = ADD_ON_SERVICES.find(s => s.id === selection.serviceId)!
      return {
        serviceId: selection.serviceId,
        optionId: selection.optionId,
        quantity: selection.quantity,
        customText: selection.customText,
        totalPrice: calculateServicePrice(
          selection.serviceId,
          selection.optionId,
          selection.quantity
        ),
        estimatedDays: service.estimatedDays
      }
    })

  const totals = calculateAddOnTotal(selectedAddOns)
  const applicableBundles = getApplicableBundles(selectedAddOns.map(a => a.serviceId))

  if (availableServices.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-gray-500">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No add-on services available for this product type.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Add-on Services
            {selectedServices.length > 0 && (
              <Badge variant="secondary">{selectedServices.length} Selected</Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Enhance your purchase with professional services and customization options
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Service List */}
          {availableServices.map(service => {
            const selected = getSelectedService(service.id)
            const errors = validationErrors[service.id]

            return (
              <div key={service.id} className="border rounded-lg p-4">
                {/* Service Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isServiceSelected(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                      disabled={disabled}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getServiceIcon(service.category)}
                        <span className="font-medium">{service.name}</span>
                        <Badge variant="outline" className="text-xs">
                          £{service.basePrice}+
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.estimatedDays === 0 ? 'Same day' : `${service.estimatedDays} days`}
                        </span>
                        <span>Max qty: {service.maxQuantity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Configuration */}
                {selected && (
                  <div className="ml-6 space-y-4 border-t pt-4">
                    {/* Options Selection */}
                    {service.options && service.options.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Options:</Label>
                        <RadioGroup
                          value={selected.optionId || ''}
                          onValueChange={(value) => updateServiceOption(service.id, value)}
                        >
                          {service.options.map(option => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">{option.name}</span>
                                    {option.description && (
                                      <div className="text-sm text-gray-600">
                                        {option.description}
                                      </div>
                                    )}
                                  </div>
                                  <span className={`text-sm font-medium ${
                                    option.priceModifier > 0 ? 'text-green-600' :
                                    option.priceModifier < 0 ? 'text-blue-600' : 'text-gray-600'
                                  }`}>
                                    {option.priceModifier > 0 ? `+£${option.priceModifier}` :
                                     option.priceModifier < 0 ? `£${option.priceModifier}` : 'Included'}
                                  </span>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {/* Custom Text Input (for engraving) */}
                    {service.id === 'personalized-engraving' && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Engraving Text (max 20 characters):
                        </Label>
                        <Input
                          value={selected.customText || ''}
                          onChange={(e) => updateCustomText(service.id, e.target.value)}
                          placeholder="Enter text to engrave..."
                          maxLength={20}
                          disabled={disabled}
                        />
                        <div className="text-xs text-gray-500">
                          {(selected.customText || '').length}/20 characters
                        </div>
                      </div>
                    )}

                    {/* Quantity Selection */}
                    {service.maxQuantity > 1 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Quantity:</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateServiceQuantity(service.id, -1)}
                            disabled={disabled || selected.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-3 font-medium">{selected.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateServiceQuantity(service.id, 1)}
                            disabled={disabled || selected.quantity >= service.maxQuantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Service Total */}
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Service Total:</span>
                        <span className="font-semibold text-green-600">
                          £{calculateServicePrice(service.id, selected.optionId, selected.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Validation Errors */}
                    {errors && errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-700">Issues:</span>
                        </div>
                        <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Bundle Offers */}
      {applicableBundles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Service Bundles
              <Badge variant="secondary">Save More</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applicableBundles.map(bundle => (
                <div key={bundle.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-800">{bundle.name}</span>
                    <Badge className="bg-green-100 text-green-800">
                      {bundle.discount}% OFF
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700 mb-2">{bundle.description}</p>
                  <div className="text-xs text-green-600">
                    Bundle discount automatically applied at checkout
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      {selectedAddOns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Add-on Services Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Selected Services List */}
              {selectedAddOns.map((addon, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {getServiceDescription(addon.serviceId, addon.optionId)}
                    </div>
                    {addon.quantity > 1 && (
                      <div className="text-xs text-gray-500">
                        Quantity: {addon.quantity}
                      </div>
                    )}
                    {addon.customText && (
                      <div className="text-xs text-gray-500">
                        Text: "{addon.customText}"
                      </div>
                    )}
                    {addon.estimatedDays > 0 && (
                      <div className="text-xs text-amber-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        +{addon.estimatedDays} days
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£{addon.totalPrice.toFixed(2)}</div>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Services Subtotal:</span>
                  <span>£{totals.subtotal.toFixed(2)}</span>
                </div>
                
                {totals.bundleDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Bundle Discount:</span>
                    <span>-£{totals.bundleDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between font-semibold text-lg border-t pt-2">
                  <span>Add-ons Total:</span>
                  <span className="text-green-600">£{totals.total.toFixed(2)}</span>
                </div>

                {totals.maxEstimatedDays > 0 && (
                  <div className="text-center text-sm text-amber-600 bg-amber-50 rounded p-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Additional processing time: {totals.maxEstimatedDays} day{totals.maxEstimatedDays === 1 ? '' : 's'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}