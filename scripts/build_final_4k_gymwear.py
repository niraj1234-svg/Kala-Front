import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

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

def save_to_all_destinations(img_2048, filename):
    for d in DEST_DIRS:
        dest_path = os.path.join(d, filename)
        img_2048.save(dest_path, 'PNG', optimize=True)
    print(f"Saved 4K set: {filename}")

# Load base 3D garment templates
ft_base = Image.open(os.path.join(BASE_DIR, 'scripts', 'front_tee_rgba.png'))
bt_base = Image.open(os.path.join(BASE_DIR, 'scripts', 'back_tee_rgba.png'))
pt_base = Image.open(os.path.join(BASE_DIR, 'scripts', 'pants_perfect_rgba.png'))

tee_w, tee_h = 760, 880
pants_w, pants_h = 720, 960

# Process Sets 0 through 10 from the AI-generated 4K images
brain_dir = r'C:\Users\91766\.gemini\antigravity-ide\brain\957b9286-b708-4297-92fb-fd33e026ea6e'
ai_sets = [
    ('kala-apex-compression-set.png', 'kala_apex_compression_set_1791113492803.jpg'),
    ('kala-discipline-set.png', 'kala_discipline_set_1791113520356.jpg'),
    ('kala-oni-training-set.png', 'kala_oni_training_set_1791113553817.jpg'),
    ('kala-grind-mode-set.png', 'kala_grind_mode_set_1791113589100.jpg'),
    ('kala-everyday-set.png', 'kala_everyday_set_1791113623665.jpg'),
    ('kala-evolve-set.png', 'kala_evolve_set_1791113655622.jpg'),
    ('kala-no-limits-set.png', 'kala_no_limits_set_1791113691496.jpg'),
    ('kala-wings-set.png', 'kala_wings_set_1791113732801.jpg'),
    ('kala-relentless-set.png', 'kala_relentless_set_1791113767890.jpg'),
    ('kala-overthink-set.png', 'kala_overthink_set_1791113801184.jpg'),
    ('kala-nature-set.png', 'kala_nature_set_1791113834853.jpg')
]

print("=== Processing AI 4K Photorealistic Sets 0 through 10 ===")
for filename, src_name in ai_sets:
    src_path = os.path.join(brain_dir, src_name)
    im = Image.open(src_path).convert('RGB')
    
    # Clean up bottom caption in Oni training set
    if 'oni' in filename:
        arr = np.array(im)
        # rows 930 to 990 in 1024x1024
        arr[930:990, :, :] = [229, 229, 229]
        im = Image.fromarray(arr)

    # Upscale to 2048x2048 with high-quality Lanczos
    im_4k = im.resize((W, H), Image.Resampling.LANCZOS)
    # Subtle crisp unsharp mask
    im_4k = im_4k.filter(ImageFilter.UnsharpMask(radius=1.5, percent=120, threshold=2))
    save_to_all_destinations(im_4k, filename)

print("\n=== Rendering 3D Procedural Sets 11 through 19 at 4K (2048x2048) ===")

def assemble_3d_set(tee_front, tee_back, pants_front, pants_back):
    canvas = create_studio_canvas()
    shadow_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    positions = [
        (tee_front, 180, 100),
        (pants_front, 200, 970),
        (tee_back, 1108, 100),
        (pants_back, 1128, 970)
    ]
    for im, x, y in positions:
        alpha = im.split()[3]
        sh = Image.new('RGBA', im.size, (20, 25, 30, 80))
        sh.putalpha(alpha)
        shadow_layer.paste(sh, (x + 8, y + 16), sh)

    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(18))
    canvas = Image.alpha_composite(canvas, shadow_layer)

    for im, x, y in positions:
        canvas.paste(im, (x, y), im)
    
    final_rgb = canvas.convert('RGB')
    final_rgb = final_rgb.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=2))
    return final_rgb

def add_drawstrings(draw, pants_w, color=(245, 245, 250, 255)):
    cx = pants_w // 2
    draw.line([(cx - 18, 50), (cx - 15, 155)], fill=color, width=7)
    draw.line([(cx + 18, 50), (cx + 15, 155)], fill=color, width=7)

# -------------------------------------------------------------
# Set 11: kala-iron-mind-set.png
# Jet Black, Iron Mind skull emblem front, Heavy Weights No Excuses back
# -------------------------------------------------------------
print("Rendering Set 11: kala-iron-mind-set.png")
ft = colorize(ft_base, [18, 19, 22], [55, 58, 65]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [18, 19, 22], [55, 58, 65]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
pf = colorize(pt_base, [14, 15, 18], [48, 50, 56]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)
pb = colorize(pt_base, [14, 15, 18], [48, 50, 56]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)

# Front Tee
d_ft = ImageDraw.Draw(ft)
f_im = get_font('impact', 50)
bbox = d_ft.textbbox((0, 0), 'IRON MIND', font=f_im)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, 290), 'IRON MIND', font=f_im, fill=(245, 245, 250, 255))
# Barbell crest on chest
cx_c = tee_w // 2
d_ft.line([cx_c - 60, 360, cx_c + 60, 360], fill=(220, 220, 225, 240), width=4)
for s in [-1, 1]:
    d_ft.rectangle([cx_c + s * 45 - 4, 348, cx_c + s * 45 + 4, 372], fill=(220, 220, 225, 240))
    d_ft.rectangle([cx_c + s * 55 - 3, 352, cx_c + s * 55 + 3, 368], fill=(220, 220, 225, 240))

# Back Tee
d_bt = ImageDraw.Draw(bt)
f_hw = get_font('impact', 58)
bbox1 = d_bt.textbbox((0, 0), 'HEAVY WEIGHTS', font=f_hw)
bbox2 = d_bt.textbbox((0, 0), 'NO EXCUSES', font=f_hw)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 230), 'HEAVY WEIGHTS', font=f_hw, fill=(245, 245, 250, 255))
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 305), 'NO EXCUSES', font=f_hw, fill=(225, 45, 45, 255))
# Spine line graphic
for i in range(7):
    y_sp = 390 + i * 40
    w_sp = 50 - abs(i - 3) * 6
    d_bt.rectangle([cx_c - w_sp, y_sp, cx_c + w_sp, y_sp + 14], fill=(240, 240, 245, 220))

# Pants
d_pf = ImageDraw.Draw(pf)
add_drawstrings(d_pf, pants_w)
f_pt = get_font('impact', 30)
d_pf.text((120, 240), 'IRON', font=f_pt, fill=(230, 230, 235, 200))

set11_img = assemble_3d_set(ft, bt, pf, pb)
save_to_all_destinations(set11_img, 'kala-iron-mind-set.png')

# -------------------------------------------------------------
# Set 12: kala-good-mood-set.png
# Indigo Denim Blue, Good Muscles Good Mood barbell
# -------------------------------------------------------------
print("Rendering Set 12: kala-good-mood-set.png")
ft = colorize(ft_base, [24, 45, 75], [55, 105, 165]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [24, 45, 75], [55, 105, 165]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
pf = colorize(pt_base, [20, 38, 62], [45, 85, 138]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)
pb = colorize(pt_base, [20, 38, 62], [45, 85, 138]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)

# Front Tee
d_ft = ImageDraw.Draw(ft)
d_ft.line([tee_w - 230, 220, tee_w - 170, 220], fill=(255, 255, 255, 240), width=4)
d_ft.rectangle([tee_w - 225, 210, tee_w - 220, 230], fill=(255, 255, 255, 240))
d_ft.rectangle([tee_w - 180, 210, tee_w - 175, 230], fill=(255, 255, 255, 240))

# Back Tee: GOOD MUSCLES GOOD MOOD + Barbell
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
    px = cx_b + s * 85
    d_bt.rectangle([px - 8, cy_b - 36, px + 8, cy_b + 36], fill=(255, 255, 255, 255))
    d_bt.rectangle([px + s * 14 - 5, cy_b - 28, px + s * 14 + 5, cy_b + 28], fill=(255, 255, 255, 255))
y_start += 75

for l in lines[2:]:
    bbox = d_bt.textbbox((0, 0), l, font=f_main)
    d_bt.text(((tee_w - (bbox[2] - bbox[0])) // 2, y_start), l, font=f_main, fill=(255, 255, 255, 255))
    y_start += 65

# Pants
d_pf = ImageDraw.Draw(pf)
add_drawstrings(d_pf, pants_w)

set12_img = assemble_3d_set(ft, bt, pf, pb)
save_to_all_destinations(set12_img, 'kala-good-mood-set.png')

# -------------------------------------------------------------
# Set 13: kala-zen-set.png
# Midnight Charcoal, Japanese Red Sun + Kanji 平和 & 力, Mindful Discipline
# -------------------------------------------------------------
print("Rendering Set 13: kala-zen-set.png")
ft = colorize(ft_base, [20, 20, 24], [58, 58, 68]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [20, 20, 24], [58, 58, 68]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
pf = colorize(pt_base, [16, 16, 20], [50, 50, 60]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)
pb = colorize(pt_base, [16, 16, 20], [50, 50, 60]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)

# Front Tee: Red Sun + Kanji 力
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

# Back Tee: Large Japanese Calligraphy & Circle motif
d_bt = ImageDraw.Draw(bt)
d_bt.ellipse([cx - 150, 200, cx + 150, 500], outline=(215, 35, 35, 220), width=10)
f_kj_lg = get_font('kanji', 110)
bbox_lg = d_bt.textbbox((0, 0), '平和', font=f_kj_lg)
d_bt.text((cx - (bbox_lg[2] - bbox_lg[0]) // 2, 290), '平和', font=f_kj_lg, fill=(255, 255, 255, 255))

f_sub = get_font('impact', 48)
bbox_sub1 = d_bt.textbbox((0, 0), 'PEACE THROUGH STRENGTH', font=f_sub)
d_bt.text(((tee_w - (bbox_sub1[2] - bbox_sub1[0])) // 2, 530), 'PEACE THROUGH STRENGTH', font=f_sub, fill=(245, 245, 250, 255))

# Pants: Red drawstrings
d_pf = ImageDraw.Draw(pf)
add_drawstrings(d_pf, pants_w, color=(215, 35, 35, 255))
d_pf.text((120, 240), '力', font=get_font('kanji', 42), fill=(215, 35, 35, 230))

set13_img = assemble_3d_set(ft, bt, pf, pb)
save_to_all_destinations(set13_img, 'kala-zen-set.png')

# -------------------------------------------------------------
# Set 14: kala-tech-set.png
# Platinum White Tee, Slate Grey Pants, Tech panels & Peak Performance
# -------------------------------------------------------------
print("Rendering Set 14: kala-tech-set.png")
ft = colorize(ft_base, [195, 200, 210], [255, 255, 255]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [195, 200, 210], [255, 255, 255]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
pf = colorize(pt_base, [32, 38, 46], [72, 82, 98]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)
pb = colorize(pt_base, [32, 38, 46], [72, 82, 98]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)

# Front Tee: Tech chest panels & cyan accent
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

# Back Tee: Cyber Spine Telemetry
d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('bold', 34)
bbox_b1 = d_bt.textbbox((0, 0), 'ENGINEERED FOR', font=f_b1)
d_bt.text(((tee_w - (bbox_b1[2] - bbox_b1[0])) // 2, 210), 'ENGINEERED FOR', font=f_b1, fill=(50, 55, 65, 255))

f_b2 = get_font('impact', 56)
bbox_b2 = d_bt.textbbox((0, 0), 'PEAK PERFORMANCE', font=f_b2)
d_bt.text(((tee_w - (bbox_b2[2] - bbox_b2[0])) // 2, 260), 'PEAK PERFORMANCE', font=f_b2, fill=(0, 160, 210, 255))

# Vertical circuit spine
d_bt.line([cx, 340, cx, 660], fill=(0, 160, 210, 255), width=6)
for i in range(5):
    y_l = 380 + i * 55
    d_bt.line([cx - 50, y_l, cx + 50, y_l], fill=(40, 45, 55, 255), width=4)
    d_bt.rectangle([cx - 55, y_l - 4, cx - 45, y_l + 4], fill=(0, 180, 216, 255))
    d_bt.rectangle([cx + 45, y_l - 4, cx + 55, y_l + 4], fill=(0, 180, 216, 255))

# Pants: Cyan stripes
d_pf = ImageDraw.Draw(pf)
add_drawstrings(d_pf, pants_w, color=(245, 245, 250, 255))
d_pf.line([130, 220, 130, 520], fill=(0, 180, 216, 230), width=6)

set14_img = assemble_3d_set(ft, bt, pf, pb)
save_to_all_destinations(set14_img, 'kala-tech-set.png')

# -------------------------------------------------------------
# Set 15: kala-purpose-set.png
# Obsidian Black, Crimson Flame emblem, Pain is Temporary Purpose is Forever
# -------------------------------------------------------------
print("Rendering Set 15: kala-purpose-set.png")
ft = colorize(ft_base, [18, 18, 20], [50, 50, 55]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [18, 18, 20], [50, 50, 55]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
pf = colorize(pt_base, [14, 14, 16], [45, 45, 50]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)
pb = colorize(pt_base, [14, 14, 16], [45, 45, 50]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)

# Front Tee
d_ft = ImageDraw.Draw(ft)
f_purp = get_font('impact', 52)
bbox = d_ft.textbbox((0, 0), 'PURPOSE', font=f_purp)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, 280), 'PURPOSE', font=f_purp, fill=(255, 60, 30, 255))
d_ft.line([(tee_w - (bbox[2] - bbox[0])) // 2, 345, (tee_w + (bbox[2] - bbox[0])) // 2, 345], fill=(255, 60, 30, 255), width=4)

# Back Tee
d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('impact', 52)
bbox1 = d_bt.textbbox((0, 0), 'PAIN IS TEMPORARY', font=f_b1)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 230), 'PAIN IS TEMPORARY', font=f_b1, fill=(245, 245, 250, 255))

# Flame symbol in middle
cx = tee_w // 2
cy = 380
d_bt.polygon([(cx, cy - 70), (cx + 50, cy + 20), (cx + 25, cy + 60), (cx, cy + 40), (cx - 25, cy + 60), (cx - 50, cy + 20)], fill=(255, 65, 30, 255))
d_bt.polygon([(cx, cy - 40), (cx + 25, cy + 20), (cx + 12, cy + 45), (cx, cy + 30), (cx - 12, cy + 45), (cx - 25, cy + 20)], fill=(255, 180, 20, 255))

bbox2 = d_bt.textbbox((0, 0), 'PURPOSE IS FOREVER', font=f_b1)
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 480), 'PURPOSE IS FOREVER', font=f_b1, fill=(255, 65, 30, 255))

# Pants: Red drawstrings
d_pf = ImageDraw.Draw(pf)
add_drawstrings(d_pf, pants_w, color=(235, 50, 30, 255))
# Flame slash on right thigh
d_pf.polygon([(pants_w - 140, 240), (pants_w - 110, 270), (pants_w - 130, 340), (pants_w - 150, 280)], fill=(255, 65, 30, 220))

set15_img = assemble_3d_set(ft, bt, pf, pb)
save_to_all_destinations(set15_img, 'kala-purpose-set.png')

# -------------------------------------------------------------
# Set 16: kala-focus-set.png
# Deep Petrol Teal Blue, Crosshair target, Discipline Today Results Tomorrow
# -------------------------------------------------------------
print("Rendering Set 16: kala-focus-set.png")
ft = colorize(ft_base, [15, 48, 56], [35, 105, 120]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [15, 48, 56], [35, 105, 120]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
pf = colorize(pt_base, [12, 38, 45], [28, 80, 92]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)
pb = colorize(pt_base, [12, 38, 45], [28, 80, 92]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)

# Front Tee: Target reticle
d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
cy = 300
d_ft.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], outline=(255, 255, 255, 230), width=4)
d_ft.line([cx - 70, cy, cx + 70, cy], fill=(255, 255, 255, 230), width=3)
d_ft.line([cx, cy - 70, cx, cy + 70], fill=(255, 255, 255, 230), width=3)
f_fc = get_font('impact', 48)
bbox = d_ft.textbbox((0, 0), '100% FOCUS', font=f_fc)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, cy + 80), '100% FOCUS', font=f_fc, fill=(245, 245, 250, 255))

# Back Tee: Discipline Today Results Tomorrow
d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('impact', 54)
bbox1 = d_bt.textbbox((0, 0), 'DISCIPLINE TODAY', font=f_b1)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 260), 'DISCIPLINE TODAY', font=f_b1, fill=(255, 255, 255, 255))

d_bt.rectangle([cx - 100, 345, cx + 100, 350], fill=(0, 230, 200, 255))

bbox2 = d_bt.textbbox((0, 0), 'RESULTS TOMORROW', font=f_b1)
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 380), 'RESULTS TOMORROW', font=f_b1, fill=(0, 230, 200, 255))

# Pants
d_pf = ImageDraw.Draw(pf)
add_drawstrings(d_pf, pants_w, color=(245, 245, 250, 255))
d_pf.rectangle([pants_w - 150, 230, pants_w - 110, 238], fill=(0, 230, 200, 230))

set16_img = assemble_3d_set(ft, bt, pf, pb)
save_to_all_destinations(set16_img, 'kala-focus-set.png')

# -------------------------------------------------------------
# Set 17: kala-progress-set.png
# Vintage Stone Cream Tee, Deep Espresso Pants, Wave & Small Steps Big Changes
# -------------------------------------------------------------
print("Rendering Set 17: kala-progress-set.png")
ft = colorize(ft_base, [195, 185, 170], [250, 245, 235]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [195, 185, 170], [250, 245, 235]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
pf = colorize(pt_base, [28, 26, 25], [60, 55, 52]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)
pb = colorize(pt_base, [28, 26, 25], [60, 55, 52]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)

# Front Tee: Sun & Wave
d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
cy = 300
d_ft.ellipse([cx - 65, cy - 65, cx + 65, cy + 65], fill=(215, 45, 45, 240))
# Wave white arc
d_ft.arc([cx - 55, cy - 25, cx + 55, cy + 45], 180, 360, fill=(255, 255, 255, 255), width=6)
f_pr = get_font('impact', 50)
bbox = d_ft.textbbox((0, 0), 'PROGRESSION', font=f_pr)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, cy + 90), 'PROGRESSION', font=f_pr, fill=(35, 30, 28, 255))

# Back Tee: Small Steps Big Changes
d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('impact', 56)
bbox1 = d_bt.textbbox((0, 0), 'SMALL STEPS', font=f_b1)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 240), 'SMALL STEPS', font=f_b1, fill=(35, 30, 28, 255))

d_bt.ellipse([cx - 80, 325, cx + 80, 485], outline=(215, 45, 45, 240), width=6)
d_bt.arc([cx - 65, 380, cx + 65, 460], 180, 360, fill=(35, 30, 28, 255), width=8)

bbox2 = d_bt.textbbox((0, 0), 'BIG CHANGES', font=f_b1)
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 520), 'BIG CHANGES', font=f_b1, fill=(215, 45, 45, 255))

# Pants: Stone cream drawstrings
d_pf = ImageDraw.Draw(pf)
add_drawstrings(d_pf, pants_w, color=(240, 235, 225, 255))

set17_img = assemble_3d_set(ft, bt, pf, pb)
save_to_all_destinations(set17_img, 'kala-progress-set.png')

# -------------------------------------------------------------
# Set 18: kala-chaos-set.png
# Jet Black, Cyberpunk Violet Butterfly, Chaos Breeds Growth
# -------------------------------------------------------------
print("Rendering Set 18: kala-chaos-set.png")
ft = colorize(ft_base, [18, 18, 22], [52, 52, 62]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [18, 18, 22], [52, 52, 62]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
pf = colorize(pt_base, [14, 14, 18], [45, 45, 55]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)
pb = colorize(pt_base, [14, 14, 18], [45, 45, 55]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)

# Front Tee: Neon purple butterfly
d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
cy = 280
# Butterfly wings
d_ft.ellipse([cx - 70, cy - 40, cx - 10, cy + 20], fill=(168, 85, 247, 240))
d_ft.ellipse([cx + 10, cy - 40, cx + 70, cy + 20], fill=(168, 85, 247, 240))
d_ft.ellipse([cx - 55, cy + 10, cx - 15, cy + 50], fill=(192, 132, 252, 240))
d_ft.ellipse([cx + 15, cy + 10, cx + 55, cy + 50], fill=(192, 132, 252, 240))
d_ft.line([cx, cy - 45, cx, cy + 55], fill=(255, 255, 255, 255), width=4)

f_ch = get_font('impact', 52)
bbox = d_ft.textbbox((0, 0), 'CHAOS', font=f_ch)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, cy + 75), 'CHAOS', font=f_ch, fill=(192, 132, 252, 255))

# Back Tee: Chaos Breeds Growth
d_bt = ImageDraw.Draw(bt)
f_b1 = get_font('impact', 54)
bbox1 = d_bt.textbbox((0, 0), 'CHAOS BREEDS', font=f_b1)
d_bt.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 240), 'CHAOS BREEDS', font=f_b1, fill=(168, 85, 247, 255))

# Cyber fractal wings
cy_b = 360
for s in [-1, 1]:
    d_bt.polygon([
        (cx + s * 10, cy_b),
        (cx + s * 120, cy_b - 50),
        (cx + s * 140, cy_b),
        (cx + s * 80, cy_b + 40),
        (cx + s * 20, cy_b + 20)
    ], fill=(147, 51, 234, 220))

f_b2 = get_font('impact', 58)
bbox2 = d_bt.textbbox((0, 0), 'GROWTH', font=f_b2)
d_bt.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 440), 'GROWTH', font=f_b2, fill=(255, 255, 255, 255))

# Pants: Neon purple drawstrings
d_pf = ImageDraw.Draw(pf)
add_drawstrings(d_pf, pants_w, color=(168, 85, 247, 255))
d_pf.polygon([(110, 240), (140, 270), (120, 330), (95, 280)], fill=(168, 85, 247, 220))

set18_img = assemble_3d_set(ft, bt, pf, pb)
save_to_all_destinations(set18_img, 'kala-chaos-set.png')

# -------------------------------------------------------------
# Set 19: kala-repeat-set.png
# Athletic Heather Grey Tee, Heather Charcoal Pants, Quad Chevrons Run Lift Improve Repeat
# -------------------------------------------------------------
print("Rendering Set 19: kala-repeat-set.png")
ft = colorize(ft_base, [140, 145, 150], [225, 230, 235]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt = colorize(bt_base, [140, 145, 150], [225, 230, 235]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
pf = colorize(pt_base, [38, 40, 45], [85, 90, 100]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)
pb = colorize(pt_base, [38, 40, 45], [85, 90, 100]).resize((pants_w, pants_h), Image.Resampling.LANCZOS)

# Front Tee: Chevrons & Kala Elite
d_ft = ImageDraw.Draw(ft)
cx = tee_w // 2
cy = 280
for i in range(3):
    y_c = cy - 35 + i * 22
    d_ft.line([(cx - 40, y_c + 15), (cx, y_c), (cx + 40, y_c + 15)], fill=(35, 40, 48, 255), width=5)

f_rp = get_font('impact', 48)
bbox = d_ft.textbbox((0, 0), 'KALA ELITE', font=f_rp)
d_ft.text(((tee_w - (bbox[2] - bbox[0])) // 2, cy + 60), 'KALA ELITE', font=f_rp, fill=(35, 40, 48, 255))

# Back Tee: Quad stack RUN // LIFT // IMPROVE // REPEAT
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

# Pants: White drawstrings + chevrons
d_pf = ImageDraw.Draw(pf)
add_drawstrings(d_pf, pants_w, color=(245, 245, 250, 255))
for i in range(3):
    y_c = 250 + i * 25
    d_pf.line([(120, y_c + 12), (145, y_c), (170, y_c + 12)], fill=(235, 75, 40, 230), width=4)

set19_img = assemble_3d_set(ft, bt, pf, pb)
save_to_all_destinations(set19_img, 'kala-repeat-set.png')

print("\nSUCCESS: All 20 gymwear 4K sets generated and saved to all destination directories!")
