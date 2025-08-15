'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { useToast } from '../../hooks/use-toast'
import { 
  Package,
  DollarSign,
  Image,
  Search,
  Eye,
  Save,
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Sparkles,
  ShoppingBag,
  Target,
  Shield,
  Shirt,
  HardHat
} from 'lucide-react'
import CategorySelector from './category-selector'
import AttributeForm from './attribute-form'
import ImageUploader from './image-uploader'
import ProductPreview from './product-preview'

interface ProductWizardProps {
  product?: any
  onSuccess: () => void
  onCancel: () => void
}

// V9.11.3: Revolutionary Product Wizard with ELI5 Interface
export function ProductWizard({ product, onSuccess, onCancel }: ProductWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: '',
    slug: '',
    category: null as any,
    shortDescription: '',
    
    // Step 2: Pricing & Inventory
    price: 0,
    originalPrice: null as number | null,
    sku: '',
    stockQuantity: 0,
    
    // Step 3: Category Attributes
    categoryAttributes: {} as any,
    
    // Step 4: Photos & Media
    images: [] as any[],
    
    // Step 5: SEO & Visibility
    metaTitle: '',
    metaDescription: '',
    seoKeywords: [] as string[],
    tags: [] as string[],
    isFeatured: false,
    isNew: false,
    
    // Status
    status: 'DRAFT' as any,
    description: ''
  })

  // Calculate completion percentage
  const calculateProgress = () => {
    let completed = 0
    const total = 14 // Total fields to check
    
    if (formData.name) completed++
    if (formData.category) completed++
    if (formData.shortDescription) completed++
    if (formData.price > 0) completed++
    if (formData.sku) completed++
    if (formData.stockQuantity >= 0) completed++
    if (Object.keys(formData.categoryAttributes).length > 0) completed++
    if (formData.images.length > 0) completed++
    if (formData.metaTitle) completed++
    if (formData.metaDescription) completed++
    if (formData.seoKeywords.length > 0) completed++
    if (formData.description) completed++
    if (formData.tags.length > 0) completed++
    if (formData.slug) completed++
    
    return Math.round((completed / total) * 100)
  }

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Auto-generate SKU
  const generateSKU = () => {
    const prefix = formData.category?.slug?.toUpperCase().slice(0, 3) || 'PRD'
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${random}`
  }

  // Handle step navigation
  const goToStep = (step: number) => {
    if (step < 1 || step > 6) return
    setCurrentStep(step)
  }

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      const payload = {
        ...formData,
        categoryAttributes: JSON.stringify(formData.categoryAttributes),
        seoKeywords: JSON.stringify(formData.seoKeywords),
        tags: JSON.stringify(formData.tags),
        categoryId: formData.category?.id
      }
      
      const response = await fetch(
        product ? `/api/admin/products/${product.id}` : '/api/admin/products',
        {
          method: product ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save product')
      }
      
      toast({
        title: 'Success! 🎉',
        description: `Product ${product ? 'updated' : 'created'} successfully`,
      })
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Package className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Let's add your cricket equipment! 🏏</h2>
              <p className="text-muted-foreground mt-2">
                First, tell us what you're selling. We'll guide you through each step.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name*
                  <span className="text-xs text-muted-foreground ml-2">
                    (e.g., "SS Master 5000 Cricket Bat")
                  </span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    })
                  }}
                  placeholder="Enter your product name..."
                  className="text-lg"
                />
                {formData.name && (
                  <p className="text-xs text-muted-foreground">
                    URL: /products/{formData.slug}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Select Category*</Label>
                <CategorySelector
                  selectedCategory={formData.category}
                  onSelect={(category) => setFormData({ ...formData, category })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">
                  Quick Description
                  <span className="text-xs text-muted-foreground ml-2">
                    (140 characters - like a tweet!)
                  </span>
                </Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Briefly describe your product..."
                  rows={2}
                  maxLength={140}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.shortDescription.length}/140
                </p>
              </div>
            </div>

            {formData.name && formData.category && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-900">
                    Great start! Click "Next" to continue.
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <DollarSign className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Pricing & Stock 💰</h2>
              <p className="text-muted-foreground mt-2">
                Set your price competitively and manage your inventory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Selling Price*
                  <span className="text-xs text-muted-foreground ml-2">
                    (What customers pay)
                  </span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    £
                  </span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">
                  Original Price
                  <span className="text-xs text-muted-foreground ml-2">
                    (Show discount)
                  </span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    £
                  </span>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      originalPrice: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    className="pl-8"
                    placeholder="Optional"
                  />
                </div>
                {formData.originalPrice && formData.originalPrice > formData.price && (
                  <p className="text-xs text-green-600">
                    {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% OFF!
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU (Stock Keeping Unit)*
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setFormData({ ...formData, sku: generateSKU() })}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Auto-generate
                  </Button>
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  placeholder="e.g., BAT-ABC123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">
                  Stock Quantity*
                  <span className="text-xs text-muted-foreground ml-2">
                    (How many in stock?)
                  </span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                {formData.stockQuantity === 0 && (
                  <p className="text-xs text-orange-600">
                    ⚠️ Product will show as "Out of Stock"
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium">Pricing Tip:</p>
                  <p>Check competitor prices for similar {formData.category?.name || 'products'} to stay competitive!</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">
                {formData.category?.name} Details 🏏
              </h2>
              <p className="text-muted-foreground mt-2">
                Tell us the specific details about this {formData.category?.name?.toLowerCase() || 'product'}.
              </p>
            </div>

            <AttributeForm
              category={formData.category}
              attributes={formData.categoryAttributes}
              onChange={(attributes) => setFormData({ ...formData, categoryAttributes: attributes })}
            />

            <div className="space-y-2">
              <Label htmlFor="description">
                Full Description
                <span className="text-xs text-muted-foreground ml-2">
                  (Detailed product information)
                </span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product in detail..."
                rows={6}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Image className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Product Photos 📸</h2>
              <p className="text-muted-foreground mt-2">
                Great photos sell products! Add multiple angles and details.
              </p>
            </div>

            <ImageUploader
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              maxImages={10}
            />

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium">Photo Tips:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Use good lighting (natural light works best)</li>
                    <li>Show multiple angles of the product</li>
                    <li>Include close-ups of important details</li>
                    <li>Keep backgrounds clean and simple</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Search className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">SEO & Visibility 🔍</h2>
              <p className="text-muted-foreground mt-2">
                Help customers find your product online.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">
                  SEO Title
                  <span className="text-xs text-muted-foreground ml-2">
                    (Shows in search results)
                  </span>
                </Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder={formData.name || "Product title for search engines"}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.metaTitle.length}/60
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">
                  SEO Description
                  <span className="text-xs text-muted-foreground ml-2">
                    (Search result preview)
                  </span>
                </Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Describe your product for search engines..."
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.metaDescription.length}/160
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Featured Product</Label>
                    <p className="text-sm text-muted-foreground">
                      Show on homepage
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={formData.isFeatured ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                  >
                    {formData.isFeatured ? 'Yes' : 'No'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Arrival</Label>
                    <p className="text-sm text-muted-foreground">
                      Show "New" badge
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={formData.isNew ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, isNew: !formData.isNew })}
                  >
                    {formData.isNew ? 'Yes' : 'No'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Eye className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Review & Publish ✅</h2>
              <p className="text-muted-foreground mt-2">
                Almost done! Review your product and publish when ready.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Product Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="font-medium">{formData.category?.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-medium">
                      £{formData.price.toFixed(2)}
                      {formData.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          £{formData.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Stock</span>
                    <span className="font-medium">{formData.stockQuantity} units</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">SKU</span>
                    <span className="font-medium">{formData.sku}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Photos</span>
                    <span className="font-medium">{formData.images.length} images</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={formData.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {formData.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Publish Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={formData.status === 'DRAFT' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, status: 'DRAFT' })}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === 'ACTIVE' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, status: 'ACTIVE' })}
                    >
                      Publish Now
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Preview</h3>
                <ProductPreview product={formData} />
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-900">
                  Your product is ready! Click "{formData.status === 'DRAFT' ? 'Save Draft' : 'Publish'}" to complete.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep} of 6
          </span>
          <span className="text-muted-foreground">
            {calculateProgress()}% Complete
          </span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { num: 1, label: 'Basic Info', icon: Package },
          { num: 2, label: 'Pricing', icon: DollarSign },
          { num: 3, label: 'Details', icon: Target },
          { num: 4, label: 'Photos', icon: Image },
          { num: 5, label: 'SEO', icon: Search },
          { num: 6, label: 'Review', icon: Eye }
        ].map((step) => (
          <button
            key={step.num}
            onClick={() => goToStep(step.num)}
            className={`p-3 rounded-lg text-center transition-all ${
              currentStep === step.num
                ? 'bg-primary text-primary-foreground'
                : currentStep > step.num
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <step.icon className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs font-medium">{step.label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : prevStep}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        <div className="flex items-center space-x-2">
          {currentStep < 6 && (
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}

          {currentStep === 6 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading || calculateProgress() < 60}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {formData.status === 'DRAFT' ? 'Save Draft' : 'Publish Product'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && (!formData.name || !formData.category)) ||
                (currentStep === 2 && (!formData.price || !formData.sku))
              }
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}