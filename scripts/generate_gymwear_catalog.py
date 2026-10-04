import os
import cv2
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_IMAGE_PATH = r'C:\Users\91766\.gemini\antigravity-ide\brain\957b9286-b708-4297-92fb-fd33e026ea6e\.user_uploaded\media_1791108277036.jpg'

DEST_DIRS = [
    os.path.join(BASE_DIR, 'client', 'images'),
    os.path.join(BASE_DIR, 'client', 'public', 'images'),
    os.path.join(BASE_DIR, 'client', 'public', 'products')
]

for d in DEST_DIRS:
    os.makedirs(d, exist_ok=True)

src_img = cv2.imread(SRC_IMAGE_PATH)
if src_img is None:
    raise FileNotFoundError(f"Source image not found at {SRC_IMAGE_PATH}")

row_ranges = [
    (0, 181),
    (241, 421),
    (480, 655),
    (710, 884)
]

col_ranges = [
    (0, 204),
    (205, 409),
    (410, 614),
    (615, 819),
    (820, 1024)
]

gymwear_items = [
    # Row 0
    ('kala-apex-compression-set.png', 0, 0),
    ('kala-discipline-set.png', 0, 1),
    ('kala-oni-training-set.png', 0, 2),
    ('kala-grind-mode-set.png', 0, 3),
    ('kala-everyday-set.png', 0, 4),
    # Row 1
    ('kala-evolve-set.png', 1, 0),
    ('kala-no-limits-set.png', 1, 1),
    ('kala-wings-set.png', 1, 2),
    ('kala-relentless-set.png', 1, 3),
    ('kala-overthink-set.png', 1, 4),
    # Row 2
    ('kala-nature-set.png', 2, 0),
    ('kala-iron-mind-set.png', 2, 1),
    ('kala-good-mood-set.png', 2, 2),
    ('kala-zen-set.png', 2, 3),
    ('kala-tech-set.png', 2, 4),
    # Row 3
    ('kala-purpose-set.png', 3, 0),
    ('kala-focus-set.png', 3, 1),
    ('kala-progress-set.png', 3, 2),
    ('kala-chaos-set.png', 3, 3),
    ('kala-repeat-set.png', 3, 4)
]

def process_and_save(crop, filename):
    h, w = crop.shape[:2]
    
    # 1. Mask for top-right heart icon
    mask = np.zeros((h, w), dtype=np.uint8)
    tr_region = crop[2:32, w-32:w]
    tr_bright = (tr_region[:, :, 0] > 210) & (tr_region[:, :, 1] > 210) & (tr_region[:, :, 2] > 210)
    tr_mask = np.zeros((30, 32), dtype=np.uint8)
    tr_mask[tr_bright] = 255
    kernel = np.ones((3, 3), np.uint8)
    tr_mask = cv2.dilate(tr_mask, kernel, iterations=2)
    mask[2:32, w-32:w] = tr_mask
    
    # 2. Mask for bottom-left rating pill
    bl_region = crop[h-28:h, 0:65]
    bl_bright = (bl_region[:, :, 0] > 200) | ((bl_region[:, :, 1] > 180) & (bl_region[:, :, 2] > 180))
    bl_mask = np.zeros((28, 65), dtype=np.uint8)
    bl_mask[bl_bright] = 255
    bl_mask = cv2.dilate(bl_mask, kernel, iterations=2)
    mask[h-28:h, 0:65] = bl_mask
    
    # 3. Inpaint seamlessly
    clean = cv2.inpaint(crop, mask, 3, cv2.INPAINT_TELEA)
    
    # 4. Pad vertically to match 4:5 vertical proportion (204 -> 255)
    target_h = int(w * 1.25)
    pad_total = max(0, target_h - h)
    pad_top = int(pad_total * 0.42)
    pad_bot = pad_total - pad_top
    
    padded = cv2.copyMakeBorder(clean, pad_top, pad_bot, 0, 0, cv2.BORDER_REPLICATE)
    
    # 5. High-resolution Lanczos supersampling (1600 x 2000)
    up = cv2.resize(padded, (1600, 2000), interpolation=cv2.INTER_LANCZOS4)
    
    # 6. Edge-preserving bilateral filter to eliminate compression artifacts
    denoised = cv2.bilateralFilter(up, d=5, sigmaColor=32, sigmaSpace=32)
    
    # 7. Unsharp mask for high-contrast crisp text and fabric weaves
    gaussian = cv2.GaussianBlur(denoised, (0, 0), 2.5)
    sharp = cv2.addWeighted(denoised, 1.38, gaussian, -0.38, 0)
    
    for d in DEST_DIRS:
        dest_path = os.path.join(d, filename)
        cv2.imwrite(dest_path, sharp, [cv2.IMWRITE_PNG_COMPRESSION, 4])
    print(f"[SUCCESS] Processed & saved {filename}")

def main():
    print("Processing all 20 Gymwear Set images...")
    for filename, r_idx, c_idx in gymwear_items:
        y1, y2 = row_ranges[r_idx]
        x1, x2 = col_ranges[c_idx]
        crop = src_img[y1:y2, x1:x2].copy()
        process_and_save(crop, filename)
    print("All 20 Gymwear Set images processed successfully!")

if __name__ == '__main__':
    main()
