import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cv2

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST_DIRS = [
    os.path.join(BASE_DIR, 'client', 'images'),
    os.path.join(BASE_DIR, 'client', 'public', 'images'),
    os.path.join(BASE_DIR, 'client', 'public', 'products')
]
for d in DEST_DIRS:
    os.makedirs(d, exist_ok=True)

W, H = 2048, 2048
CX_LEFT = 540
CX_RIGHT = 1508
TOP_Y = 200
WAIST_Y = 1000

# Fonts
FONTS_DIR = 'C:/Windows/Fonts'
def get_font(name, size):
    font_map = {
        'impact': os.path.join(FONTS_DIR, 'impact.ttf'),
        'arial_bold': os.path.join(FONTS_DIR, 'arialbd.ttf'),
        'arial': os.path.join(FONTS_DIR, 'arial.ttf'),
        'rock_bold': os.path.join(FONTS_DIR, 'ROCKB.TTF'),
        'georgia_bold': os.path.join(FONTS_DIR, 'georgiab.ttf'),
        'japanese_bold': os.path.join(FONTS_DIR, 'YuGothB.ttc'),
    }
    path = font_map.get(name, font_map['arial_bold'])
    if os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

def draw_spaced_text(draw, text, y, font, fill, center_x, spacing=4):
    char_widths = []
    for ch in text:
        bbox = draw.textbbox((0, 0), ch, font=font)
        char_widths.append(bbox[2] - bbox[0])
    total_w = sum(char_widths) + max(0, len(text) - 1) * spacing
    start_x = center_x - total_w // 2
    curr_x = start_x
    for i, ch in enumerate(text):
        draw.text((curr_x, y), ch, font=font, fill=fill)
        curr_x += char_widths[i] + spacing
    bbox_all = draw.textbbox((0, 0), text, font=font)
    return bbox_all[3] - bbox_all[1]

def draw_vertical_text(draw, text, x, y_start, font, fill, spacing=16):
    curr_y = y_start
    for ch in text:
        bbox = draw.textbbox((0, 0), ch, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        draw.text((x - w // 2, curr_y), ch, font=font, fill=fill)
        curr_y += h + spacing
    return curr_y

def get_shirt_pts(cx, top_y, is_back=False):
    neck_drop = 30 if is_back else 80
    return [
        (cx - 95, top_y + 10),
        (cx - 295, top_y + 105),
        (cx - 380, top_y + 285),
        (cx - 280, top_y + 345),
        (cx - 240, top_y + 305),
        (cx - 230, top_y + 740),
        (cx + 230, top_y + 740),
        (cx + 240, top_y + 305),
        (cx + 280, top_y + 345),
        (cx + 380, top_y + 285),
        (cx + 295, top_y + 105),
        (cx + 95, top_y + 10),
        (cx, top_y + neck_drop)
    ]

def get_pants_pts(cx, waist_y):
    return [
        (cx - 215, waist_y),
        (cx - 245, waist_y + 180),
        (cx - 180, waist_y + 880),
        (cx - 85, waist_y + 880),
        (cx - 15, waist_y + 340),
        (cx + 15, waist_y + 340),
        (cx + 85, waist_y + 880),
        (cx + 180, waist_y + 880),
        (cx + 245, waist_y + 180),
        (cx + 215, waist_y),
    ]

def create_studio_background():
    bg = np.zeros((H, W, 3), dtype=np.float32)
    for y in range(H):
        t = y / H
        c = 228 - t * 45
        bg[y, :] = [c, c - 2, c - 4]
    y_coords, x_coords = np.ogrid[:H, :W]
    spot = np.exp(-((x_coords - 1024)**2 + (y_coords - 550)**2) / (2 * 800**2)) * 32
    bg = np.clip(bg + spot[:, :, np.newaxis], 0, 255).astype(np.uint8)
    return Image.fromarray(bg).convert('RGBA')

def draw_barbell(draw, cx, cy, w=240, color=(240, 240, 245, 255)):
    # Bar
    draw.rectangle([cx - w//2, cy - 4, cx + w//2, cy + 4], fill=color)
    # Outer collar stops
    draw.rectangle([cx - w//2 + 40, cy - 10, cx - w//2 + 48, cy + 10], fill=color)
    draw.rectangle([cx + w//2 - 48, cy - 10, cx + w//2 - 40, cy + 10], fill=color)
    # Heavy 45lb plates
    draw.rectangle([cx - w//2 + 10, cy - 35, cx - w//2 + 30, cy + 35], fill=color)
    draw.rectangle([cx - w//2 + 32, cy - 28, cx - w//2 + 40, cy + 28], fill=color)
    draw.rectangle([cx + w//2 - 30, cy - 35, cx + w//2 - 10, cy + 35], fill=color)
    draw.rectangle([cx + w//2 - 40, cy - 28, cx + w//2 - 32, cy + 28], fill=color)

def make_gymwear_base(top_color, pants_color, collar_color=None, stripe_color=None, has_stripe=True):
    base_im = create_studio_background()
    
    # 1. Soft realistic drop shadows
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    for cx in [CX_LEFT, CX_RIGHT]:
        s_draw.polygon([(x + 14, y + 32) for x, y in get_shirt_pts(cx, TOP_Y)], fill=(12, 12, 16, 95))
        s_draw.polygon([(x + 14, y + 36) for x, y in get_pants_pts(cx, WAIST_Y)], fill=(12, 12, 16, 100))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    base_im = Image.alpha_composite(base_im, shadow)
    
    # 2. Garment Layer
    garment = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(garment)
    
    t_fill = tuple(top_color) if len(top_color) == 4 else tuple(top_color) + (255,)
    p_fill = tuple(pants_color) if len(pants_color) == 4 else tuple(pants_color) + (255,)
    col_fill = tuple(collar_color) if collar_color else tuple([min(255, c + 35) for c in top_color[:3]]) + (255,)
    
    for cx, is_back in [(CX_LEFT, False), (CX_RIGHT, True)]:
        # Draw Shirt
        s_pts = get_shirt_pts(cx, TOP_Y, is_back)
        draw.polygon(s_pts, fill=t_fill)
        
        # Raglan seam lines
        seam_color = tuple([max(0, c - 30) for c in top_color[:3]]) + (200,)
        draw.line([(cx - 95, TOP_Y + 10), (cx - 240, TOP_Y + 305)], fill=seam_color, width=4)
        draw.line([(cx + 95, TOP_Y + 10), (cx + 240, TOP_Y + 305)], fill=seam_color, width=4)
        
        # Collar
        if not is_back:
            draw.arc([cx - 95, TOP_Y - 5, cx + 95, TOP_Y + 95], 0, 180, fill=col_fill, width=14)
        else:
            draw.arc([cx - 95, TOP_Y - 5, cx + 95, TOP_Y + 45], 0, 180, fill=col_fill, width=12)
            
        # Draw Pants
        p_pts = get_pants_pts(cx, WAIST_Y)
        draw.polygon(p_pts, fill=p_fill)
        
        # Pants side stripes
        if has_stripe and stripe_color:
            str_col = tuple(stripe_color) if len(stripe_color) == 4 else tuple(stripe_color) + (255,)
            # Left leg outer stripe
            draw.line([(cx - 215, WAIST_Y + 50), (cx - 245, WAIST_Y + 180), (cx - 180, WAIST_Y + 880)], fill=str_col, width=12)
            # Right leg outer stripe
            draw.line([(cx + 215, WAIST_Y + 50), (cx + 245, WAIST_Y + 180), (cx + 180, WAIST_Y + 880)], fill=str_col, width=12)
            
        # Waistband
        wb_color = tuple([max(0, c - 15) for c in pants_color[:3]]) + (255,)
        draw.rectangle([cx - 215, WAIST_Y, cx + 215, WAIST_Y + 55], fill=wb_color)
        draw.line([cx - 215, WAIST_Y, cx + 215, WAIST_Y], fill=tuple([min(255, c + 35) for c in pants_color[:3]]) + (200,), width=3)
        draw.line([cx - 215, WAIST_Y + 55, cx + 215, WAIST_Y + 55], fill=tuple([max(0, c - 30) for c in pants_color[:3]]) + (200,), width=3)
        for ry in [WAIST_Y + 16, WAIST_Y + 32, WAIST_Y + 46]:
            draw.line([cx - 210, ry, cx + 210, ry], fill=tuple([max(0, c - 20) for c in pants_color[:3]]) + (180,), width=2)
            
        # Crotch & Inseam
        p_seam = tuple([max(0, c - 35) for c in pants_color[:3]]) + (220,)
        draw.line([(cx, WAIST_Y + 55), (cx, WAIST_Y + 340)], fill=p_seam, width=4)
        draw.line([(cx, WAIST_Y + 340), (cx - 85, WAIST_Y + 880)], fill=p_seam, width=3)
        draw.line([(cx, WAIST_Y + 340), (cx + 85, WAIST_Y + 880)], fill=p_seam, width=3)
        
        # Ribbed Ankle Cuffs
        cuff_col = tuple([max(0, c - 20) for c in pants_color[:3]]) + (255,)
        draw.rectangle([cx - 180, WAIST_Y + 835, cx - 85, WAIST_Y + 880], fill=cuff_col)
        draw.rectangle([cx + 85, WAIST_Y + 835, cx + 180, WAIST_Y + 880], fill=cuff_col)
        
        # Front Drawstrings
        if not is_back:
            draw.ellipse([cx - 22, WAIST_Y + 16, cx - 12, WAIST_Y + 26], fill=(220, 220, 225, 255))
            draw.ellipse([cx + 12, WAIST_Y + 16, cx + 22, WAIST_Y + 26], fill=(220, 220, 225, 255))
            # Left string
            draw.line([(cx - 17, WAIST_Y + 26), (cx - 28, WAIST_Y + 100), (cx - 18, WAIST_Y + 160)], fill=(245, 245, 250, 255), width=6)
            draw.rectangle([cx - 21, WAIST_Y + 155, cx - 15, WAIST_Y + 172], fill=(210, 35, 35, 255))
            # Right string
            draw.line([(cx + 17, WAIST_Y + 26), (cx + 28, WAIST_Y + 95), (cx + 20, WAIST_Y + 165)], fill=(245, 245, 250, 255), width=6)
            draw.rectangle([cx + 17, WAIST_Y + 160, cx + 23, WAIST_Y + 177], fill=(210, 35, 35, 255))
            
    base_im = Image.alpha_composite(base_im, garment)
    return base_im

def save_4k_gymwear(im, filename):
    rgb = im.convert('RGB')
    for d in DEST_DIRS:
        dest = os.path.join(d, filename)
        rgb.save(dest, 'PNG', optimize=True)
    print(f'[SUCCESS 4K] Rendered {filename}')

# =========================================================================
# 20 Individual 4K Graphic Renderers
# =========================================================================

# 1. KALA Apex Compression Set
def render_apex():
    im = make_gymwear_base([22, 22, 26], [18, 18, 22], stripe_color=[240, 240, 245])
    draw = ImageDraw.Draw(im)
    f_logo = get_font('impact', 68)
    f_tech = get_font('arial_bold', 28)
    # Front tech lines
    draw.line([(CX_LEFT - 120, 420), (CX_LEFT, 500), (CX_LEFT + 120, 420)], fill=(240, 240, 245, 240), width=6)
    draw.line([(CX_LEFT - 140, 480), (CX_LEFT, 560), (CX_LEFT + 140, 480)], fill=(240, 240, 245, 200), width=4)
    draw.text((CX_LEFT - 15, 370), 'V', font=f_logo, fill=(255, 255, 255, 255))
    # Back tech spine & XELA / KALA
    draw.line([(CX_RIGHT, 360), (CX_RIGHT, 680)], fill=(240, 240, 245, 240), width=6)
    for dy in [420, 500, 580]:
        draw.line([(CX_RIGHT - 70, dy - 20), (CX_RIGHT, dy), (CX_RIGHT + 70, dy - 20)], fill=(240, 240, 245, 200), width=4)
    draw_spaced_text(draw, 'KALA', 720, f_logo, (255, 255, 255, 255), CX_RIGHT, spacing=8)
    # Pants aerodynamic slashes
    for cx in [CX_LEFT, CX_RIGHT]:
        draw.line([(cx - 160, WAIST_Y + 220), (cx - 100, WAIST_Y + 340)], fill=(240, 240, 245, 240), width=6)
        draw.line([(cx + 160, WAIST_Y + 220), (cx + 100, WAIST_Y + 340)], fill=(240, 240, 245, 240), width=6)
    save_4k_gymwear(im, 'kala-apex-compression-set.png')

# 2. KALA Discipline Set
def render_discipline():
    im = make_gymwear_base([248, 248, 250], [245, 245, 248], collar_color=[220, 220, 225], stripe_color=[24, 24, 28])
    draw = ImageDraw.Draw(im)
    f_disp = get_font('impact', 54)
    f_sub = get_font('arial_bold', 24)
    f_kala = get_font('impact', 76)
    # Front Discipline
    draw_spaced_text(draw, 'DISCIPLINE', 430, f_disp, (20, 20, 25, 255), CX_LEFT, spacing=4)
    draw_spaced_text(draw, 'BUILDS FREEDOM', 495, f_sub, (40, 40, 45, 255), CX_LEFT, spacing=6)
    draw_barbell(draw, CX_LEFT, 560, w=220, color=(20, 20, 25, 255))
    # Back KALA
    draw_spaced_text(draw, 'KALA', 460, f_kala, (20, 20, 25, 255), CX_RIGHT, spacing=14)
    draw_spaced_text(draw, 'PRO ATHLETICS', 555, f_sub, (60, 60, 65, 240), CX_RIGHT, spacing=6)
    # Pants KALA logo on left thigh
    draw.text((CX_LEFT - 170, WAIST_Y + 240), 'KALA', font=get_font('impact', 38), fill=(20, 20, 25, 255))
    save_4k_gymwear(im, 'kala-discipline-set.png')

# 3. KALA Oni Training Set
def render_oni():
    im = make_gymwear_base([22, 22, 26], [18, 18, 22], stripe_color=[220, 35, 35])
    draw = ImageDraw.Draw(im)
    f_kanji = get_font('japanese_bold', 120)
    f_sub = get_font('arial_bold', 24)
    f_bold = get_font('impact', 32)
    # Front Oni Mask Artwork
    cx, cy = CX_LEFT, 520
    # Horns
    draw.polygon([(cx - 70, cy - 60), (cx - 100, cy - 150), (cx - 40, cy - 90)], fill=(225, 35, 35, 255))
    draw.polygon([(cx + 70, cy - 60), (cx + 100, cy - 150), (cx + 40, cy - 90)], fill=(225, 35, 35, 255))
    # Mask Face
    draw.ellipse([cx - 85, cy - 80, cx + 85, cy + 90], fill=(230, 230, 235, 255))
    # Fierce Eyes
    draw.polygon([(cx - 65, cy - 10), (cx - 20, cy), (cx - 55, cy + 15)], fill=(225, 35, 35, 255))
    draw.polygon([(cx + 65, cy - 10), (cx + 20, cy), (cx + 55, cy + 15)], fill=(225, 35, 35, 255))
    # Grinning Teeth
    draw.rectangle([cx - 50, cy + 40, cx + 50, cy + 65], fill=(20, 20, 24, 255))
    for tx in range(cx - 40, cx + 45, 16):
        draw.polygon([(tx, cy + 40), (tx + 6, cy + 55), (tx + 12, cy + 40)], fill=(245, 245, 250, 255))
        draw.polygon([(tx, cy + 65), (tx + 6, cy + 50), (tx + 12, cy + 65)], fill=(245, 245, 250, 255))
    # Back Kanji: 力 (Strength)
    draw.text((CX_RIGHT - 60, 360), '力', font=f_kanji, fill=(225, 35, 35, 255))
    draw_spaced_text(draw, 'STRENGTH', 510, f_bold, (245, 245, 250, 255), CX_RIGHT, spacing=4)
    draw_spaced_text(draw, 'FOCUS', 555, f_bold, (245, 245, 250, 255), CX_RIGHT, spacing=4)
    draw_spaced_text(draw, 'DISCIPLINE', 600, f_bold, (225, 35, 35, 255), CX_RIGHT, spacing=4)
    # Pants vertical Kanji on thigh
    draw_vertical_text(draw, '力美勝', CX_LEFT + 120, WAIST_Y + 220, get_font('japanese_bold', 42), (225, 35, 35, 255), spacing=12)
    save_4k_gymwear(im, 'kala-oni-training-set.png')

# 4. KALA Grind Mode Set
def render_grind_mode():
    im = make_gymwear_base([58, 68, 48], [48, 58, 40], stripe_color=[35, 45, 28])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 58)
    # Front Crest
    draw.polygon([(CX_LEFT, 460), (CX_LEFT - 45, 530), (CX_LEFT + 45, 530)], outline=(240, 245, 235, 255), width=4)
    draw.text((CX_LEFT - 14, 485), 'K', font=get_font('impact', 34), fill=(240, 245, 235, 255))
    # Back TRAIN EAT SLEEP REPEAT
    draw_spaced_text(draw, 'TRAIN', 410, f_main, (245, 245, 240, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'EAT', 480, f_main, (245, 245, 240, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'SLEEP', 550, f_main, (245, 245, 240, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'REPEAT', 620, f_main, (220, 230, 210, 240), CX_RIGHT, spacing=6)
    # Pants Cargo pockets
    for cx in [CX_LEFT, CX_RIGHT]:
        draw.rectangle([cx - 190, WAIST_Y + 300, cx - 120, WAIST_Y + 440], fill=(40, 50, 32, 255), outline=(65, 78, 55, 255), width=3)
        draw.rectangle([cx + 120, WAIST_Y + 300, cx + 190, WAIST_Y + 440], fill=(40, 50, 32, 255), outline=(65, 78, 55, 255), width=3)
    save_4k_gymwear(im, 'kala-grind-mode-set.png')

# 5. KALA Everyday Set
def render_everyday():
    im = make_gymwear_base([35, 52, 74], [28, 42, 60], stripe_color=[240, 245, 255])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 58)
    f_logo = get_font('impact', 52)
    # Front Monogram
    draw.text((CX_LEFT - 16, 470), 'K', font=f_logo, fill=(245, 245, 250, 255))
    # Back BETTER THAN YESTERDAY
    draw_spaced_text(draw, 'BETTER', 430, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'THAN', 510, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'YESTERDAY', 590, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    save_4k_gymwear(im, 'kala-everyday-set.png')

# 6. KALA Evolve Set
def render_evolve():
    im = make_gymwear_base([228, 220, 206], [218, 210, 196], collar_color=[195, 185, 170], stripe_color=[24, 24, 28])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 56)
    # Front logo
    draw.text((CX_LEFT - 16, 470), 'V', font=get_font('impact', 48), fill=(24, 24, 28, 255))
    # Back LIFT GROW EVOLVE
    draw_spaced_text(draw, 'LIFT', 400, f_main, (24, 24, 28, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, '— GROW —', 475, get_font('arial_bold', 28), (40, 40, 45, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'EVOLVE', 530, f_main, (24, 24, 28, 255), CX_RIGHT, spacing=6)
    draw_barbell(draw, CX_RIGHT, 630, w=220, color=(24, 24, 28, 255))
    # Pants KALA
    draw.text((CX_LEFT + 130, WAIST_Y + 280), 'KALA', font=get_font('impact', 34), fill=(24, 24, 28, 255))
    save_4k_gymwear(im, 'kala-evolve-set.png')

# 7. KALA No Limits Set
def render_no_limits():
    im = make_gymwear_base([22, 22, 26], [18, 18, 22], stripe_color=[220, 35, 35])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 84)
    # Front logo
    draw.text((CX_LEFT - 20, 470), 'W', font=get_font('impact', 44), fill=(245, 245, 250, 255))
    # Back NO LIMITS in bold crimson slash
    draw_spaced_text(draw, 'NO', 410, f_main, (225, 35, 35, 255), CX_RIGHT, spacing=8)
    draw_spaced_text(draw, 'LIMITS', 510, f_main, (225, 35, 35, 255), CX_RIGHT, spacing=8)
    draw.line([(CX_RIGHT - 160, 620), (CX_RIGHT + 160, 620)], fill=(225, 35, 35, 255), width=6)
    # Pants lightning slashes
    for cx in [CX_LEFT, CX_RIGHT]:
        pts = [(cx - 150, WAIST_Y + 200), (cx - 110, WAIST_Y + 360), (cx - 140, WAIST_Y + 540), (cx - 120, WAIST_Y + 750)]
        for i in range(len(pts)-1):
            draw.line([pts[i], pts[i+1]], fill=(245, 245, 250, 240), width=6)
    save_4k_gymwear(im, 'kala-no-limits-set.png')

# 8. KALA Wings Set
def render_wings():
    im = make_gymwear_base([248, 248, 250], [245, 245, 248], collar_color=[215, 215, 220], stripe_color=[24, 24, 28])
    draw = ImageDraw.Draw(im)
    # Front minimal crest
    draw.polygon([(CX_LEFT, 460), (CX_LEFT - 30, 500), (CX_LEFT, 540), (CX_LEFT + 30, 500)], fill=(24, 24, 28, 255))
    # Back Valkyrie Wings spreading across shoulders
    cx, cy = CX_RIGHT, 480
    w_col = (30, 30, 36, 255)
    # Left wing feathers
    for i, ang in enumerate(range(130, 220, 10)):
        rad = math.radians(ang)
        fx, fy = cx - 40 + math.cos(rad) * 190, cy + math.sin(rad) * 140
        draw.line([(cx - 30, cy - 20), (fx, fy)], fill=w_col, width=6)
        draw.polygon([(cx - 20, cy), (fx, fy), (fx + 10, fy + 20)], fill=w_col)
    # Right wing feathers
    for i, ang in enumerate(range(-40, 50, 10)):
        rad = math.radians(ang)
        fx, fy = cx + 40 + math.cos(rad) * 190, cy + math.sin(rad) * 140
        draw.line([(cx + 30, cy - 20), (fx, fy)], fill=w_col, width=6)
        draw.polygon([(cx + 20, cy), (fx, fy), (fx - 10, fy + 20)], fill=w_col)
    save_4k_gymwear(im, 'kala-wings-set.png')

# 9. KALA Relentless Set
def render_relentless():
    im = make_gymwear_base([110, 28, 38], [20, 20, 24], stripe_color=[160, 30, 45])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 58)
    f_sub = get_font('arial_bold', 24)
    # Front logo
    draw.text((CX_LEFT - 14, 460), 'V', font=get_font('impact', 48), fill=(245, 245, 250, 255))
    # Back RELENTLESS
    draw_spaced_text(draw, 'RELENTLESS', 430, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'PROGRESS OVER EXCUSES', 520, f_sub, (220, 220, 225, 240), CX_RIGHT, spacing=4)
    draw_spaced_text(draw, 'KALA PRO DIVISION', 570, f_sub, (180, 40, 50, 255), CX_RIGHT, spacing=4)
    # Pants KALA text in red
    draw.text((CX_LEFT - 170, WAIST_Y + 280), 'KALA', font=get_font('impact', 36), fill=(190, 35, 45, 255))
    save_4k_gymwear(im, 'kala-relentless-set.png')

# 10. KALA Overthink Set
def render_overthink():
    im = make_gymwear_base([22, 22, 26], [18, 18, 22], stripe_color=[240, 240, 245])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 68)
    f_sub = get_font('arial_bold', 24)
    # Front OVERTHINK with thorns
    draw_spaced_text(draw, 'OVERTHINK', 470, f_main, (245, 245, 250, 255), CX_LEFT, spacing=6)
    # Thorns around text
    draw.line([(CX_LEFT - 180, 450), (CX_LEFT + 180, 450)], fill=(245, 245, 250, 200), width=4)
    draw.line([(CX_LEFT - 180, 560), (CX_LEFT + 180, 560)], fill=(245, 245, 250, 200), width=4)
    for tx in range(CX_LEFT - 160, CX_LEFT + 170, 35):
        draw.line([(tx, 442), (tx + 12, 458)], fill=(245, 245, 250, 255), width=3)
        draw.line([(tx, 568), (tx + 12, 552)], fill=(245, 245, 250, 255), width=3)
    # Back vertical thorny bars
    draw.line([(CX_RIGHT - 30, 380), (CX_RIGHT - 30, 680)], fill=(245, 245, 250, 255), width=5)
    draw.line([(CX_RIGHT + 30, 380), (CX_RIGHT + 30, 680)], fill=(245, 245, 250, 255), width=5)
    draw_spaced_text(draw, 'OVERTHINK // KILL SILENCE', 710, f_sub, (200, 200, 205, 220), CX_RIGHT, spacing=4)
    # Pants thorn branches
    for cx in [CX_LEFT, CX_RIGHT]:
        draw.line([(cx + 140, WAIST_Y + 180), (cx + 170, WAIST_Y + 450), (cx + 130, WAIST_Y + 750)], fill=(245, 245, 250, 240), width=5)
    save_4k_gymwear(im, 'kala-overthink-set.png')

# 11. KALA Nature Set
def render_nature():
    im = make_gymwear_base([48, 62, 44], [38, 50, 34], stripe_color=[240, 245, 235])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 54)
    # Front logo
    draw.text((CX_LEFT - 14, 460), 'V', font=get_font('impact', 48), fill=(240, 245, 235, 255))
    # Back NATURE HEALS + Mountain peaks
    draw_spaced_text(draw, 'NATURE', 400, f_main, (245, 245, 240, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'HEALS', 470, f_main, (245, 245, 240, 255), CX_RIGHT, spacing=6)
    # Mountains
    cx, cy = CX_RIGHT, 580
    draw.polygon([(cx - 110, cy + 60), (cx - 40, cy - 20), (cx + 20, cy + 40), (cx + 90, cy - 40), (cx + 140, cy + 60)], outline=(245, 245, 240, 255), width=5)
    save_4k_gymwear(im, 'kala-nature-set.png')

# 12. KALA Iron Mind Set
def render_iron_mind():
    im = make_gymwear_base([24, 24, 28], [20, 20, 24], stripe_color=[56, 189, 248])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 64)
    # Front IRON MIND & Mecha Chest Plate
    draw_spaced_text(draw, 'IRON MIND', 410, f_main, (245, 245, 250, 255), CX_LEFT, spacing=6)
    cx, cy = CX_LEFT, 550
    # Mecha Chest Armor
    draw.polygon([(cx, cy - 60), (cx + 80, cy - 20), (cx + 60, cy + 60), (cx, cy + 90), (cx - 60, cy + 60), (cx - 80, cy - 20)], outline=(56, 189, 248, 255), width=5)
    draw.line([(cx - 40, cy), (cx + 40, cy)], fill=(56, 189, 248, 255), width=4)
    # Back Cyber Matrix Grid
    draw.rectangle([CX_RIGHT - 140, 420, CX_RIGHT + 140, 640], outline=(56, 189, 248, 180), width=4)
    draw_spaced_text(draw, 'UNBREAKABLE', 510, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    save_4k_gymwear(im, 'kala-iron-mind-set.png')

# 13. KALA Good Mood Set
def render_good_mood():
    im = make_gymwear_base([42, 68, 96], [32, 54, 78], stripe_color=[245, 245, 250])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 52)
    # Front chest crest
    draw.text((CX_LEFT - 14, 460), 'V', font=get_font('impact', 48), fill=(245, 245, 250, 255))
    # Back GOOD MUSCLES GOOD MOOD
    draw_spaced_text(draw, 'GOOD', 390, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'MUSCLES', 450, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'GOOD', 510, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'MOOD', 570, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    draw_barbell(draw, CX_RIGHT, 650, w=200, color=(245, 245, 250, 255))
    save_4k_gymwear(im, 'kala-good-mood-set.png')

# 14. KALA Zen Set
def render_zen():
    im = make_gymwear_base([22, 22, 26], [18, 18, 22], stripe_color=[225, 45, 80])
    draw = ImageDraw.Draw(im)
    f_kanji = get_font('japanese_bold', 110)
    # Front Koi Fish swimming up
    cx, cy = CX_LEFT, 520
    # Koi curved body
    draw.ellipse([cx - 35, cy - 80, cx + 35, cy + 30], fill=(225, 45, 45, 255))
    draw.polygon([(cx, cy + 20), (cx - 40, cy + 80), (cx + 40, cy + 80)], fill=(225, 45, 45, 255))
    draw.ellipse([cx - 20, cy - 60, cx + 20, cy - 20], fill=(255, 255, 255, 240))
    # Back Peace Kanji: 平和 & Lotus
    draw.text((CX_RIGHT - 110, 380), '平和', font=f_kanji, fill=(245, 245, 250, 255))
    # Sacred Lotus
    cx, cy = CX_RIGHT, 570
    draw.polygon([(cx, cy - 40), (cx - 50, cy + 20), (cx + 50, cy + 20)], fill=(244, 114, 182, 255))
    draw.polygon([(cx - 25, cy - 20), (cx - 70, cy + 20), (cx + 20, cy + 20)], fill=(236, 72, 153, 230))
    draw.polygon([(cx + 25, cy - 20), (cx + 70, cy + 20), (cx - 20, cy + 20)], fill=(236, 72, 153, 230))
    save_4k_gymwear(im, 'kala-zen-set.png')

# 15. KALA Tech Set
def render_tech():
    im = make_gymwear_base([236, 238, 242], [220, 222, 228], collar_color=[190, 195, 205], stripe_color=[40, 45, 55])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 72)
    # Front KALA
    draw_spaced_text(draw, 'KALA', 470, f_main, (24, 24, 28, 255), CX_LEFT, spacing=10)
    # Back Tech Panel Blueprint
    draw.rectangle([CX_RIGHT - 130, 410, CX_RIGHT + 130, 650], outline=(24, 24, 28, 255), width=4)
    draw_spaced_text(draw, 'KALA PRO', 460, get_font('impact', 48), (24, 24, 28, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'SYSTEM 0.9 // ADAPTIVE', 540, get_font('arial_bold', 22), (60, 65, 75, 255), CX_RIGHT, spacing=3)
    save_4k_gymwear(im, 'kala-tech-set.png')

# 16. KALA Purpose Set
def render_purpose():
    im = make_gymwear_base([22, 22, 26], [18, 18, 22], stripe_color=[239, 68, 68])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 58)
    # Front logo
    draw.text((CX_LEFT - 14, 460), 'V', font=get_font('impact', 48), fill=(239, 68, 68, 255))
    # Back PAIN PROGRESS PURPOSE
    draw_spaced_text(draw, 'PAIN', 410, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'PROGRESS', 485, f_main, (239, 68, 68, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'PURPOSE', 560, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    # Pants Flames
    for cx in [CX_LEFT, CX_RIGHT]:
        draw.polygon([(cx - 160, WAIST_Y + 700), (cx - 140, WAIST_Y + 540), (cx - 120, WAIST_Y + 620), (cx - 100, WAIST_Y + 500), (cx - 90, WAIST_Y + 700)], fill=(239, 68, 68, 255))
    save_4k_gymwear(im, 'kala-purpose-set.png')

# 17. KALA Focus Set
def render_focus():
    im = make_gymwear_base([28, 68, 76], [22, 54, 60], stripe_color=[240, 253, 250])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 52)
    # Front logo
    draw.text((CX_LEFT - 14, 460), 'V', font=get_font('impact', 48), fill=(240, 253, 250, 255))
    # Back DISCIPLINE TODAY RESULTS TOMORROW
    draw_spaced_text(draw, 'DISCIPLINE', 400, f_main, (240, 253, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'TODAY', 465, f_main, (240, 253, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'RESULTS', 530, f_main, (240, 253, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'TOMORROW', 595, f_main, (240, 253, 250, 255), CX_RIGHT, spacing=6)
    save_4k_gymwear(im, 'kala-focus-set.png')

# 18. KALA Progress Set
def render_progress():
    im = make_gymwear_base([232, 224, 210], [222, 214, 200], collar_color=[190, 180, 165], stripe_color=[220, 38, 38])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 56)
    # Front Great Wave & Rising Sun
    cx, cy = CX_LEFT, 520
    draw.ellipse([cx - 60, cy - 90, cx + 60, cy + 30], fill=(220, 38, 38, 255))
    # Wave
    draw.polygon([(cx - 120, cy + 50), (cx - 40, cy - 20), (cx + 30, cy + 30), (cx + 120, cy - 30), (cx + 120, cy + 60), (cx - 120, cy + 60)], fill=(30, 45, 65, 255))
    # Back SMALL STEPS BIG CHANGES
    draw_spaced_text(draw, 'SMALL', 400, f_main, (24, 24, 28, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'STEPS', 470, f_main, (24, 24, 28, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'BIG', 540, f_main, (24, 24, 28, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'CHANGES', 610, f_main, (220, 38, 38, 255), CX_RIGHT, spacing=6)
    save_4k_gymwear(im, 'kala-progress-set.png')

# 19. KALA Chaos Set
def render_chaos():
    im = make_gymwear_base([20, 20, 24], [16, 16, 20], stripe_color=[168, 85, 247])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 58)
    # Front Neon Purple Butterfly
    cx, cy = CX_LEFT, 520
    p_col = (168, 85, 247, 255)
    draw.polygon([(cx, cy - 10), (cx - 70, cy - 80), (cx - 90, cy - 10), (cx - 40, cy + 50), (cx, cy + 10)], fill=p_col)
    draw.polygon([(cx, cy - 10), (cx + 70, cy - 80), (cx + 90, cy - 10), (cx + 40, cy + 50), (cx, cy + 10)], fill=p_col)
    draw.line([(cx, cy - 70), (cx, cy + 50)], fill=(255, 255, 255, 255), width=6)
    # Back CHAOS BREEDS GROWTH
    draw_spaced_text(draw, 'CHAOS', 410, f_main, (168, 85, 247, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'BREEDS', 485, f_main, (245, 245, 250, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'GROWTH', 560, f_main, (168, 85, 247, 255), CX_RIGHT, spacing=6)
    # Pants Purple Flames
    for cx in [CX_LEFT, CX_RIGHT]:
        draw.polygon([(cx - 160, WAIST_Y + 700), (cx - 140, WAIST_Y + 540), (cx - 120, WAIST_Y + 620), (cx - 100, WAIST_Y + 500), (cx - 90, WAIST_Y + 700)], fill=(168, 85, 247, 255))
    save_4k_gymwear(im, 'kala-chaos-set.png')

# 20. KALA Repeat Set
def render_repeat():
    im = make_gymwear_base([110, 115, 125], [85, 90, 100], collar_color=[70, 75, 85], stripe_color=[24, 24, 28])
    draw = ImageDraw.Draw(im)
    f_main = get_font('impact', 58)
    # Front logo
    draw.text((CX_LEFT - 14, 460), 'V', font=get_font('impact', 48), fill=(24, 24, 28, 255))
    # Back RUN LIFT IMPROVE REPEAT
    draw_spaced_text(draw, 'RUN', 390, f_main, (24, 24, 28, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'LIFT', 460, f_main, (24, 24, 28, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'IMPROVE', 530, f_main, (24, 24, 28, 255), CX_RIGHT, spacing=6)
    draw_spaced_text(draw, 'REPEAT', 600, f_main, (24, 24, 28, 255), CX_RIGHT, spacing=6)
    save_4k_gymwear(im, 'kala-repeat-set.png')

def main():
    print("Generating all 20 Ultra-HD 4K Gymwear Sets...")
    render_apex()
    render_discipline()
    render_oni()
    render_grind_mode()
    render_everyday()
    render_evolve()
    render_no_limits()
    render_wings()
    render_relentless()
    render_overthink()
    render_nature()
    render_iron_mind()
    render_good_mood()
    render_zen()
    render_tech()
    render_purpose()
    render_focus()
    render_progress()
    render_chaos()
    render_repeat()
    print("ALL 20 4K GYMWEAR SETS GENERATED SUCCESSFULLY!")

if __name__ == '__main__':
    main()
