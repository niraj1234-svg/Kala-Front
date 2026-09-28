import React, { useRef, useState } from 'react'

export interface UploadedArtwork {
  file: File
  dataUrl: string
  name: string
  sizeKb: number
  position: 'Chest' | 'Center' | 'Lower'
  scale: number // 0.6 to 1.4
}

interface DesignUploaderProps {
  uploadedArtwork: UploadedArtwork | null
  onUploadArtwork: (artwork: UploadedArtwork | null) => void
  onUpdateArtworkSettings?: (position: 'Chest' | 'Center' | 'Lower', scale: number) => void
}

export const DesignUploader: React.FC<DesignUploaderProps> = ({
  uploadedArtwork,
  onUploadArtwork,
  onUpdateArtworkSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const processFile = (file: File) => {
    setErrorMessage(null)

    // 1. File Type Validation
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    const isSvgExt = file.name.toLowerCase().endsWith('.svg')
    if (!validExtensions.includes(file.type) && !isSvgExt) {
      setErrorMessage('Unsupported file format. Please upload PNG, JPG, JPEG, or SVG.')
      return
    }

    // 2. File Size Validation (Max 10MB)
    const maxBytes = 10 * 1024 * 1024
    if (file.size > maxBytes) {
      setErrorMessage('File size exceeds 10MB limit. Please upload a smaller artwork file.')
      return
    }

    // 3. Read into Data URL for instant live rendering over garment preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl) {
        onUploadArtwork({
          file,
          dataUrl,
          name: file.name,
          sizeKb: Math.round(file.size / 1024),
          position: uploadedArtwork?.position || 'Center',
          scale: uploadedArtwork?.scale || 1.0,
        })
      }
    }
    reader.onerror = () => {
      setErrorMessage('Failed to read file. Please try another image.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleRemove = () => {
    onUploadArtwork(null)
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePositionChange = (pos: 'Chest' | 'Center' | 'Lower') => {
    if (!uploadedArtwork) return
    const newArt = { ...uploadedArtwork, position: pos }
    onUploadArtwork(newArt)
    onUpdateArtworkSettings?.(pos, newArt.scale)
  }

  const handleScaleChange = (delta: number) => {
    if (!uploadedArtwork) return
    const newScale = Math.max(0.6, Math.min(1.5, Number((uploadedArtwork.scale + delta).toFixed(1))))
    const newArt = { ...uploadedArtwork, scale: newScale }
    onUploadArtwork(newArt)
    onUpdateArtworkSettings?.(newArt.position, newScale)
  }

  const handleResetControls = () => {
    if (!uploadedArtwork) return
    const newArt = { ...uploadedArtwork, position: 'Center' as const, scale: 1.0 }
    onUploadArtwork(newArt)
    onUpdateArtworkSettings?.('Center', 1.0)
  }

  return (
    <div className="kala-bulk-design-section">
      <div className="kala-bulk-field-header-row">
        <div className="kala-bulk-step-label-wrap">
          <span className="kala-bulk-step-num">4</span>
          <label className="kala-bulk-step-title">Customize Your Design</label>
        </div>
        {uploadedArtwork && (
          <span className="kala-bulk-design-ready-badge">
            ✓ Artwork Attached ({uploadedArtwork.sizeKb} KB)
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="bulk-design-file-input"
      />

      {uploadedArtwork ? (
        /* Uploaded Artwork Preview & Controls Card */
        <div className="kala-bulk-uploaded-card">
          <div className="kala-bulk-uploaded-row">
            <div className="kala-bulk-uploaded-thumb-wrap">
              <img
                src={uploadedArtwork.dataUrl}
                alt="Uploaded Custom Design"
                className="kala-bulk-uploaded-thumb"
              />
            </div>
            <div className="kala-bulk-uploaded-meta">
              <span className="kala-bulk-uploaded-filename" title={uploadedArtwork.name}>
                {uploadedArtwork.name}
              </span>
              <span className="kala-bulk-uploaded-size">
                {uploadedArtwork.sizeKb} KB • Applied to Preview
              </span>
              <div className="kala-bulk-uploaded-btns">
                <button
                  type="button"
                  className="kala-bulk-upload-action-btn replace"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  className="kala-bulk-upload-action-btn remove"
                  onClick={handleRemove}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simple Printable Controls (Move, Resize, Reset) */}
          <div className="kala-bulk-art-controls">
            <div className="kala-bulk-art-control-group">
              <span className="kala-bulk-art-control-label">Position:</span>
              <div className="kala-bulk-art-pills">
                {(['Chest', 'Center', 'Lower'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    className={`kala-bulk-art-pill ${uploadedArtwork.position === pos ? 'active' : ''}`}
                    onClick={() => handlePositionChange(pos)}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="kala-bulk-art-control-group">
              <span className="kala-bulk-art-control-label">Scale:</span>
              <div className="kala-bulk-art-scale-stepper">
                <button
                  type="button"
                  className="kala-bulk-art-scale-btn"
                  onClick={() => handleScaleChange(-0.1)}
                  disabled={uploadedArtwork.scale <= 0.6}
                  aria-label="Decrease artwork scale"
                >
                  −
                </button>
                <span className="kala-bulk-art-scale-val">
                  {Math.round(uploadedArtwork.scale * 100)}%
                </span>
                <button
                  type="button"
                  className="kala-bulk-art-scale-btn"
                  onClick={() => handleScaleChange(0.1)}
                  disabled={uploadedArtwork.scale >= 1.5}
                  aria-label="Increase artwork scale"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="kala-bulk-art-reset-btn"
                onClick={handleResetControls}
                title="Reset position and size to default"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          className={`kala-bulk-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click()
            }
          }}
          aria-label="Upload custom artwork design"
        >
          <div className="kala-bulk-dropzone-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="kala-bulk-dropzone-text">
            <strong>+ Upload Your Artwork / Logo</strong>
            <span>Drag &amp; drop or click to browse (PNG, JPG, JPEG, SVG)</span>
          </div>
          <span className="kala-bulk-dropzone-limit">Up to 10 MB • High-Res recommended</span>
        </div>
      )}

      {errorMessage && (
        <div className="kala-bulk-field-error" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}

export default DesignUploader
