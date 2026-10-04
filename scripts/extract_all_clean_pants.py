import os
import cv2
import numpy as np
from PIL import Image

ARTIFACT_DIR = r'C:\Users\91766\.gemini\antigravity-ide\brain\e2bb4e30-54a3-490b-8aa6-3396cd36c398'
OUT_DIR = 'scripts/clean_pants_v3'
os.makedirs(OUT_DIR, exist_ok=True)

PANTS_MAP = {
    'kala-iron-mind-set': 'iron_mind_pants_1791131748351.jpg',
    'kala-good-mood-set': 'good_mood_pants_1791131773358.jpg',
    'kala-zen-set': 'zen_technical_pants_1791131791857.jpg',
    'kala-tech-set': 'tech_charcoal_pants_1791131820110.jpg',
    'kala-purpose-set': 'purpose_performance_pants_1791131847814.jpg',
    'kala-focus-set': 'focus_teal_pants_1791132578779.jpg',
    'kala-progress-set': 'progress_charcoal_pants_1791132599887.jpg',
    'kala-chaos-set': 'chaos_purple_pants_1791132620467.jpg',
    'kala-repeat-set': 'repeat_charcoal_pants_1791132642770.jpg'
}

def clean_and_extract_pants(bgr):
    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    
    # Background in studio shot is light grey (saturation < 30, luminance > 185)
    is_bg = (gray > 185) & (hsv[:, :, 1] < 30)
    raw_mask = np.where(is_bg, 0, 255).astype(np.uint8)
    
    # Floodfill from borders to guarantee outer background is removed
    inv = (raw_mask == 0).astype(np.uint8) * 255
    flood = inv.copy()
    mask_ff = np.zeros((h + 2, w + 2), np.uint8)
    for pt in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, h - 1)]:
        if flood[pt[1], pt[0]] == 255:
            cv2.floodFill(flood, mask_ff, pt, 128)
            
    fg_mask = np.where(flood == 128, 0, 255).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, k)
    
    # Keep only the largest connected component (the pants)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(fg_mask)
    if num_labels > 1:
        largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        fg_mask = np.where(labels == largest_label, 255, 0).astype(np.uint8)
        
    alpha = cv2.GaussianBlur(fg_mask, (3, 3), 0.7)
    return alpha

for pid, fname in PANTS_MAP.items():
    p = os.path.join(ARTIFACT_DIR, fname)
    bgr = cv2.imread(p)
    if bgr is None:
        print(f"Error loading {p}")
        continue
    alpha = clean_and_extract_pants(bgr)
    
    # 1. Front pants RGBA (convert BGR to RGB!)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGBA)
    rgb[:, :, 3] = alpha
    im_front = Image.fromarray(rgb)
    
    # Crop to bounding box
    y_idx, x_idx = np.where(alpha > 30)
    front_cropped = im_front.crop((x_idx.min(), y_idx.min(), x_idx.max() + 1, y_idx.max() + 1))
    front_cropped.save(os.path.join(OUT_DIR, f"{pid}_front.png"))
    
    # 2. Back pants RGBA (seamless clone of clean fabric into center drawstrings/fly)
    bgr_back = bgr.copy()
    h, w = bgr.shape[:2]
    
    # Sample clean fabric from right thigh (x: 550..660) and flip horizontally
    patch = cv2.flip(bgr[80:360, 550:660], 1)
    pw = patch.shape[1]
    for i in range(pw):
        t = 1.0
        if i < 14:
            t = i / 14.0
        elif i > pw - 15:
            t = (pw - 1 - i) / 14.0
        target_x = 390 + i
        if target_x < w:
            bgr_back[80:360, target_x] = np.clip(bgr[80:360, target_x] * (1 - t) + patch[:, i] * t, 0, 255).astype(np.uint8)
            
    rgb_back = cv2.cvtColor(bgr_back, cv2.COLOR_BGR2RGBA)
    rgb_back[:, :, 3] = alpha
    im_back = Image.fromarray(rgb_back)
    back_cropped = im_back.crop((x_idx.min(), y_idx.min(), x_idx.max() + 1, y_idx.max() + 1))
    back_cropped.save(os.path.join(OUT_DIR, f"{pid}_back.png"))
    
    print(f"Processed: {pid} (front: {front_cropped.size}, back: {back_cropped.size})")

print("All 9 pants clean masks v3 generated successfully!")
