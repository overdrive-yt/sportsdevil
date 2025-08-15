import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { Textarea } from '../../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Checkbox } from '../../../../components/ui/checkbox'
import { Badge } from '../../../../components/ui/badge'
import { Separator } from '../../../../components/ui/separator'
import { 
  ArrowLeft,
  Plus,
  X,
  Upload,
  Eye,
  Save,
  Package,
  Ruler,
  Palette,
  Shield,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'

// Cricket equipment categories and their specific attributes
const CRICKET_CATEGORIES = {
  bats: {
    name: 'Cricket Bats',
    icon: Target,
    attributes: [
      { key: 'size', label: 'Size', type: 'select', options: ['Men\'s', 'Youth', 'Junior', 'Mini'] },
      { key: 'weight', label: 'Weight', type: 'select', options: ['2lb 6oz', '2lb 7oz', '2lb 8oz', '2lb 9oz', '2lb 10oz', '2lb 11oz', '2lb 12oz', '2lb 13oz', '2lb 14oz', '2lb 15oz', '3lb+'] },
      { key: 'blade_profile', label: 'Blade Profile', type: 'select', options: ['Traditional', 'Mid Profile', 'Low Profile'] },
      { key: 'handle_type', label: 'Handle Type', type: 'select', options: ['Round', 'Oval', 'Semi-Oval'] },
      { key: 'wood_type', label: 'Wood Type', type: 'select', options: ['English Willow', 'Kashmir Willow', 'Poplar'] },
      { key: 'grain_count', label: 'Grain Count', type: 'select', options: ['4-6 Grains', '6-8 Grains', '8-10 Grains', '10+ Grains'] }
    ]
  },
  pads: {
    name: 'Batting Pads',
    icon: Shield,
    attributes: [
      { key: 'size', label: 'Size', type: 'select', options: ['Men\'s', 'Youth', 'Junior', 'Mini'] },
      { key: 'style', label: 'Style', type: 'select', options: ['Traditional', 'Lightweight', 'Ultra-Light'] },
      { key: 'protection_level', label: 'Protection Level', type: 'select', options: ['Club', 'County', 'International'] },
      { key: 'material', label: 'Material', type: 'select', options: ['PU', 'Leather', 'Synthetic'] },
      { key: 'knee_roll', label: 'Knee Roll', type: 'select', options: ['Traditional', 'Modern', 'Bolster'] }
    ]
  },
  gloves: {
    name: 'Batting Gloves',
    icon: Zap,
    attributes: [
      { key: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'X-Large', 'Youth'] },
      { key: 'style', label: 'Style', type: 'select', options: ['Traditional', 'Modern', 'Lightweight'] },
      { key: 'palm_material', label: 'Palm Material', type: 'select', options: ['Leather', 'PU', 'Synthetic'] },
      { key: 'protection_level', label: 'Protection Level', type: 'select', options: ['Club', 'County', 'International'] }
    ]
  },
  helmets: {
    name: 'Helmets',
    icon: Shield,
    attributes: [
      { key: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'X-Large', 'Youth', 'Junior'] },
      { key: 'standard', label: 'Safety Standard', type: 'select', options: ['BS7928:2013', 'Previous Standards'] },
      { key: 'grill_type', label: 'Grill Type', type: 'select', options: ['Titanium', 'Steel', 'Carbon Fibre'] },
      { key: 'ventilation', label: 'Ventilation', type: 'select', options: ['Standard', 'Enhanced', 'Maximum'] }
    ]
  },
  bags: {
    name: 'Cricket Bags',
    icon: Package,
    attributes: [
      { key: 'type', label: 'Bag Type', type: 'select', options: ['Wheelie', 'Duffle', 'Kit Bag', 'Coffin', 'Backpack'] },
      { key: 'capacity', label: 'Capacity', type: 'select', options: ['Small (1-2 bats)', 'Medium (3-4 bats)', 'Large (5+ bats)'] },
      { key: 'material', label: 'Material', type: 'select', options: ['Polyester', 'Canvas', 'Nylon', 'Leather'] },
      { key: 'wheels', label: 'Wheels', type: 'checkbox' }
    ]
  },
  accessories: {
    name: 'Accessories',
    icon: Ruler,
    attributes: [
      { key: 'type', label: 'Accessory Type', type: 'select', options: ['Grips', 'Springs', 'Toe Guards', 'Anti-Scuff', 'Grip Spray', 'Bat Mallet'] },
      { key: 'compatibility', label: 'Compatibility', type: 'text' },
      { key: 'pack_size', label: 'Pack Size', type: 'select', options: ['Single', 'Pack of 2', 'Pack of 5', 'Pack of 10'] }
    ]
  }
}

const COMMON_COLORS = [
  'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Orange', 'Purple', 'Pink', 'Grey', 'Navy', 'Maroon'
]

export default async function NewProductPage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Cricket Product</h1>
            <p className="text-muted-foreground mt-1">
              Create a new product for Sports Devil cricket equipment store
            </p>
          </div>
        </div>

        {/* Product Creation Form */}
        <form className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Gray-Nicolls Kaboom Warner Cricket Bat"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input 
                    id="sku" 
                    placeholder="e.g., GN-KBM-WRN-01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Product Description *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Detailed description of the cricket equipment..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (£) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01" 
                    placeholder="99.99"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="compare_price">Compare Price (£)</Label>
                  <Input 
                    id="compare_price" 
                    type="number" 
                    step="0.01" 
                    placeholder="129.99"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="50"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Cricket Equipment Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(CRICKET_CATEGORIES).map(([key, category]) => (
                  <div key={key} className="relative">
                    <input
                      type="radio"
                      id={`category-${key}`}
                      name="category"
                      value={key}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`category-${key}`}
                      className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all"
                    >
                      <category.icon className="h-8 w-8 mb-2 text-gray-600 peer-checked:text-blue-600" />
                      <span className="text-sm font-medium text-center">{category.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Attributes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Product Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select a category above to see specific attributes for that type of cricket equipment.
                </p>
                
                {/* This section would be dynamically populated based on selected category */}
                <div id="dynamic-attributes" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Placeholder for dynamic attributes */}
                  <div className="col-span-full p-8 border-2 border-dashed border-gray-200 rounded-lg text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select a category to configure product specifications</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colors & Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Colors & Variants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Available Colors *</Label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {COMMON_COLORS.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox id={`color-${color.toLowerCase()}`} />
                      <Label 
                        htmlFor={`color-${color.toLowerCase()}`}
                        className="text-sm font-normal"
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-colors">Additional Colors (comma-separated)</Label>
                <Input 
                  id="custom-colors" 
                  placeholder="e.g., Lime Green, Royal Blue, Burgundy"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                </div>
                <input type="file" className="sr-only" multiple accept="image/*" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Main Image</Badge>
                <Badge variant="outline">Gallery Image 1</Badge>
                <Badge variant="outline">Gallery Image 2</Badge>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Status & Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Product Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Product Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gray-nicolls">Gray-Nicolls</SelectItem>
                      <SelectItem value="gunn-moore">Gunn & Moore</SelectItem>
                      <SelectItem value="kookaburra">Kookaburra</SelectItem>
                      <SelectItem value="new-balance">New Balance</SelectItem>
                      <SelectItem value="adidas">Adidas</SelectItem>
                      <SelectItem value="puma">Puma</SelectItem>
                      <SelectItem value="spartan">Spartan</SelectItem>
                      <SelectItem value="sg">SG</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="featured" />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="track-stock" defaultChecked />
                <Label htmlFor="track-stock">Track inventory for this product</Label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Product
            </Button>
            
            <Button type="button" variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Save & Preview
            </Button>
            
            <Button type="button" variant="ghost" asChild>
              <Link href="/admin">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
          </div>
        </form>

        {/* Help Section */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                🏏 Cricket Equipment Tips
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Use detailed product names including brand, model, and key features</li>
                <li>• Include multiple high-quality images showing different angles</li>
                <li>• Specify exact measurements and weights for cricket bats</li>
                <li>• Mention safety standards for protective equipment</li>
                <li>• Add size guides and fitting information in descriptions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}