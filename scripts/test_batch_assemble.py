import os
import numpy as np
from PIL import Image, ImageFilter, ImageFont, ImageDraw

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

ft_base = Image.open('scripts/front_tee_rgba.png')
bt_base = Image.open('scripts/back_tee_rgba.png')
tee_w, tee_h = 760, 880
pw, ph = 540, 1140

def assemble_product(tee_im, pants_cropped, is_back=False):
    pants_scaled = pants_cropped.resize((pw, ph), Image.Resampling.LANCZOS)
    canvas = create_studio_canvas()
    
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

# --- Set 12: Good Mood ---
print("Building Good Mood Set test...")
ft12 = colorize(ft_base, [24, 45, 75], [55, 105, 165]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt12 = colorize(bt_base, [24, 45, 75], [55, 105, 165]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
d_ft12 = ImageDraw.Draw(ft12)
d_ft12.line([tee_w - 230, 220, tee_w - 170, 220], fill=(255, 255, 255, 240), width=4)
d_ft12.rectangle([tee_w - 225, 210, tee_w - 220, 230], fill=(255, 255, 255, 240))
d_ft12.rectangle([tee_w - 180, 210, tee_w - 175, 230], fill=(255, 255, 255, 240))

d_bt12 = ImageDraw.Draw(bt12)
f_main = get_font('impact', 56)
lines = ['GOOD', 'MUSCLES', 'GOOD', 'MOOD']
y_start = 220
for l in lines[:2]:
    bbox = d_bt12.textbbox((0, 0), l, font=f_main)
    d_bt12.text(((tee_w - (bbox[2] - bbox[0])) // 2, y_start), l, font=f_main, fill=(255, 255, 255, 255))
    y_start += 65
cx_b = tee_w // 2
cy_b = y_start + 30
d_bt12.line([cx_b - 120, cy_b, cx_b + 120, cy_b], fill=(255, 255, 255, 255), width=6)
for s in [-1, 1]:
    px_b = cx_b + s * 85
    d_bt12.rectangle([px_b - 8, cy_b - 36, px_b + 8, cy_b + 36], fill=(255, 255, 255, 255))
    d_bt12.rectangle([px_b + s * 14 - 5, cy_b - 28, px_b + s * 14 + 5, cy_b + 28], fill=(255, 255, 255, 255))
y_start += 75
for l in lines[2:]:
    bbox = d_bt12.textbbox((0, 0), l, font=f_main)
    d_bt12.text(((tee_w - (bbox[2] - bbox[0])) // 2, y_start), l, font=f_main, fill=(255, 255, 255, 255))
    y_start += 65

pf12 = Image.open('scripts/clean_pants_v2/kala-good-mood-set_front.png')
pb12 = Image.open('scripts/clean_pants_v2/kala-good-mood-set_back.png')
assemble_product(ft12, pf12, False).save('scripts/test_good_mood_v2_front.png')
assemble_product(bt12, pb12, True).save('scripts/test_good_mood_v2_back.png')

# --- Set 13: Zen Set ---
print("Building Zen Set test...")
ft13 = colorize(ft_base, [20, 20, 24], [58, 58, 68]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt13 = colorize(bt_base, [20, 20, 24], [58, 58, 68]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
d_ft13 = ImageDraw.Draw(ft13)
cx = tee_w // 2
cy = 300
d_ft13.ellipse([cx - 70, cy - 70, cx + 70, cy + 70], fill=(215, 35, 35, 240))
f_kj = get_font('kanji', 72)
bbox = d_ft13.textbbox((0, 0), '力', font=f_kj)
d_ft13.text((cx - (bbox[2] - bbox[0]) // 2, cy - (bbox[3] - bbox[1]) // 2 - 8), '力', font=f_kj, fill=(255, 255, 255, 255))
f_zen = get_font('bold', 32)
bbox2 = d_ft13.textbbox((0, 0), 'MINDFUL DISCIPLINE', font=f_zen)
d_ft13.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, cy + 95), 'MINDFUL DISCIPLINE', font=f_zen, fill=(245, 245, 250, 240))

d_bt13 = ImageDraw.Draw(bt13)
d_bt13.ellipse([cx - 150, 200, cx + 150, 500], outline=(215, 35, 35, 220), width=10)
f_kj_lg = get_font('kanji', 110)
bbox_lg = d_bt13.textbbox((0, 0), '平和', font=f_kj_lg)
d_bt13.text((cx - (bbox_lg[2] - bbox_lg[0]) // 2, 290), '平和', font=f_kj_lg, fill=(255, 255, 255, 255))
f_sub = get_font('impact', 48)
bbox_sub1 = d_bt13.textbbox((0, 0), 'PEACE THROUGH STRENGTH', font=f_sub)
d_bt13.text(((tee_w - (bbox_sub1[2] - bbox_sub1[0])) // 2, 530), 'PEACE THROUGH STRENGTH', font=f_sub, fill=(245, 245, 250, 255))

pf13 = Image.open('scripts/clean_pants_v2/kala-zen-set_front.png')
pb13 = Image.open('scripts/clean_pants_v2/kala-zen-set_back.png')
assemble_product(ft13, pf13, False).save('scripts/test_zen_v2_front.png')
assemble_product(bt13, pb13, True).save('scripts/test_zen_v2_back.png')

# --- Set 14: Tech Set ---
print("Building Tech Set test...")
ft14 = colorize(ft_base, [195, 200, 210], [255, 255, 255]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt14 = colorize(bt_base, [195, 200, 210], [255, 255, 255]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
d_ft14 = ImageDraw.Draw(ft14)
d_ft14.rectangle([cx - 160, 240, cx + 160, 330], outline=(40, 45, 55, 255), width=3)
d_ft14.rectangle([cx - 150, 250, cx + 150, 254], fill=(0, 180, 216, 255))
f_tch = get_font('impact', 44)
bbox = d_ft14.textbbox((0, 0), 'TECH-FIT // 01', font=f_tch)
d_ft14.text(((tee_w - (bbox[2] - bbox[0])) // 2, 268), 'TECH-FIT // 01', font=f_tch, fill=(30, 35, 45, 255))
f_dry = get_font('bold', 24)
bbox2 = d_ft14.textbbox((0, 0), 'ENGINEERED DRY-PRO FABRIC', font=f_dry)
d_ft14.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 350), 'ENGINEERED DRY-PRO FABRIC', font=f_dry, fill=(0, 150, 190, 255))

d_bt14 = ImageDraw.Draw(bt14)
f_b1 = get_font('bold', 34)
bbox_b1 = d_bt14.textbbox((0, 0), 'ENGINEERED FOR', font=f_b1)
d_bt14.text(((tee_w - (bbox_b1[2] - bbox_b1[0])) // 2, 210), 'ENGINEERED FOR', font=f_b1, fill=(50, 55, 65, 255))
f_b2 = get_font('impact', 56)
bbox_b2 = d_bt14.textbbox((0, 0), 'PEAK PERFORMANCE', font=f_b2)
d_bt14.text(((tee_w - (bbox_b2[2] - bbox_b2[0])) // 2, 260), 'PEAK PERFORMANCE', font=f_b2, fill=(0, 160, 210, 255))
d_bt14.line([cx, 340, cx, 660], fill=(0, 160, 210, 255), width=6)
for i in range(5):
    y_l = 380 + i * 55
    d_bt14.line([cx - 50, y_l, cx + 50, y_l], fill=(40, 45, 55, 255), width=4)
    d_bt14.rectangle([cx - 55, y_l - 4, cx - 45, y_l + 4], fill=(0, 180, 216, 255))
    d_bt14.rectangle([cx + 45, y_l - 4, cx + 55, y_l + 4], fill=(0, 180, 216, 255))

pf14 = Image.open('scripts/clean_pants_v2/kala-tech-set_front.png')
pb14 = Image.open('scripts/clean_pants_v2/kala-tech-set_back.png')
assemble_product(ft14, pf14, False).save('scripts/test_tech_v2_front.png')
assemble_product(bt14, pb14, True).save('scripts/test_tech_v2_back.png')

# --- Set 18: Chaos Set ---
print("Building Chaos Set test...")
ft18 = colorize(ft_base, [18, 18, 22], [52, 52, 62]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
bt18 = colorize(bt_base, [18, 18, 22], [52, 52, 62]).resize((tee_w, tee_h), Image.Resampling.LANCZOS)
d_ft18 = ImageDraw.Draw(ft18)
d_ft18.ellipse([cx - 70, cy - 40, cx - 10, cy + 20], fill=(168, 85, 247, 240))
d_ft18.ellipse([cx + 10, cy - 40, cx + 70, cy + 20], fill=(168, 85, 247, 240))
d_ft18.ellipse([cx - 55, cy + 10, cx - 15, cy + 50], fill=(192, 132, 252, 240))
d_ft18.ellipse([cx + 15, cy + 10, cx + 55, cy + 50], fill=(192, 132, 252, 240))
d_ft18.line([cx, cy - 45, cx, cy + 55], fill=(255, 255, 255, 255), width=4)
f_ch = get_font('impact', 52)
bbox = d_ft18.textbbox((0, 0), 'CHAOS', font=f_ch)
d_ft18.text(((tee_w - (bbox[2] - bbox[0])) // 2, cy + 75), 'CHAOS', font=f_ch, fill=(192, 132, 252, 255))

d_bt18 = ImageDraw.Draw(bt18)
f_b1 = get_font('impact', 54)
bbox1 = d_bt18.textbbox((0, 0), 'CHAOS BREEDS', font=f_b1)
d_bt18.text(((tee_w - (bbox1[2] - bbox1[0])) // 2, 240), 'CHAOS BREEDS', font=f_b1, fill=(168, 85, 247, 255))
cy_b = 360
for s in [-1, 1]:
    d_bt18.polygon([(cx + s * 10, cy_b), (cx + s * 120, cy_b - 50), (cx + s * 140, cy_b), (cx + s * 80, cy_b + 40), (cx + s * 20, cy_b + 20)], fill=(147, 51, 234, 220))
f_b2 = get_font('impact', 58)
bbox2 = d_bt18.textbbox((0, 0), 'GROWTH', font=f_b2)
d_bt18.text(((tee_w - (bbox2[2] - bbox2[0])) // 2, 440), 'GROWTH', font=f_b2, fill=(255, 255, 255, 255))

pf18 = Image.open('scripts/clean_pants_v2/kala-chaos-set_front.png')
pb18 = Image.open('scripts/clean_pants_v2/kala-chaos-set_back.png')
assemble_product(ft18, pf18, False).save('scripts/test_chaos_v2_front.png')
assemble_product(bt18, pb18, True).save('scripts/test_chaos_v2_back.png')

print("All test images rendered successfully!")
