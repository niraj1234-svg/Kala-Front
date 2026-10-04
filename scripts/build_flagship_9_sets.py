import os
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageFont, ImageDraw

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST_DIRS = [
    os.path.join(BASE_DIR, 'client', 'images'),
    os.path.join(BASE_DIR, 'client', 'public', 'images'),
    os.path.join(BASE_DIR, 'client', 'public', 'products')
]
for d in DEST_DIRS:
    os.makedirs(d, exist_ok=True)

W, H = 2048, 2048
FONTS_DIR = 'C:/Windows/Fonts'

def get_font(name, size):
    font_map = {
        'impact': 'impact.ttf',
        'bold': 'arialbd.ttf',
        'arial': 'arial.ttf',
        'rock': 'ROCKB.TTF',
        'kanji': 'YuGothB.ttc',
        'georgia': 'georgiab.ttf'
    }
    path = os.path.join(FONTS_DIR, font_map.get(name, 'arialbd.ttf'))
    if os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

def create_studio_canvas():
    bg = np.zeros((H, W, 3), dtype=np.float32)
    for y in range(H):
        t = y / H
        c = 236 - 36 * t
        bg[y, :] = [c, c + 1, c + 3]
    return Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8)).convert('RGBA')

def colorize(im_rgba, shadow_rgb, highlight_rgb):
    arr = np.array(im_rgba).astype(np.float32)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    mask = alpha > 10
    if not np.any(mask):
        return im_rgba
    p_min = np.percentile(lum[mask], 2)
    p_max = np.percentile(lum[mask], 98)
    norm = np.clip((lum - p_min) / max(1.0, p_max - p_min), 0.0, 1.0)
    c_shadow = np.array(shadow_rgb, dtype=np.float32)
    c_highlight = np.array(highlight_rgb, dtype=np.float32)
    tinted = c_shadow + norm[:, :, np.newaxis] * (c_highlight - c_shadow)
    out = np.dstack([tinted, alpha])
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

ft_base = Image.open(os.path.join(BASE_DIR, 'scripts', 'front_tee_rgba.png'))
bt_base = Image.open(os.path.join(BASE_DIR, 'scripts', 'back_tee_rgba.png'))
tee_w, tee_h = 760, 880
pw, ph = 540, 1140

def assemble_product(tee_im, pants_cropped, is_back=False):
    pants_scaled = pants_cropped.resize((pw, ph), Image.Resampling.LANCZOS)
    canvas = create_studio_canvas()
    
    # Precise center axis alignment
    tx = 615 if is_back else 644
    ty = 80
    px = (W - pw) // 2
    py = 885
    
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for im, x, y in [(pants_scaled, px, py), (tee_im, tx, ty)]:
        a = im.split()[3]
        sh = Image.new('RGBA', im.size, (15, 20, 25, 50))
        sh.putalpha(a)
        shadow.paste(sh, (x + 3, y + 8), sh)
        
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    canvas = Image.alpha_composite(canvas, shadow)
    
    canvas.paste(pants_scaled, (px, py), pants_scaled)
    canvas.paste(tee_im, (tx, ty), tee_im)
    
    final_rgb = canvas.convert('RGB')
    final_rgb = final_rgb.filter(ImageFilter.UnsharpMask(radius=1.0, percent=100, threshold=2))
    return final_rgb

def save_all(img, filename):
    for d in DEST_DIRS:
        dest_path = os.path.join(d, filename)
        img.save(dest_path, 'PNG', optimize=True)
    print(f"Saved: {filename}")

CLEAN_PANTS_DIR = os.path.join(BASE_DIR, 'scripts', 'clean_pants_v3')

# -------------------------------------------------------------------
# Product 1: kala-iron-mind-set
# Style: Full-length tapered training joggers
# Color: Jet black with silver/white athletic side stripes
# -------------------------------------------------------------------
print("\n--- Generating KALA Iron Mind Set ---")
ft = colorize(ft_base, [18, 19, 22], [55, 58, 65]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [18, 19, 22], [55, 58, 65]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)

d_ft = ImageDraw.Draw(ft)
f_im = get_font('impact', 50)
bbox = d_ft.textbbox((0, 0), 'IRON MIND', font=f_im)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, 290), 'IRON MIND', font=f_im, fill=(245, 245, 250, 255))
cx_c = tee_w // 2
d_ft.line([cx_c - 60, 360, cx_c + 60, 360], fill=(220, 220, 225, 240), width=4)
for s in [-1, 1]:
    d_ft.rectangle([cx_c + s * 45 - 4, 348, cx_c + s * 45 + 4, 372], fill=(220, 220, 225, 240))
    d_ft.rectangle([cx_c + s * 55 - 3, 352, cx_c + s * 55 + 3, 368], fill=(220, 220, 225, 240))

d_bt = ImageDraw.Draw(bt)
f_hw = get_font('impact', 58)
bbox1 = d_bt.textbbox((0, 0), 'HEAVY WEIGHTS', font=f_hw)
bbox2 = d_bt.textbbox((0, 0), 'NO EXCUSES', font=f_hw)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 230), 'HEAVY WEIGHTS', font=f_hw, fill=(245, 245, 250, 255))
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 305), 'NO EXCUSES', font=f_hw, fill=(225, 45, 45, 255))
for i in range(7):
    y_sp = 390 + i * 40
    w_sp = 50 - abs(i - 3) * 6
    d_bt.rectangle([cx_c - w_sp, y_sp, cx_c + w_sp, y_sp + 14], fill=(240, 240, 245, 220))

pf = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-iron-mind-set_front.png'))
pb = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-iron-mind-set_back.png'))
front_img = assemble_product(ft, pf, is_back=False)
back_img = assemble_product(bt, pb, is_back=True)
save_all(front_img, 'kala-iron-mind-set.png')
save_all(front_img, 'kala-iron-mind-set-front.png')
save_all(back_img, 'kala-iron-mind-set-back.png')

# -------------------------------------------------------------------
# Product 2: kala-good-mood-set
# Style: Full-length navy performance track pants
# Color: Deep navy blue with baby blue side stripe panels
# -------------------------------------------------------------------
print("\n--- Generating KALA Good Mood Set ---")
ft = colorize(ft_base, [24, 45, 75], [55, 105, 165]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [24, 45, 75], [55, 105, 165]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)

d_ft = ImageDraw.Draw(ft)
d_ft.line([tee_w - 230, 220, tee_w - 170, 220], fill=(255, 255, 255, 240), width=4)
d_ft.rectangle([tee_w - 225, 210, tee_w - 220, 230], fill=(255, 255, 255, 240))
d_ft.rectangle([tee_w - 180, 210, tee_w - 175, 230], fill=(255, 255, 255, 240))

d_bt = ImageDraw.Draw(bt)
f_main = get_font('impact', 56)
lines = ['GOOD', 'MUSCLES', 'GOOD', 'MOOD']
y_start = 220
for l in lines[:2]:
    bbox = d_bt.textbbox((0, 0), l, font=f_main)
    d_bt.text(((tee_w - (bbox[2] - bbox[0])) // 2, y_start), l, font=f_main, fill=(255, 255, 255, 255))
    y_start += 65
cx_b = tee_w // 2
cy_b = y_start + 30
d_bt.line([cx_b - 120, cy_b, cx_b + 120, cy_b], fill=(255, 255, 255, 255), width=6)
for s in [-1, 1]:
    px_b = cx_b + s * 85
    d_bt.rectangle([px_b - 8, cy_b - 36, px_b + 8, cy_b + 36], fill=(255, 255, 255, 255))
    d_bt.rectangle([px_b + s * 14 - 5, cy_b - 28, px_b + s * 14 + 5, cy_b + 28], fill=(255, 255, 255, 255))
y_start += 75
for l in lines[2:]:
    bbox = d_bt.textbbox((0, 0), l, font=f_main)
    d_bt.text(((tee_w - (bbox[2] - bbox[0])) // 2, y_start), l, font=f_main, fill=(255, 255, 255, 255))
    y_start += 65

pf = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-good-mood-set_front.png'))
pb = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-good-mood-set_back.png'))
front_img = assemble_product(ft, pf, is_back=False)
back_img = assemble_product(bt, pb, is_back=True)
save_all(front_img, 'kala-good-mood-set.png')
save_all(front_img, 'kala-good-mood-set-front.png')
save_all(back_img, 'kala-good-mood-set-back.png')

# -------------------------------------------------------------------
# Product 3: kala-zen-set
# Style: Full-length black technical training pants
# Color: Black with crimson red accents and aglets
# -------------------------------------------------------------------
print("\n--- Generating KALA Zen Set ---")
ft = colorize(ft_base, [20, 20, 24], [58, 58, 68]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [20, 20, 24], [58, 58, 68]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)

d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
cy = 300
d_ft.ellipse([cx - 70, cy - 70, cx + 70, cy + 70], fill=(215, 35, 35, 240))
f_kj = get_font('kanji', 72)
bbox = d_ft.textbbox((0, 0), '力', font=f_kj)
d_ft.text((cx - (bbox[2] - bbox[0]) // 2, cy - (bbox[3] - bbox[1]) // 2 - 8), '力', font=f_kj, fill=(255, 255, 255, 255))
f_zen = get_font('bold', 32)
bbox2 = d_ft.textbbox((0, 0), 'MINDFUL DISCIPLINE', font=f_zen)
d_ft.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, cy + 95), 'MINDFUL DISCIPLINE', font=f_zen, fill=(245, 245, 250, 240))

d_bt = ImageDraw.Draw(bt)
d_bt.ellipse([cx - 150, 200, cx + 150, 500], outline=(215, 35, 35, 220), width=10)
f_kj_lg = get_font('kanji', 110)
bbox_lg = d_bt.textbbox((0, 0), '平和', font=f_kj_lg)
d_bt.text((cx - (bbox_lg[2] - bbox_lg[0]) // 2, 290), '平和', font=f_kj_lg, fill=(255, 255, 255, 255))
f_sub = get_font('impact', 48)
bbox_sub1 = d_bt.textbbox((0, 0), 'PEACE THROUGH STRENGTH', font=f_sub)
d_bt.text(((tee_w - (bbox_sub1[2] - bbox_sub1[0])) // 2, 530), 'PEACE THROUGH STRENGTH', font=f_sub, fill=(245, 245, 250, 255))

pf = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-zen-set_front.png'))
pb = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-zen-set_back.png'))
front_img = assemble_product(ft, pf, is_back=False)
back_img = assemble_product(bt, pb, is_back=True)
save_all(front_img, 'kala-zen-set.png')
save_all(front_img, 'kala-zen-set-front.png')
save_all(back_img, 'kala-zen-set-back.png')

# -------------------------------------------------------------------
# Product 4: kala-tech-set
# Style: Full-length charcoal tech training pants
# Color: Dark charcoal with electric cyan seam accents and bonded zippers
# -------------------------------------------------------------------
print("\n--- Generating KALA Tech Set ---")
ft = colorize(ft_base, [195, 200, 210], [255, 255, 255]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [195, 200, 210], [255, 255, 255]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)

d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
d_ft.rectangle([cx - 160, 240, cx + 160, 330], outline=(40, 45, 55, 255), width=3)
d_ft.rectangle([cx - 150, 250, cx + 150, 254], fill=(0, 180, 216, 255))
f_tch = get_font('impact', 44)
bbox = d_ft.textbbox((0, 0), 'TECH-FIT // 01', font=f_tch)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, 268), 'TECH-FIT // 01', font=f_tch, fill=(30, 35, 45, 255))
f_dry = get_font('bold', 24)
bbox2 = d_ft.textbbox((0, 0), 'ENGINEERED DRY-PRO FABRIC', font=f_dry)
d_ft.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 350), 'ENGINEERED DRY-PRO FABRIC', font=f_dry, fill=(0, 150, 190, 255))

d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('bold', 34)
bbox_b1 = d_bt.textbbox((0, 0), 'ENGINEERED FOR', font=f_b1)
d_bt.text(((tee_w - (bbox_b1[2] - bbox_b1[0])) // 2, 210), 'ENGINEERED FOR', font=f_b1, fill=(50, 55, 65, 255))
f_b2 = get_font('impact', 56)
bbox_b2 = d_bt.textbbox((0, 0), 'PEAK PERFORMANCE', font=f_b2)
d_bt.text(((tee_w - (bbox_b2[2] - bbox_b2[0])) // 2, 260), 'PEAK PERFORMANCE', font=f_b2, fill=(0, 160, 210, 255))
d_bt.line([cx, 340, cx, 660], fill=(0, 160, 210, 255), width=6)
for i in range(5):
    y_l = 380 + i * 55
    d_bt.line([cx - 50, y_l, cx + 50, y_l], fill=(40, 45, 55, 255), width=4)
    d_bt.rectangle([cx - 55, y_l - 4, cx - 45, y_l + 4], fill=(0, 180, 216, 255))
    d_bt.rectangle([cx + 45, y_l - 4, cx + 55, y_l + 4], fill=(0, 180, 216, 255))

pf = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-tech-set_front.png'))
pb = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-tech-set_back.png'))
front_img = assemble_product(ft, pf, is_back=False)
back_img = assemble_product(bt, pb, is_back=True)
save_all(front_img, 'kala-tech-set.png')
save_all(front_img, 'kala-tech-set-front.png')
save_all(back_img, 'kala-tech-set-back.png')

# -------------------------------------------------------------------
# Product 5: kala-purpose-set
# Style: Full-length black performance training pants
# Color: Black with vibrant flame orange/red drawstrings and trims
# -------------------------------------------------------------------
print("\n--- Generating KALA Purpose Set ---")
ft = colorize(ft_base, [18, 18, 20], [50, 50, 55]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [18, 18, 20], [50, 50, 55]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)

d_ft = ImageDraw.Draw(ft)
f_purp = get_font('impact', 52)
bbox = d_ft.textbbox((0, 0), 'PURPOSE', font=f_purp)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, 280), 'PURPOSE', font=f_purp, fill=(255, 60, 30, 255))
d_ft.line([(tee_w - (bbox[2] - bbox[0])) // 2, 345, (tee_w + (bbox[2] - bbox[0])) // 2, 345], fill=(255, 60, 30, 255), width=4)

d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('impact', 52)
bbox1 = d_bt.textbbox((0, 0), 'PAIN IS TEMPORARY', font=f_b1)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 230), 'PAIN IS TEMPORARY', font=f_b1, fill=(245, 245, 250, 255))
cx = tee_w // 2
cy = 380
d_bt.polygon([(cx, cy - 70), (cx + 50, cy + 20), (cx + 25, cy + 60), (cx, cy + 40), (cx - 25, cy + 60), (cx - 50, cy + 20)], fill=(255, 65, 30, 255))
d_bt.polygon([(cx, cy - 40), (cx + 25, cy + 20), (cx + 12, cy + 45), (cx, cy + 30), (cx - 12, cy + 45), (cx - 25, cy + 20)], fill=(255, 180, 20, 255))
bbox2 = d_bt.textbbox((0, 0), 'PURPOSE IS FOREVER', font=f_b1)
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 480), 'PURPOSE IS FOREVER', font=f_b1, fill=(255, 65, 30, 255))

pf = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-purpose-set_front.png'))
pb = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-purpose-set_back.png'))
front_img = assemble_product(ft, pf, is_back=False)
back_img = assemble_product(bt, pb, is_back=True)
save_all(front_img, 'kala-purpose-set.png')
save_all(front_img, 'kala-purpose-set-front.png')
save_all(back_img, 'kala-purpose-set-back.png')

# -------------------------------------------------------------------
# Product 6: kala-focus-set
# Style: Full-length dark teal training pants
# Color: Deep petrol teal with aqua articulated seams
# -------------------------------------------------------------------
print("\n--- Generating KALA Focus Set ---")
ft = colorize(ft_base, [15, 48, 56], [35, 105, 120]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [15, 48, 56], [35, 105, 120]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)

d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
cy = 300
d_ft.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], outline=(255, 255, 255, 230), width=4)
d_ft.line([cx - 70, cy, cx + 70, cy], fill=(255, 255, 255, 230), width=3)
d_ft.line([cx, cy - 70, cx, cy + 70], fill=(255, 255, 255, 230), width=3)
f_fc = get_font('impact', 48)
bbox = d_ft.textbbox((0, 0), '100% FOCUS', font=f_fc)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, cy + 80), '100% FOCUS', font=f_fc, fill=(245, 245, 250, 255))

d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('impact', 54)
bbox1 = d_bt.textbbox((0, 0), 'DISCIPLINE TODAY', font=f_b1)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 260), 'DISCIPLINE TODAY', font=f_b1, fill=(255, 255, 255, 255))
d_bt.rectangle([cx - 100, 345, cx + 100, 350], fill=(0, 230, 200, 255))
bbox2 = d_bt.textbbox((0, 0), 'RESULTS TOMORROW', font=f_b1)
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 380), 'RESULTS TOMORROW', font=f_b1, fill=(0, 230, 200, 255))

pf = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-focus-set_front.png'))
pb = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-focus-set_back.png'))
front_img = assemble_product(ft, pf, is_back=False)
back_img = assemble_product(bt, pb, is_back=True)
save_all(front_img, 'kala-focus-set.png')
save_all(front_img, 'kala-focus-set-front.png')
save_all(back_img, 'kala-focus-set-back.png')

# -------------------------------------------------------------------
# Product 7: kala-progress-set
# Style: Full-length dark charcoal athletic training pants
# Color: Charcoal espresso with stone cream drawstrings and red accents
# -------------------------------------------------------------------
print("\n--- Generating KALA Progress Set ---")
ft = colorize(ft_base, [195, 185, 170], [250, 245, 235]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [195, 185, 170], [250, 245, 235]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)

d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
cy = 300
d_ft.ellipse([cx - 65, cy - 65, cx + 65, cy + 65], fill=(215, 45, 45, 240))
d_ft.arc([cx - 55, cy - 25, cx + 55, cy + 45], 180, 360, fill=(255, 255, 255, 255), width=6)
f_pr = get_font('impact', 50)
bbox = d_ft.textbbox((0, 0), 'PROGRESSION', font=f_pr)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, cy + 90), 'PROGRESSION', font=f_pr, fill=(35, 30, 28, 255))

d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('impact', 56)
bbox1 = d_bt.textbbox((0, 0), 'SMALL STEPS', font=f_b1)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 240), 'SMALL STEPS', font=f_b1, fill=(35, 30, 28, 255))
d_bt.ellipse([cx - 80, 325, cx + 80, 485], outline=(215, 45, 45, 240), width=6)
d_bt.arc([cx - 65, 380, cx + 65, 460], 180, 360, fill=(35, 30, 28, 255), width=8)
bbox2 = d_bt.textbbox((0, 0), 'BIG CHANGES', font=f_b1)
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 520), 'BIG CHANGES', font=f_b1, fill=(215, 45, 45, 255))

pf = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-progress-set_front.png'))
pb = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-progress-set_back.png'))
front_img = assemble_product(ft, pf, is_back=False)
back_img = assemble_product(bt, pb, is_back=True)
save_all(front_img, 'kala-progress-set.png')
save_all(front_img, 'kala-progress-set-front.png')
save_all(back_img, 'kala-progress-set-back.png')

# -------------------------------------------------------------------
# Product 8: kala-chaos-set
# Style: Full-length black performance joggers
# Color: Jet black with neon violet geometric accents
# -------------------------------------------------------------------
print("\n--- Generating KALA Chaos Set ---")
ft = colorize(ft_base, [18, 18, 22], [52, 52, 62]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [18, 18, 22], [52, 52, 62]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)

d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
cy = 280
d_ft.ellipse([cx - 70, cy - 40, cx - 10, cy + 20], fill=(168, 85, 247, 240))
d_ft.ellipse([cx + 10, cy - 40, cx + 70, cy + 20], fill=(168, 85, 247, 240))
d_ft.ellipse([cx - 55, cy + 10, cx - 15, cy + 50], fill=(192, 132, 252, 240))
d_ft.ellipse([cx + 15, cy + 10, cx + 55, cy + 50], fill=(192, 132, 252, 240))
d_ft.line([cx, cy - 45, cx, cy + 55], fill=(255, 255, 255, 255), width=4)
f_ch = get_font('impact', 52)
bbox = d_ft.textbbox((0, 0), 'CHAOS', font=f_ch)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, cy + 75), 'CHAOS', font=f_ch, fill=(192, 132, 252, 255))

d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('impact', 54)
bbox1 = d_bt.textbbox((0, 0), 'CHAOS BREEDS', font=f_b1)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 240), 'CHAOS BREEDS', font=f_b1, fill=(168, 85, 247, 255))
cy_b = 360
for s in [-1, 1]:
    d_bt.polygon([(cx + s * 10, cy_b), (cx + s * 120, cy_b - 50), (cx + s * 140, cy_b), (cx + s * 80, cy_b + 40), (cx + s * 20, cy_b + 20)], fill=(147, 51, 234, 220))
f_b2 = get_font('impact', 58)
bbox2 = d_bt.textbbox((0, 0), 'GROWTH', font=f_b2)
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 440), 'GROWTH', font=f_b2, fill=(255, 255, 255, 255))

pf = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-chaos-set_front.png'))
pb = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-chaos-set_back.png'))
front_img = assemble_product(ft, pf, is_back=False)
back_img = assemble_product(bt, pb, is_back=True)
save_all(front_img, 'kala-chaos-set.png')
save_all(front_img, 'kala-chaos-set-front.png')
save_all(back_img, 'kala-chaos-set-back.png')

# -------------------------------------------------------------------
# Product 9: kala-repeat-set
# Style: Full-length graphite charcoal training pants
# Color: Graphite charcoal with burnt orange chevrons and trims
# -------------------------------------------------------------------
print("\n--- Generating KALA Repeat Set ---")
ft = colorize(ft_base, [140, 145, 150], [225, 230, 235]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [140, 145, 150], [225, 230, 235]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)

d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
cy = 280
for i in range(3):
    y_c = cy - 35 + i * 22
    d_ft.line([(cx - 40, y_c + 15), (cx, y_c), (cx + 40, y_c + 15)], fill=(35, 40, 48, 255), width=5)
f_rp = get_font('impact', 48)
bbox = d_ft.textbbox((0, 0), 'KALA ELITE', font=f_rp)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, cy + 60), 'KALA ELITE', font=f_rp, fill=(35, 40, 48, 255))

d_bt = ImageDraw.Draw(bt)
f_stk = get_font('impact', 52)
stack = [
    ('RUN', (35, 40, 48, 255)),
    ('LIFT', (235, 75, 40, 255)),
    ('IMPROVE', (35, 40, 48, 255)),
    ('REPEAT', (235, 75, 40, 255))
]
y_stk = 210
for text, color in stack:
    bbox = d_bt.textbbox((0, 0), text, font=f_stk)
    d_bt.text(((tee_w - (bbox[2] - bbox[0])) // 2, y_stk), text, font=f_stk, fill=color)
    y_stk += 65

pf = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-repeat-set_front.png'))
pb = Image.open(os.path.join(CLEAN_PANTS_DIR, 'kala-repeat-set_back.png'))
front_img = assemble_product(ft, pf, is_back=False)
back_img = assemble_product(bt, pb, is_back=True)
save_all(front_img, 'kala-repeat-set.png')
save_all(front_img, 'kala-repeat-set-front.png')
save_all(back_img, 'kala-repeat-set-back.png')

print("\nSUCCESS: All 9 flagship Gymwear sets successfully built at 4K (2048x2048) and saved to all 3 destination directories!")
