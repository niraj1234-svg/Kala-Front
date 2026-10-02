import React, { useRef, useState } from 'react'
import type { UploadedApparelImage } from './types'

interface DesignUploaderProps {
  currentArtworkName: string
  currentArtworkUrl: string
  onUpload: (dataUrl: string, fileName: string, fileType: string) => void
  onResetDefault: () => void
  uploadedApparel?: UploadedApparelImage | null
  onUploadApparel?: (apparel: UploadedApparelImage) => void
  onRemoveApparel?: () => void
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

// Upload 1: Artwork / Logo formats
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg']

// Upload 2: Customer Apparel formats
const APPAREL_ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const APPAREL_ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']

export const DesignUploader: React.FC<DesignUploaderProps> = ({
  currentArtworkName,
  currentArtworkUrl,
  onUpload,
  onResetDefault,
  uploadedApparel = null,
  onUploadApparel,
  onRemoveApparel,
}) => {
  // --- Upload 1 State (Artwork / Logo) ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // --- Upload 2 State (Customer's Own Apparel) ---
  const apparelInputRef = useRef<HTMLInputElement>(null)
  const [apparelErrorMsg, setApparelErrorMsg] = useState<string | null>(null)
  const [isApparelDraggingOver, setIsApparelDraggingOver] = useState(false)

  // Process Upload 1: Artwork
  const processFile = (file: File) => {
    setErrorMsg(null)

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg('Maximum file size is 10MB.')
      return
    }

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

  // Process Upload 2: Customer's Own Apparel Photo
  const processApparelFile = (file: File) => {
    setApparelErrorMsg(null)

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setApparelErrorMsg('Maximum file size is 10MB.')
      return
    }

    // Validate format: PNG, JPG, JPEG, WEBP
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
    const isValidExtension = APPAREL_ALLOWED_EXTENSIONS.includes(extension)
    const isValidMime = APPAREL_ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())

    if (!isValidExtension && !isValidMime) {
      setApparelErrorMsg('File must be PNG, JPG, JPEG or WEBP.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result && onUploadApparel) {
        onUploadApparel({
          dataUrl: result,
          fileName: file.name,
          fileType: file.type || 'image/jpeg',
          fileSize: file.size,
        })
      }
    }
    reader.onerror = () => {
      setApparelErrorMsg('Failed to read apparel image. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const handleApparelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processApparelFile(file)
    }
    if (apparelInputRef.current) {
      apparelInputRef.current.value = ''
    }
  }

  const handleApparelDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsApparelDraggingOver(true)
  }

  const handleApparelDragLeave = () => {
    setIsApparelDraggingOver(false)
  }

  const handleApparelDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsApparelDraggingOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processApparelFile(file)
    }
  }

  const isDefaultArtwork = currentArtworkName === 'Default KALA Emblem'

  return (
    <div className="kala-bulk-step-block">
      <div className="kala-bulk-step-heading">
        <span className="kala-bulk-step-num">3</span>
        <h3 className="kala-bulk-step-title">UPLOAD YOUR DESIGN</h3>
      </div>

      {/* Upload 1: Artwork / Logo / Graphic */}
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

      {/* Validation Error Message for Artwork */}
      {errorMsg && (
        <div className="kala-bulk-upload-error" role="alert">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* Active File Feedback Pill for Artwork */}
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

      {/* OR Divider */}
      <div className="kala-bulk-upload-or-divider" aria-hidden="true">
        <span className="kala-bulk-or-line" />
        <span className="kala-bulk-or-badge">OR</span>
        <span className="kala-bulk-or-line" />
      </div>

      {/* Upload 2: Upload Your Own Apparel Option */}
      <div className="kala-bulk-own-apparel-block">
        <div className="kala-bulk-own-apparel-header">
          <h4 className="kala-bulk-own-apparel-title">UPLOAD YOUR OWN APPAREL</h4>
          <p className="kala-bulk-own-apparel-subtitle">
            Already have a T-shirt, hoodie or jersey? Upload its image and customize it.
          </p>
        </div>

        {!uploadedApparel ? (
          /* Placeholder Upload Dropzone */
          <div
            className={`kala-bulk-apparel-dropzone ${isApparelDraggingOver ? 'drag-over' : ''}`}
            onDragOver={handleApparelDragOver}
            onDragLeave={handleApparelDragLeave}
            onDrop={handleApparelDrop}
          >
            <input
              type="file"
              ref={apparelInputRef}
              onChange={handleApparelFileChange}
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              id="bulk-apparel-file-input"
              aria-label="Upload your own apparel photo"
              style={{ display: 'none' }}
            />

            <div className="kala-bulk-apparel-drop-inner">
              <div className="kala-bulk-apparel-icon-wrap" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>

              <button
                type="button"
                className="kala-bulk-apparel-upload-btn"
                onClick={() => apparelInputRef.current?.click()}
              >
                Upload Your Apparel
              </button>

              <p className="kala-bulk-apparel-formats">
                PNG, JPG, JPEG, WEBP • Max 10MB
              </p>
            </div>
          </div>
        ) : (
          /* After Upload: Preview with Thumbnail, Filename, and Remove Button */
          <div className="kala-bulk-apparel-preview-card">
            <div className="kala-bulk-apparel-preview-badge-row">
              <span className="kala-bulk-apparel-badge">YOUR APPAREL</span>
            </div>

            <div className="kala-bulk-apparel-preview-body">
              <div className="kala-bulk-apparel-thumb-wrap">
                <img
                  src={uploadedApparel.dataUrl}
                  alt={uploadedApparel.fileName}
                  className="kala-bulk-apparel-thumb"
                />
              </div>

              <div className="kala-bulk-apparel-file-info">
                <span className="kala-bulk-apparel-filename" title={uploadedApparel.fileName}>
                  {uploadedApparel.fileName}
                </span>
                <span className="kala-bulk-apparel-filesize">
                  {(uploadedApparel.fileSize / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              {onRemoveApparel && (
                <button
                  type="button"
                  className="kala-bulk-apparel-remove-btn"
                  onClick={onRemoveApparel}
                  aria-label="Remove uploaded apparel"
                  title="Remove uploaded apparel"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}

        {/* Validation Error Message for Apparel */}
        {apparelErrorMsg && (
          <div className="kala-bulk-upload-error" role="alert" style={{ marginTop: '0.5rem' }}>
            <span>⚠️ {apparelErrorMsg}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DesignUploader
