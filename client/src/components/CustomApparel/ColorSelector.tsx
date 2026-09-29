import React from 'react'

export interface ColorOption {
  id: string
  name: string
  hex: string
}

export const POPULAR_COLORS: ColorOption[] = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#18181B' },
  { id: 'navy', name: 'Navy Blue', hex: '#14213D' },
  { id: 'grey', name: 'Heather Grey', hex: '#94A3B8' },
  { id: 'forest', name: 'Forest Green', hex: '#1B4332' },
  { id: 'maroon', name: 'Maroon', hex: '#6B1D2F' },
  { id: 'royal', name: 'Royal Blue', hex: '#1D4ED8' },
  { id: 'sand', name: 'Sand Beige', hex: '#D4A373' },
  { id: 'red', name: 'Crimson Red', hex: '#DC2626' },
]

interface ColorSelectorProps {
  selectedColor: string
  colorName: string
  onSelectColor: (hex: string, name: string) => void
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColor,
  colorName,
  onSelectColor,
}) => {
  const isPresetWhite = selectedColor.toUpperCase() === '#FFFFFF'
  const isPresetBlack = selectedColor.toUpperCase() === '#18181B' || selectedColor.toUpperCase() === '#111111' || selectedColor.toUpperCase() === '#000000'
  const isOther = !isPresetWhite && !isPresetBlack

  return (
    <div className="kala-custom-selector-group">
      <div className="flex items-center justify-between mb-2">
        <label className="kala-custom-step-label mb-0">
          <span className="kala-custom-step-badge">2</span>
          <span>Select Color</span>
        </label>
        <span className="text-xs font-semibold text-[#111111] bg-[#F3F4F6] px-2 py-0.5 rounded-full font-mono">
          {colorName}
        </span>
      </div>

      {/* Main 3 High-Level Choices: White, Black, Other */}
      <div className="grid grid-cols-3 gap-2.5 mb-3" role="radiogroup" aria-label="Color choices">
        <button
          type="button"
          role="radio"
          aria-checked={isPresetWhite}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
            isPresetWhite
              ? 'border-[#D94700] bg-[#FFF8F5] ring-1 ring-[#D94700] text-[#111111]'
              : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563]'
          }`}
          onClick={() => onSelectColor('#FFFFFF', 'White')}
        >
          <span className="w-5 h-5 rounded-full bg-white border border-[#D1D5DB] shadow-inner shrink-0" />
          <span>White</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={isPresetBlack}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
            isPresetBlack
              ? 'border-[#D94700] bg-[#FFF8F5] ring-1 ring-[#D94700] text-[#111111]'
              : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563]'
          }`}
          onClick={() => onSelectColor('#18181B', 'Black')}
        >
          <span className="w-5 h-5 rounded-full bg-[#18181B] border border-[#111111] shadow-inner shrink-0" />
          <span>Black</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={isOther}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
            isOther
              ? 'border-[#D94700] bg-[#FFF8F5] ring-1 ring-[#D94700] text-[#111111]'
              : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563]'
          }`}
          onClick={() => {
            if (!isOther) {
              onSelectColor(POPULAR_COLORS[2].hex, POPULAR_COLORS[2].name)
            }
          }}
        >
          <span
            className="w-5 h-5 rounded-full border border-[#D1D5DB] shadow-inner shrink-0"
            style={{
              background: isOther
                ? selectedColor
                : 'conic-gradient(from 180deg, #14213D, #94A3B8, #1B4332, #6B1D2F, #1D4ED8, #D4A373, #DC2626)',
            }}
          />
          <span>Other</span>
        </button>
      </div>

      {/* Expanded Swatches when "Other" is active */}
      {isOther && (
        <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] space-y-2 animate-fadeIn">
          <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            Popular Streetwear Shades
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {POPULAR_COLORS.slice(2).map((col) => {
              const isColSelected = selectedColor.toUpperCase() === col.hex.toUpperCase()
              return (
                <button
                  key={col.id}
                  type="button"
                  title={col.name}
                  aria-label={col.name}
                  className={`w-7 h-7 rounded-full border transition-transform relative ${
                    isColSelected
                      ? 'scale-110 ring-2 ring-[#D94700] ring-offset-2'
                      : 'border-[#CBD5E1] hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  onClick={() => onSelectColor(col.hex, col.name)}
                />
              )
            })}

            {/* Custom Hex Picker Input */}
            <label
              className="w-7 h-7 rounded-full border border-dashed border-[#9CA3AF] flex items-center justify-center cursor-pointer hover:border-[#D94700] transition-colors relative"
              title="Custom Color Picker"
            >
              <span className="text-[10px] text-[#6B7280] font-bold">+</span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onSelectColor(e.target.value, 'Custom')}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                aria-label="Custom color picker"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorSelector
