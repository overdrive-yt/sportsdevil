'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Slider } from '../ui/slider'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Info, Ruler, Weight, Package, Shield, Users } from 'lucide-react'

interface AttributeFormProps {
  category: any
  attributes: any
  onChange: (attributes: any) => void
}

// V9.11.3: Dynamic Category-Specific Attribute Forms
export default function AttributeForm({ category, attributes, onChange }: AttributeFormProps) {
  const [localAttributes, setLocalAttributes] = useState(attributes || {})

  useEffect(() => {
    setLocalAttributes(attributes || {})
  }, [attributes])

  const updateAttribute = (key: string, value: any) => {
    const updated = { ...localAttributes, [key]: value }
    setLocalAttributes(updated)
    onChange(updated)
  }

  // Category-specific form builders
  const renderCricketBatAttributes = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight">
            <Weight className="h-4 w-4 inline mr-2" />
            Bat Weight*
          </Label>
          <Select
            value={localAttributes.weight || ''}
            onValueChange={(value) => updateAttribute('weight', value)}
          >
            <SelectTrigger id="weight">
              <SelectValue placeholder="Select weight range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2lb6oz-2lb8oz">2lb 6oz - 2lb 8oz (Light)</SelectItem>
              <SelectItem value="2lb8oz-2lb10oz">2lb 8oz - 2lb 10oz (Medium)</SelectItem>
              <SelectItem value="2lb10oz-2lb12oz">2lb 10oz - 2lb 12oz (Heavy)</SelectItem>
              <SelectItem value="2lb12oz+">2lb 12oz+ (Extra Heavy)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the weight range that best fits this bat
          </p>
        </div>

        {/* Grains */}
        <div className="space-y-2">
          <Label htmlFor="grains">
            <Package className="h-4 w-4 inline mr-2" />
            Number of Grains*
          </Label>
          <Select
            value={localAttributes.grains || ''}
            onValueChange={(value) => updateAttribute('grains', value)}
          >
            <SelectTrigger id="grains">
              <SelectValue placeholder="Select grain count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4-6">4-6 Grains (Grade 3)</SelectItem>
              <SelectItem value="6-8">6-8 Grains (Grade 2)</SelectItem>
              <SelectItem value="8-10">8-10 Grains (Grade 1)</SelectItem>
              <SelectItem value="10-12">10-12 Grains (Pro Grade)</SelectItem>
              <SelectItem value="12+">12+ Grains (Elite)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            More grains typically indicate higher quality willow
          </p>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <Label htmlFor="size">
            <Ruler className="h-4 w-4 inline mr-2" />
            Bat Size*
          </Label>
          <Select
            value={localAttributes.size || ''}
            onValueChange={(value) => updateAttribute('size', value)}
          >
            <SelectTrigger id="size">
              <SelectValue placeholder="Select bat size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="size-6">Size 6 (Youth)</SelectItem>
              <SelectItem value="size-5">Size 5 (Youth)</SelectItem>
              <SelectItem value="size-4">Size 4 (Youth)</SelectItem>
              <SelectItem value="size-3">Size 3 (Youth)</SelectItem>
              <SelectItem value="harrow">Harrow</SelectItem>
              <SelectItem value="short-handle">Short Handle (SH)</SelectItem>
              <SelectItem value="long-handle">Long Handle (LH)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sweet Spot */}
        <div className="space-y-2">
          <Label>Sweet Spot Position*</Label>
          <RadioGroup
            value={localAttributes.sweetSpot || ''}
            onValueChange={(value) => updateAttribute('sweetSpot', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low">Low (Front foot players)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mid" id="mid" />
              <Label htmlFor="mid">Mid (All-round)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high">High (Back foot players)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Edge Size */}
        <div className="space-y-2">
          <Label htmlFor="edgeSize">
            Edge Size (mm)
            <span className="text-xs text-muted-foreground ml-2">(35-45mm typical)</span>
          </Label>
          <div className="space-y-2">
            <Slider
              id="edgeSize"
              min={30}
              max={50}
              step={1}
              value={[localAttributes.edgeSize || 40]}
              onValueChange={([value]) => updateAttribute('edgeSize', value)}
            />
            <div className="text-center">
              <Badge variant="secondary">{localAttributes.edgeSize || 40}mm</Badge>
            </div>
          </div>
        </div>

        {/* Handle Type */}
        <div className="space-y-2">
          <Label>Handle Type</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="oval"
                checked={localAttributes.handleType === 'oval'}
                onCheckedChange={(checked) => checked && updateAttribute('handleType', 'oval')}
              />
              <Label htmlFor="oval">Oval Handle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="round"
                checked={localAttributes.handleType === 'round'}
                onCheckedChange={(checked) => checked && updateAttribute('handleType', 'round')}
              />
              <Label htmlFor="round">Round Handle</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Willow Grade */}
      <div className="space-y-2">
        <Label>Willow Grade*</Label>
        <RadioGroup
          value={localAttributes.willowGrade || ''}
          onValueChange={(value) => updateAttribute('willowGrade', value)}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: 'grade-1', label: 'Grade 1', desc: 'Premium English Willow' },
            { value: 'grade-2', label: 'Grade 2', desc: 'Quality English Willow' },
            { value: 'grade-3', label: 'Grade 3', desc: 'Standard English Willow' },
            { value: 'kashmir', label: 'Kashmir', desc: 'Kashmir Willow' }
          ].map((grade) => (
            <div key={grade.value}>
              <RadioGroupItem value={grade.value} id={grade.value} className="peer sr-only" />
              <Label
                htmlFor={grade.value}
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="font-semibold">{grade.label}</span>
                <span className="text-xs text-muted-foreground">{grade.desc}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )

  const renderBattingGlovesAttributes = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Size */}
        <div className="space-y-2">
          <Label htmlFor="gloveSize">
            <Ruler className="h-4 w-4 inline mr-2" />
            Glove Size*
          </Label>
          <Select
            value={localAttributes.size || ''}
            onValueChange={(value) => updateAttribute('size', value)}
          >
            <SelectTrigger id="gloveSize">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">XS (Extra Small)</SelectItem>
              <SelectItem value="s">S (Small)</SelectItem>
              <SelectItem value="m">M (Medium)</SelectItem>
              <SelectItem value="l">L (Large)</SelectItem>
              <SelectItem value="xl">XL (Extra Large)</SelectItem>
              <SelectItem value="xxl">XXL (Double XL)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hand Preference */}
        <div className="space-y-2">
          <Label>
            <Users className="h-4 w-4 inline mr-2" />
            Hand Preference*
          </Label>
          <RadioGroup
            value={localAttributes.handPreference || ''}
            onValueChange={(value) => updateAttribute('handPreference', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="right" id="right" />
              <Label htmlFor="right">Right Handed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="left" id="left" />
              <Label htmlFor="left">Left Handed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both">Both (Ambidextrous)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Protection Level */}
        <div className="space-y-2">
          <Label>
            <Shield className="h-4 w-4 inline mr-2" />
            Protection Level*
          </Label>
          <Select
            value={localAttributes.protectionLevel || ''}
            onValueChange={(value) => updateAttribute('protectionLevel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select protection level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="club">Club Level</SelectItem>
              <SelectItem value="county">County Level</SelectItem>
              <SelectItem value="pro">Professional</SelectItem>
              <SelectItem value="test">Test Match</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Material */}
        <div className="space-y-2">
          <Label>Material*</Label>
          <Select
            value={localAttributes.material || ''}
            onValueChange={(value) => updateAttribute('material', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leather">Premium Leather</SelectItem>
              <SelectItem value="synthetic">Synthetic</SelectItem>
              <SelectItem value="pittard">Pittard Leather</SelectItem>
              <SelectItem value="sheep-leather">Sheep Leather</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Features */}
      <div className="space-y-2">
        <Label>Additional Features</Label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'ventilation', label: 'Ventilation Holes' },
            { id: 'reinforced', label: 'Reinforced Fingers' },
            { id: 'flexible', label: 'Flexible Cuff' },
            { id: 'moisture', label: 'Moisture Wicking' }
          ].map((feature) => (
            <div key={feature.id} className="flex items-center space-x-2">
              <Checkbox
                id={feature.id}
                checked={localAttributes[feature.id] || false}
                onCheckedChange={(checked) => updateAttribute(feature.id, checked)}
              />
              <Label htmlFor={feature.id}>{feature.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderGenericAttributes = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">Category-specific attributes</p>
            <p>Add any specific details about this {category?.name?.toLowerCase() || 'product'} below.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={localAttributes.brand || ''}
            onChange={(e) => updateAttribute('brand', e.target.value)}
            placeholder="e.g., SS, SG, Gray-Nicolls"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model/Series</Label>
          <Input
            id="model"
            value={localAttributes.model || ''}
            onChange={(e) => updateAttribute('model', e.target.value)}
            placeholder="e.g., Master 5000, County"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={localAttributes.color || ''}
            onChange={(e) => updateAttribute('color', e.target.value)}
            placeholder="e.g., Traditional, Blue/Red"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warranty">Warranty</Label>
          <Input
            id="warranty"
            value={localAttributes.warranty || ''}
            onChange={(e) => updateAttribute('warranty', e.target.value)}
            placeholder="e.g., 6 months, 1 year"
          />
        </div>
      </div>
    </div>
  )

  // Render appropriate form based on category
  const renderAttributeForm = () => {
    if (!category) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Please select a category first
        </div>
      )
    }

    switch (category.slug) {
      case 'cricket-bats':
        return renderCricketBatAttributes()
      case 'wicket-keeping':
        return renderBattingGlovesAttributes()
      default:
        return renderGenericAttributes()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{category?.name || 'Product'} Specifications</span>
          {category && (
            <Badge variant="outline">{category.name}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderAttributeForm()}
      </CardContent>
    </Card>
  )
}