'use client'

import { useState, useCallback } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useToast } from '../../hooks/use-toast'
import { 
  Upload,
  Image as ImageIcon,
  X,
  Star,
  Move,
  Edit,
  Trash2,
  Camera,
  Info
} from 'lucide-react'

interface ImageData {
  id: string
  url: string
  alt: string
  caption?: string
  isPrimary: boolean
  file?: File
}

interface ImageUploaderProps {
  images: ImageData[]
  onChange: (images: ImageData[]) => void
  maxImages?: number
}

// V9.11.3: Drag & Drop Image Uploader with Preview
export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  // Handle file selection
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [])

  // Process files
  const handleFiles = async (files: FileList) => {
    const newImages: ImageData[] = []
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported image format`,
          variant: 'destructive'
        })
        continue
      }

      // Validate file size
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 5MB limit`,
          variant: 'destructive'
        })
        continue
      }

      // Check max images
      if (images.length + newImages.length >= maxImages) {
        toast({
          title: 'Maximum images reached',
          description: `You can only upload ${maxImages} images`,
          variant: 'destructive'
        })
        break
      }

      // Create preview URL
      const url = URL.createObjectURL(file)
      newImages.push({
        id: `temp-${Date.now()}-${i}`,
        url,
        alt: file.name.split('.')[0],
        isPrimary: images.length === 0 && i === 0,
        file
      })
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages])
    }
  }

  // Remove image
  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id)
    
    // If removed image was primary, make first image primary
    if (images.find(img => img.id === id)?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true
    }
    
    onChange(updatedImages)
  }

  // Set primary image
  const setPrimaryImage = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === id
    }))
    onChange(updatedImages)
  }

  // Update image alt text
  const updateImageAlt = (id: string, alt: string) => {
    const updatedImages = images.map(img => 
      img.id === id ? { ...img, alt } : img
    )
    onChange(updatedImages)
  }

  // Move image position
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < images.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
      onChange(newImages)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <input
            type="file"
            id="image-upload"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleChange}
            disabled={images.length >= maxImages}
          />
          
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex flex-col items-center"
          >
            <div className={`p-4 rounded-full mb-4 ${
              dragActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
            }`}>
              <Upload className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium mb-2">
              {dragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={images.length >= maxImages}
            >
              <Camera className="h-4 w-4 mr-2" />
              Select Images
            </Button>
          </label>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Supported formats: JPG, PNG, WebP (max 5MB each)</p>
            <p>{images.length} / {maxImages} images uploaded</p>
          </div>
        </div>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Uploaded Images</h3>
            <Badge variant="outline">{images.length} images</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card key={image.id} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </Badge>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      {!image.isPrimary && (
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => setPrimaryImage(image.id)}
                          className="h-8 w-8"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      {index > 0 && (
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => moveImage(index, 'up')}
                          className="h-8 w-8"
                        >
                          ↑
                        </Button>
                      )}
                      {index < images.length - 1 && (
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => moveImage(index, 'down')}
                          className="h-8 w-8"
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => removeImage(image.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Alt Text Input */}
                <div className="p-2">
                  <Input
                    value={image.alt}
                    onChange={(e) => updateImageAlt(image.id, e.target.value)}
                    placeholder="Alt text..."
                    className="text-xs"
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Image Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>First image will be the main product photo</li>
                  <li>Drag images to reorder them</li>
                  <li>Add descriptive alt text for SEO</li>
                  <li>Use consistent backgrounds for professional look</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}