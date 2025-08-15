"use client"

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  CRICKET_BAT_GRADES,
  CRICKET_BAT_WEIGHTS,
  CRICKET_BAT_GRAINS,
  CRICKET_BAT_HANDLES,
  isValidCombination,
  calculateVariationPrice,
  generateVariationSKU,
  getAvailableOptions,
  getVariationDescription,
  type CricketBatVariation
} from '../../lib/variations/cricket-bat-variations'

interface CricketBatSelectorProps {
  basePrice: number
  baseSku: string
  onVariationChange?: (variation: Partial<CricketBatVariation> | null) => void
  disabled?: boolean
}

export function CricketBatSelector({ 
  basePrice, 
  baseSku, 
  onVariationChange,
  disabled = false 
}: CricketBatSelectorProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedWeight, setSelectedWeight] = useState<string>('')
  const [selectedGrain, setSelectedGrain] = useState<string>('')
  const [selectedHandle, setSelectedHandle] = useState<string>('')
  const [currentPrice, setCurrentPrice] = useState(basePrice)

  // Get available options based on selected grade
  const availableOptions = selectedGrade ? getAvailableOptions(selectedGrade) : null

  // Update price when selections change
  useEffect(() => {
    if (selectedGrade && selectedWeight && selectedGrain && selectedHandle) {
      const newPrice = calculateVariationPrice(
        basePrice, 
        selectedGrade, 
        selectedWeight, 
        selectedGrain, 
        selectedHandle
      )
      setCurrentPrice(newPrice)

      // Create variation object
      const variation: Partial<CricketBatVariation> = {
        gradeId: selectedGrade,
        weightId: selectedWeight,
        grainId: selectedGrain,
        handleId: selectedHandle,
        totalPrice: newPrice,
        sku: generateVariationSKU(baseSku, selectedGrade, selectedWeight, selectedGrain, selectedHandle),
        isAvailable: isValidCombination(selectedGrade, selectedWeight, selectedGrain, selectedHandle)
      }

      onVariationChange?.(variation)
    } else {
      setCurrentPrice(basePrice)
      onVariationChange?(null)
    }
  }, [selectedGrade, selectedWeight, selectedGrain, selectedHandle, basePrice, baseSku, onVariationChange])

  // Reset dependent selections when grade changes
  useEffect(() => {
    if (selectedGrade) {
      const available = getAvailableOptions(selectedGrade)
      
      // Reset weight if current selection is not available
      if (selectedWeight && !available.weights.find(w => w.id === selectedWeight)) {
        setSelectedWeight('')
      }
      
      // Reset grain if current selection is not available
      if (selectedGrain && !available.grains.find(g => g.id === selectedGrain)) {
        setSelectedGrain('')
      }
      
      // Reset handle if current selection is not available
      if (selectedHandle && !available.handles.find(h => h.id === selectedHandle)) {
        setSelectedHandle('')
      }
    }
  }, [selectedGrade, selectedWeight, selectedGrain, selectedHandle])

  const isSelectionComplete = selectedGrade && selectedWeight && selectedGrain && selectedHandle
  const isValidSelection = isSelectionComplete && isValidCombination(selectedGrade, selectedWeight, selectedGrain, selectedHandle)

  const getStepStatus = (step: number) => {
    switch (step) {
      case 1: return selectedGrade ? 'complete' : 'current'
      case 2: return selectedWeight ? 'complete' : selectedGrade ? 'current' : 'pending'
      case 3: return selectedGrain ? 'complete' : selectedWeight ? 'current' : 'pending'
      case 4: return selectedHandle ? 'complete' : selectedGrain ? 'current' : 'pending'
      default: return 'pending'
    }
  }

  const StepIndicator = ({ step, title, status }: { step: number, title: string, status: string }) => (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
        status === 'complete' ? 'bg-green-500 text-white' :
        status === 'current' ? 'bg-blue-500 text-white' :
        'bg-gray-200 text-gray-500'
      }`}>
        {status === 'complete' ? <CheckCircle2 className="w-3 h-3" /> : step}
      </div>
      <span className={status === 'current' ? 'font-medium' : status === 'complete' ? 'text-green-600' : 'text-gray-500'}>
        {title}
      </span>
    </div>
  )

  return (
    <Card className={`w-full ${disabled ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Cricket Bat Configuration
          <Badge variant="outline">Custom Build</Badge>
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <StepIndicator step={1} title="Grade" status={getStepStatus(1)} />
          <StepIndicator step={2} title="Weight" status={getStepStatus(2)} />
          <StepIndicator step={3} title="Grain" status={getStepStatus(3)} />
          <StepIndicator step={4} title="Handle" status={getStepStatus(4)} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Grade Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Step 1: Select Wood Grade
            <Info className="inline h-4 w-4 ml-1 text-gray-400" />
          </Label>
          <RadioGroup 
            value={selectedGrade} 
            onValueChange={setSelectedGrade}
            disabled={disabled}
            className="space-y-3"
          >
            {CRICKET_BAT_GRADES.map((grade) => (
              <div key={grade.id} className="flex items-start space-x-3">
                <RadioGroupItem value={grade.id} id={grade.id} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <Label htmlFor={grade.id} className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{grade.name}</div>
                        <div className="text-sm text-gray-600">{grade.description}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          grade.priceModifier > 0 ? 'text-green-600' :
                          grade.priceModifier < 0 ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {grade.priceModifier > 0 ? `+£${grade.priceModifier}` :
                           grade.priceModifier < 0 ? `£${grade.priceModifier}` : 'Base price'}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Step 2: Weight Selection */}
        {selectedGrade && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Step 2: Choose Weight Range
              <Info className="inline h-4 w-4 ml-1 text-gray-400" />
            </Label>
            <Select value={selectedWeight} onValueChange={setSelectedWeight} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Select weight range" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions?.weights.map((weight) => (
                  <SelectItem key={weight.id} value={weight.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{weight.label}</span>
                      {weight.priceModifier !== 0 && (
                        <span className={`ml-2 text-sm ${
                          weight.priceModifier > 0 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {weight.priceModifier > 0 ? `+£${weight.priceModifier}` : `£${weight.priceModifier}`}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Step 3: Grain Selection */}
        {selectedWeight && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Step 3: Select Grain Pattern
              <Info className="inline h-4 w-4 ml-1 text-gray-400" />
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableOptions?.grains.map((grain) => (
                <div 
                  key={grain.id} 
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedGrain === grain.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !disabled && setSelectedGrain(grain.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{grain.name}</span>
                    {selectedGrain === grain.id && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{grain.description}</p>
                  <div className="text-xs text-gray-500">
                    {grain.minGrains}-{grain.maxGrains} grains
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Handle Selection */}
        {selectedGrain && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Step 4: Choose Handle Type
              <Info className="inline h-4 w-4 ml-1 text-gray-400" />
            </Label>
            <div className="space-y-2">
              {availableOptions?.handles.map((handle) => (
                <div 
                  key={handle.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedHandle === handle.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !disabled && setSelectedHandle(handle.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{handle.name}</span>
                        {selectedHandle === handle.id && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{handle.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        handle.priceModifier > 0 ? 'text-green-600' :
                        handle.priceModifier < 0 ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {handle.priceModifier > 0 ? `+£${handle.priceModifier}` :
                         handle.priceModifier < 0 ? `£${handle.priceModifier}` : 'Included'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection Summary */}
        {isSelectionComplete && (
          <div className="border-t pt-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                {isValidSelection ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {isValidSelection ? 'Configuration Complete' : 'Invalid Configuration'}
                </span>
              </div>
              
              {isValidSelection && (
                <>
                  <p className="text-sm text-gray-600">
                    {getVariationDescription(selectedGrade, selectedWeight, selectedGrain, selectedHandle)}
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
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}