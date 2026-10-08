import React, { useRef, useState } from 'react'

export interface UploadedArtwork {
  file: File
  dataUrl: string
  name: string
  sizeBytes: number
  sizeFormatted: string
  dimensions?: { width: number; height: number }
}

interface DesignUploaderProps {
  artwork: UploadedArtwork | null
  onArtworkChange: (artwork: UploadedArtwork | null) => void
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg']

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const DesignUploader: React.FC<DesignUploaderProps> = ({
  artwork,
  onArtworkChange,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    setErrorMessage(null)

    // 1. Validate File Type
    const fileType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext))
    const hasValidType = ALLOWED_TYPES.includes(fileType) || hasValidExt

    if (!hasValidType) {
      setErrorMessage('Please upload a PNG, JPG, WEBP or SVG image.')
      return
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Your file is too large. Please upload an image under 10MB.')
      return
    }

    // 3. Read File as Data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (!dataUrl) {
        setErrorMessage('Failed to read image file. Please try another image.')
        return
      }

      // Read dimensions
      const img = new Image()
      img.onload = () => {
        onArtworkChange({
          file,
          dataUrl,
          name: file.name,
          sizeBytes: file.size,
          sizeFormatted: formatFileSize(file.size),
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        })
      }
      img.onerror = () => {
        // Fallback without natural dimensions
        onArtworkChange({
          file,
          dataUrl,
          name: file.name,
          sizeBytes: file.size,
          sizeFormatted: formatFileSize(file.size),
        })
      }
      img.src = dataUrl
    }
    reader.onerror = () => {
      setErrorMessage('Failed to read file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    // Reset input so same file can be re-selected if needed
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  return (
    <div className="kala-custom-selector-group">
      <div className="kala-uploader-header-row">
        <label className="kala-custom-step-label">
          <span className="kala-custom-step-badge">4</span>
          <span>Upload Your Design</span>
        </label>
        {artwork && (
          <span className="kala-uploader-ready-badge">
            Design Ready
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {artwork ? (
        /* Uploaded Artwork Summary Card */
        <div className="kala-artwork-card">
          <div className="kala-artwork-thumb">
            <img
              src={artwork.dataUrl}
              alt="Uploaded artwork preview"
            />
          </div>

          <div className="kala-artwork-info">
            <div className="kala-artwork-name" title={artwork.name}>
              {artwork.name}
            </div>
            <div className="kala-artwork-dimensions">
              {artwork.sizeFormatted}
              {artwork.dimensions && ` • ${artwork.dimensions.width}×${artwork.dimensions.height}px`}
            </div>
          </div>

          <div className="kala-artwork-actions">
            <button
              type="button"
              className="kala-artwork-replace-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="kala-artwork-remove-btn"
              onClick={() => {
                onArtworkChange(null)
                setErrorMessage(null)
              }}
              aria-label="Remove artwork"
              title="Remove artwork"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Area / Clickable Upload Zone */
        <div
          className={`kala-dropzone ${isDragging ? 'dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          aria-label="Click or drop design here to upload"
        >
          <div className="kala-dropzone-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <div className="kala-dropzone-text">
            <span>Drag &amp; drop artwork here, or </span>
            <span className="kala-dropzone-highlight">browse file</span>
          </div>
          <div className="kala-dropzone-hint">
            PNG, JPG, WEBP, or SVG • Max 10MB
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mt-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2 animate-fadeIn" role="alert">
          <svg className="w-4 h-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}

export default DesignUploader
