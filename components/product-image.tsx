'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export function ProductImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false, 
  fill = false,
  sizes 
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      // Try with .webp extension if original failed
      if (!src.endsWith('.webp')) {
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
        setImgSrc(webpSrc)
        return
      }
    }
    // Fallback to placeholder if webp also fails
    setImgSrc('/placeholder.svg?height=300&width=300')
  }

  const commonProps = {
    src: imgSrc,
    alt,
    onError: handleError,
    className,
    priority,
    sizes
  }

  if (fill) {
    return <Image {...commonProps} fill />
  }

  return <Image {...commonProps} width={width} height={height} />
}