import { useState } from 'react'

export interface ProductGalleryImage {
  readonly alt: string
  readonly src: string
}

export interface ProductGalleryProps {
  readonly images: readonly ProductGalleryImage[]
  readonly productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedImage = images[selectedIndex]

  if (!selectedImage) {
    return (
      <div className="product-gallery product-gallery--empty">
        <span aria-hidden="true">{productName.slice(0, 1)}</span>
        <p>Imagen no disponible</p>
      </div>
    )
  }

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        <img alt={selectedImage.alt} src={selectedImage.src} />
      </div>
      <div aria-label="Imágenes del producto" className="product-gallery__thumbs">
        {images.map((image, index) => (
          <button
            aria-current={index === selectedIndex ? 'true' : undefined}
            aria-label={`Mostrar imagen ${index + 1} de ${productName}`}
            key={`${image.src}-${index}`}
            onClick={() => setSelectedIndex(index)}
            type="button"
          >
            <img alt="" src={image.src} />
          </button>
        ))}
      </div>
    </div>
  )
}
