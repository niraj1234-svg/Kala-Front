import React, { useRef, useState } from 'react'

interface DesignUploaderProps {
  currentArtworkName: string
  currentArtworkUrl: string
  onUpload: (dataUrl: string, fileName: string, fileType: string) => void
  onResetDefault: () => void
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg']

export const DesignUploader: React.FC<DesignUploaderProps> = ({
  currentArtworkName,
  currentArtworkUrl,
  onUpload,
  onResetDefault,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const processFile = (file: File) => {
    setErrorMsg(null)

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`)
      return
    }

    // Validate format
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
    const isValidExtension = ALLOWED_EXTENSIONS.includes(extension)
    const isValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())

    if (!isValidExtension && !isValidMime) {
      setErrorMsg('Unsupported file type. Please upload a PNG, JPG, or SVG file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        onUpload(result, file.name, file.type || 'image/png')
      }
    }
    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = () => {
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const isDefaultArtwork = currentArtworkName === 'Default KALA Emblem'

  return (
    <div className="kala-bulk-step-block">
      <div className="kala-bulk-step-heading">
        <span className="kala-bulk-step-num">3</span>
        <h3 className="kala-bulk-step-title">UPLOAD YOUR DESIGN</h3>
      </div>

      <div
        className={`kala-bulk-upload-card ${isDraggingOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="kala-bulk-upload-left">
          {/* Upload Tray Icon */}
          <div className="kala-bulk-upload-icon-wrap" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <div className="kala-bulk-upload-texts">
            <h4 className="kala-bulk-upload-label">Upload your design</h4>
            <p className="kala-bulk-upload-hint">PNG, JPG or SVG (Max 10MB)</p>
          </div>
        </div>

        <div className="kala-bulk-upload-action">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
            className="hidden"
            id="bulk-design-file-input"
            aria-label="Upload design file"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="kala-bulk-choose-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </button>
        </div>
      </div>

      {/* Validation Error Message */}
      {errorMsg && (
        <div className="kala-bulk-upload-error" role="alert">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* Active File Feedback Pill */}
      {currentArtworkUrl && (
        <div className="kala-bulk-uploaded-pill">
          <div className="kala-bulk-pill-meta">
            <span className="kala-bulk-pill-tag">ACTIVE DESIGN:</span>
            <span className="kala-bulk-pill-name">{currentArtworkName}</span>
          </div>
          {!isDefaultArtwork && (
            <button
              type="button"
              className="kala-bulk-pill-reset"
              onClick={onResetDefault}
              title="Reset to demo KALA graphic"
            >
              Reset to Demo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default DesignUploader
