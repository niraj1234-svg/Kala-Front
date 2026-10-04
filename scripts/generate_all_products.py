import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cv2

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_IMAGES = os.path.join(BASE_DIR, 'client', 'images')
PUBLIC_IMAGES = os.path.join(BASE_DIR, 'client', 'public', 'images')
PUBLIC_PRODUCTS = os.path.join(BASE_DIR, 'client', 'public', 'products')

# Load the perfect textured blank black tee
BLANK_BLACK_PATH = os.path.join(BASE_DIR, 'scripts', 'blanks', 'inpaint_textured.png')
base_cv2 = cv2.imread(BLANK_BLACK_PATH)
base_rgb = cv2.cvtColor(base_cv2, cv2.COLOR_BGR2RGB).astype(np.float32)

# Compute fabric folds and mask
shirt_mask = np.mean(base_rgb, axis=2) < 95
lum = cv2.cvtColor(base_cv2, cv2.COLOR_BGR2GRAY).astype(np.float32)
shirt_lum = lum[shirt_mask]
p_min, p_max = np.percentile(shirt_lum, 3), np.percentile(shirt_lum, 97)
norm_fabric = np.clip((lum - p_min) / (p_max - p_min), 0.0, 1.0)

# Feather shirt mask
mask_im = Image.fromarray((shirt_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
feathered_mask = np.array(mask_im).astype(np.float32)[:, :, np.newaxis] / 255.0

# Fonts
FONTS_DIR = 'C:/Windows/Fonts'
def get_font(name, size):
    font_map = {
        'agency_bold': os.path.join(FONTS_DIR, 'AGENCYB.TTF'),
        'impact': os.path.join(FONTS_DIR, 'impact.ttf'),
        'rock_bold': os.path.join(FONTS_DIR, 'ROCKB.TTF'),
        'rock_extra': os.path.join(FONTS_DIR, 'ROCKEB.TTF'),
        'gothic_bold': os.path.join(FONTS_DIR, 'GOTHICB.TTF'),
        'arial_narrow_bold': os.path.join(FONTS_DIR, 'ARIALNB.TTF'),
        'arial_bold': os.path.join(FONTS_DIR, 'arialbd.ttf'),
        'segoe_bold': os.path.join(FONTS_DIR, 'segoeuib.ttf'),
    }
    path = font_map.get(name, font_map['arial_bold'])
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def draw_spaced_text(draw, text, y, font, fill, width=1024, spacing=2):
    char_widths = []
    for ch in text:
        bbox = draw.textbbox((0, 0), ch, font=font)
        char_widths.append(bbox[2] - bbox[0])
    total_w = sum(char_widths) + max(0, len(text) - 1) * spacing
    start_x = (width - total_w) // 2
    curr_x = start_x
    for i, ch in enumerate(text):
        draw.text((curr_x, y), ch, font=font, fill=fill)
        curr_x += char_widths[i] + spacing
    bbox_all = draw.textbbox((0, 0), text, font=font)
    return bbox_all[3] - bbox_all[1]

def make_base_shirt(base_rgb_val, shadow_rgb=None, highlight_rgb=None, is_acid_wash=False):
    if shadow_rgb is None:
        shadow_rgb = [c * 0.65 for c in base_rgb_val]
    if highlight_rgb is None:
        highlight_rgb = [min(255, c * 1.35) for c in base_rgb_val]
        
    c_shadow = np.array(shadow_rgb, dtype=np.float32)
    c_highlight = np.array(highlight_rgb, dtype=np.float32)
    colored = c_shadow + norm_fabric[:, :, np.newaxis] * (c_highlight - c_shadow)
    
    if is_acid_wash:
        w, h = 1024, 1024
        noise_im = Image.fromarray((np.random.rand(h//6, w//6) * 255).astype(np.uint8)).resize((w, h), Image.Resampling.BILINEAR)
        noise_arr = (np.array(noise_im).astype(np.float32) - 128) * 0.20
        colored = np.clip(colored + noise_arr[:, :, np.newaxis], 15, 245)
        
    out = base_rgb * (1.0 - feathered_mask) + colored * feathered_mask
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert('RGBA')

def composite_and_save(base_im, draw_graphic_func, filename):
    w, h = 1024, 1024
    graphic = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(graphic)
    draw_graphic_func(draw, w, h)
    
    # 1. Soft ink drop shadow on fabric
    ink_shadow = graphic.filter(ImageFilter.GaussianBlur(2.0))
    
    # 2. Fabric modulation so graphic adheres to cotton folds
    g_arr = np.array(graphic).astype(np.float32)
    shading = 0.82 + 0.28 * norm_fabric
    for c in range(3):
        g_arr[:, :, c] = g_arr[:, :, c] * shading
        
    modulated_graphic = Image.fromarray(np.clip(g_arr, 0, 255).astype(np.uint8))
    
    comp = Image.alpha_composite(base_im, ink_shadow)
    comp = Image.alpha_composite(comp, modulated_graphic)
    
    final_rgb = comp.convert('RGB')
    for d in [CLIENT_IMAGES, PUBLIC_IMAGES, PUBLIC_PRODUCTS]:
        os.makedirs(d, exist_ok=True)
        dest = os.path.join(d, filename)
        final_rgb.save(dest, 'PNG', optimize=True)
    print(f'[SUCCESS] Created {filename}')

# =========================================================================
# 9. Respawn Mode T-Shirt (Heather Ash Grey)
# =========================================================================
def draw_respawn_mode(draw, w, h):
    cx, cy = 512, 450
    f_main = get_font('impact', 52)
    f_badge = get_font('agency_bold', 22)
    f_tech = get_font('arial_narrow_bold', 16)
    
    # Header
    draw_spaced_text(draw, 'RESPAWN MODE', 320, f_main, (24, 28, 36, 245), spacing=3)
    
    # Arcade HUD Frame
    bx1, by1, bx2, by2 = cx - 165, 385, cx + 165, 515
    draw.rectangle([bx1, by1, bx2, by2], outline=(0, 215, 240, 220), width=2)
    # Corner brackets
    cL = 16
    for px, py in [(bx1, by1), (bx2, by1), (bx1, by2), (bx2, by2)]:
        dx = cL if px == bx1 else -cL
        dy = cL if py == by1 else -cL
        draw.line([px, py, px + dx, py], fill=(255, 90, 30, 240), width=4)
        draw.line([px, py, px, py + dy], fill=(255, 90, 30, 240), width=4)
        
    # Pixel Hearts
    def draw_pixel_heart(hx, hy, scale, fill, wire=False):
        pattern = [' 11 11 ', '1111111', '1111111', ' 11111 ', '  111  ', '   1   ']
        s = scale
        for row_i, row in enumerate(pattern):
            for col_i, ch in enumerate(row):
                if ch == '1':
                    px = hx + (col_i - 3.5) * s
                    py = hy + row_i * s
                    if wire:
                        draw.rectangle([px, py, px + s - 1, py + s - 1], outline=fill, width=2)
                    else:
                        draw.rectangle([px, py, px + s - 1, py + s - 1], fill=fill)

    draw_pixel_heart(cx - 90, 410, 8, (255, 45, 80, 240))
    draw_pixel_heart(cx, 410, 8, (255, 45, 80, 240))
    draw_pixel_heart(cx + 90, 410, 8, (0, 215, 240, 220), wire=True)
    
    # Status bar inside HUD
    draw.rectangle([cx - 130, 475, cx + 130, 498], fill=(24, 28, 36, 240))
    draw_spaced_text(draw, 'PLAYER 1  //  LIVES: 2 / 3  //  HP: 99%', 478, f_badge, (255, 255, 255, 245), spacing=1)
    
    # Bottom subtext
    draw.rectangle([cx - 150, 535, cx + 150, 562], fill=(255, 90, 30, 235))
    draw_spaced_text(draw, 'PRESS START TO CONTINUE', 538, f_badge, (24, 28, 36, 255), spacing=2)
    draw_spaced_text(draw, 'SYSTEM ACTIVE  //  TOKYO ESPORTS LAB', 575, f_tech, (75, 80, 90, 220), spacing=1)

# =========================================================================
# 10. Night Raid T-Shirt (Deep Plum Burgundy)
# =========================================================================
def draw_night_raid(draw, w, h):
    cx, cy = 512, 455
    f_main = get_font('impact', 54)
    f_badge = get_font('agency_bold', 22)
    f_sub = get_font('arial_narrow_bold', 16)
    
    # Header
    draw_spaced_text(draw, 'NIGHT RAID', 305, f_main, (255, 255, 255, 250), spacing=4)
    
    # Hexagon Tactical Shield
    R = 115
    hex_pts = []
    for i in range(6):
        ang = math.radians(60 * i + 30)
        hex_pts.append((cx + R * math.cos(ang), cy + R * math.sin(ang)))
    draw.polygon(hex_pts, fill=(20, 14, 24, 235), outline=(0, 245, 205, 240), width=3)
    
    # Tactical night-vision quad goggles icon
    gy = cy - 15
    draw.rectangle([cx - 65, gy - 20, cx + 65, gy + 20], fill=(28, 20, 34, 255), outline=(0, 245, 205, 200), width=2)
    for lx in [cx - 45, cx - 15, cx + 15, cx + 45]:
        draw.ellipse([lx - 10, gy - 10, lx + 10, gy + 10], fill=(0, 245, 205, 240), outline=(255, 255, 255, 250), width=2)
        
    # Crosshair
    draw.line([cx - 95, cy + 30, cx + 95, cy + 30], fill=(255, 55, 80, 220), width=2)
    draw.line([cx, cy + 15, cx, cy + 45], fill=(255, 55, 80, 220), width=2)
    
    # Banner under hexagon
    draw.rectangle([cx - 160, 585, cx + 160, 615], fill=(0, 245, 205, 240))
    draw_spaced_text(draw, 'SPEC-OPS COVERT DIVISION', 589, f_badge, (20, 14, 24, 255), spacing=2)
    draw_spaced_text(draw, 'TOKYO SECTOR  //  LAT 35.6762° N  //  TACTICAL HUD', 625, f_sub, (200, 185, 210, 220), spacing=1)

# =========================================================================
# 11. Level Up T-Shirt (Vintage Sage Khaki)
# =========================================================================
def draw_level_up(draw, w, h):
    cx, cy = 512, 450
    f_main = get_font('impact', 56)
    f_badge = get_font('agency_bold', 24)
    f_sub = get_font('arial_narrow_bold', 16)
    
    # 3 Ascending Neon Green Chevrons
    y_start = 325
    chevrons = [
        ((35, 230, 120), 1.0, y_start),
        ((30, 195, 100), 0.85, y_start + 45),
        ((25, 160, 80), 0.7, y_start + 85),
    ]
    for color, a_mult, y_pos in chevrons:
        c_fill = (color[0], color[1], color[2], int(245 * a_mult))
        w_ch, h_ch = 95, 30
        pts = [
            (cx, y_pos),
            (cx + w_ch, y_pos + h_ch),
            (cx + w_ch - 24, y_pos + h_ch + 16),
            (cx, y_pos + 20),
            (cx - w_ch + 24, y_pos + h_ch + 16),
            (cx - w_ch, y_pos + h_ch)
        ]
        draw.polygon(pts, fill=c_fill, outline=(20, 32, 22, 220), width=2)
        
    draw_spaced_text(draw, 'LEVEL UP', 485, f_main, (20, 32, 22, 250), spacing=3)
    draw.rectangle([cx - 150, 555, cx + 150, 585], fill=(20, 32, 22, 240))
    draw_spaced_text(draw, 'EXP +99,999  //  RANK S+', 558, f_badge, (35, 230, 120, 245), spacing=2)
    draw_spaced_text(draw, 'NEXT STAGE READY  //  ALL SYSTEMS ONLINE', 598, f_sub, (50, 70, 55, 220), spacing=1)

# =========================================================================
# 12. Critical Hit T-Shirt (Dark Charcoal Melange) - Anime Manga Slash
# =========================================================================
def draw_critical_hit(draw, w, h):
    cx, cy = 512, 450
    f_main = get_font('impact', 58)
    f_jp = get_font('agency_bold', 28)
    f_stat = get_font('agency_bold', 32)
    f_sub = get_font('arial_narrow_bold', 16)
    
    # Dual Neon Katana Slash Across Center
    # Slash 1: Cyan
    draw.polygon([(cx - 160, cy + 70), (cx + 160, cy - 70), (cx + 155, cy - 62), (cx - 165, cy + 78)], fill=(0, 245, 255, 240))
    # Slash 2: Magenta
    draw.polygon([(cx - 150, cy - 65), (cx + 150, cy + 65), (cx + 145, cy + 73), (cx - 155, cy - 57)], fill=(255, 45, 140, 240))
    
    # Diamond Impact Burst at intersection
    draw.polygon([(cx, cy - 65), (cx + 65, cy), (cx, cy + 65), (cx - 65, cy)],
                 fill=(22, 18, 30, 245), outline=(0, 245, 255, 245), width=3)
    draw.polygon([(cx, cy - 40), (cx + 40, cy), (cx, cy + 40), (cx - 40, cy)],
                 fill=(255, 45, 140, 240), outline=(255, 255, 255, 250), width=2)
                 
    # Sparks and impact shards
    for r, ang in [(85, 30), (95, 75), (80, 140), (100, 210), (85, 260), (90, 320)]:
        rad = math.radians(ang)
        sx, sy = cx + r * math.cos(rad), cy + r * math.sin(rad)
        draw.polygon([(sx, sy - 8), (sx + 8, sy), (sx, sy + 8), (sx - 8, sy)], fill=(0, 245, 255, 230))
        
    draw_spaced_text(draw, 'CRITICAL HIT', 305, f_main, (255, 255, 255, 250), spacing=3)
    draw_spaced_text(draw, 'LETHAL STRIKE  //  9999 DAMAGE', 545, f_stat, (0, 245, 255, 245), spacing=2)
    draw_spaced_text(draw, 'MAXIMUM IMPACT  //  COMBAT OVERDRIVE', 590, f_sub, (180, 170, 195, 220), spacing=1)

# =========================================================================
# 13. Cyber Player T-Shirt (Washed Petrol Teal)
# =========================================================================
def draw_cyber_player(draw, w, h):
    cx, cy = 512, 455
    f_main = get_font('impact', 52)
    f_sub = get_font('agency_bold', 24)
    f_tech = get_font('arial_narrow_bold', 16)
    
    # 80s Horizon Perspective Grid
    top_y = cy - 20
    bot_y = cy + 115
    draw.rectangle([cx - 160, top_y, cx + 160, bot_y], fill=(12, 26, 36, 235))
    draw.line([cx - 160, top_y, cx + 160, top_y], fill=(255, 45, 120, 245), width=3)
    
    vanishing_pt = (cx, top_y - 20)
    for bx in range(cx - 160, cx + 161, 40):
        draw.line([vanishing_pt[0], vanishing_pt[1], bx, bot_y], fill=(0, 235, 255, 140), width=1)
    for hy in [top_y + 15, top_y + 35, top_y + 65, top_y + 95]:
        draw.line([cx - 160, hy, cx + 160, hy], fill=(0, 235, 255, 140), width=1)
        
    # Floating Wireframe Headphones
    draw.arc([cx - 55, top_y - 80, cx + 55, top_y + 10], 180, 360, fill=(255, 45, 120, 240), width=5)
    draw.rounded_rectangle([cx - 70, top_y - 40, cx - 40, top_y + 8], radius=8, fill=(0, 235, 255, 240), outline=(255, 255, 255, 240), width=2)
    draw.rounded_rectangle([cx + 40, top_y - 40, cx + 70, top_y + 8], radius=8, fill=(0, 235, 255, 240), outline=(255, 255, 255, 240), width=2)
    
    draw_spaced_text(draw, 'CYBER PLAYER', 315, f_main, (255, 255, 255, 250), spacing=3)
    draw_spaced_text(draw, 'SYNTHWAVE 1984', 590, f_sub, (255, 45, 120, 245), spacing=3)
    draw_spaced_text(draw, 'NEON PULSE AUDIO  //  TOKYO VIRTUAL REALITY', 625, f_tech, (165, 220, 235, 220), spacing=1)

# =========================================================================
# 14. Game Over Never T-Shirt (Vanilla Cream)
# =========================================================================
def draw_game_over_never(draw, w, h):
    cx, cy = 512, 450
    f_main1 = get_font('impact', 54)
    f_main2 = get_font('impact', 62)
    f_sub = get_font('rock_bold', 20)
    f_arcade = get_font('agency_bold', 20)
    
    draw_spaced_text(draw, 'GAME OVER?', 325, f_main1, (30, 32, 38, 245), spacing=3)
    
    draw.rectangle([cx - 150, 395, cx + 150, 475], fill=(225, 35, 45, 245))
    draw_spaced_text(draw, 'NEVER.', 402, f_main2, (255, 255, 255, 255), spacing=4)
    
    draw.rectangle([cx - 120, 505, cx + 120, 509], fill=(30, 32, 38, 230))
    draw_spaced_text(draw, 'INSERT COIN TO CONTINUE', 525, f_sub, (30, 32, 38, 245), spacing=2)
    draw_spaced_text(draw, 'CREDITS: 99  //  EXTRA LIVES: INFINITE', 562, f_arcade, (95, 100, 110, 220), spacing=1)

# =========================================================================
# 15. Built Different T-Shirt (Vintage Washed Mineral Black Pump Cover)
# =========================================================================
def draw_built_different(draw, w, h):
    cx, cy = 512, 450
    f_title = get_font('impact', 54)
    f_sub = get_font('agency_bold', 24)
    f_dist = get_font('arial_narrow_bold', 16)
    
    draw_spaced_text(draw, 'BUILT DIFFERENT', 315, f_title, (240, 240, 240, 250), spacing=2)
    
    # Diamond crest
    draw.polygon([(cx, cy - 75), (cx + 85, cy), (cx, cy + 75), (cx - 85, cy)],
                 outline=(225, 225, 225, 240), width=4)
                 
    # Olympic Barbell with 45lb Plates
    draw.rectangle([cx - 125, cy - 6, cx + 125, cy + 6], fill=(225, 225, 225, 240))
    draw.rectangle([cx - 105, cy - 35, cx - 90, cy + 35], fill=(240, 240, 240, 245))
    draw.rectangle([cx - 80, cy - 28, cx - 70, cy + 28], fill=(210, 210, 210, 240))
    draw.rectangle([cx + 90, cy - 35, cx + 105, cy + 35], fill=(240, 240, 240, 245))
    draw.rectangle([cx + 70, cy - 28, cx + 80, cy + 28], fill=(210, 210, 210, 240))
    draw.rectangle([cx - 20, cy - 10, cx + 20, cy + 10], fill=(245, 245, 245, 250))
    
    draw.rectangle([cx - 150, 545, cx + 150, 578], fill=(240, 240, 240, 250))
    draw_spaced_text(draw, 'HEAVYWEIGHT DIVISION', 549, f_sub, (22, 22, 24, 255), spacing=2)
    draw_spaced_text(draw, 'FORGED IN IRON  //  EST. 2024  //  RAW POWER', 592, f_dist, (180, 180, 185, 220), spacing=1)

# =========================================================================
# 16. No Days Off T-Shirt (Athletic Melange Grey)
# =========================================================================
def draw_no_days_off(draw, w, h):
    cx, cy = 512, 450
    f_main = get_font('impact', 62)
    f_box = get_font('rock_bold', 18)
    f_sub = get_font('arial_narrow_bold', 16)
    
    draw_spaced_text(draw, 'NO DAYS', 315, f_main, (24, 26, 30, 245), spacing=3)
    draw_spaced_text(draw, 'OFF.', 382, f_main, (24, 26, 30, 245), spacing=3)
    
    days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    box_w = 34
    gap = 8
    total_w = 7 * box_w + 6 * gap
    start_x = cx - total_w // 2
    
    for i, d_text in enumerate(days):
        bx = start_x + i * (box_w + gap)
        by = 480
        draw.rectangle([bx, by, bx + box_w, by + box_w], fill=(24, 26, 30, 245))
        bbox = draw.textbbox((0, 0), d_text, font=f_box)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((bx + (box_w - tw)//2, by + (box_w - th)//2 - 2), d_text, font=f_box, fill=(255, 255, 255, 255))
        
    draw_spaced_text(draw, 'CONSISTENCY OVER INTENSITY', 540, f_box, (24, 26, 30, 240), spacing=2)
    draw_spaced_text(draw, '365 DAYS ACTIVE  //  KALA PERFORMANCE', 575, f_sub, (75, 80, 88, 220), spacing=1)

# =========================================================================
# 17. Discipline T-Shirt (Tactical Military Olive Green)
# =========================================================================
def draw_discipline(draw, w, h):
    cx, cy = 512, 450
    f_main = get_font('impact', 48)
    f_over = get_font('agency_bold', 22)
    f_sub = get_font('arial_narrow_bold', 16)
    
    col_w = 18
    col_h = 230
    lx = cx - 190
    draw.rectangle([lx, cy - col_h//2, lx + col_w, cy + col_h//2], fill=(240, 240, 235, 245))
    draw.rectangle([lx - 8, cy - col_h//2 - 10, lx + col_w + 8, cy - col_h//2], fill=(245, 245, 240, 250))
    draw.rectangle([lx - 8, cy + col_h//2, lx + col_w + 8, cy + col_h//2 + 10], fill=(245, 245, 240, 250))
    
    rx = cx + 190 - col_w
    draw.rectangle([rx, cy - col_h//2, rx + col_w, cy + col_h//2], fill=(240, 240, 235, 245))
    draw.rectangle([rx - 8, cy - col_h//2 - 10, rx + col_w + 8, cy - col_h//2], fill=(245, 245, 240, 250))
    draw.rectangle([rx - 8, cy + col_h//2, rx + col_w + 8, cy + col_h//2 + 10], fill=(245, 245, 240, 250))
    
    draw_spaced_text(draw, 'DISCIPLINE', 360, f_main, (245, 245, 240, 250), spacing=2)
    draw.line([cx - 100, 425, cx - 40, 425], fill=(210, 205, 195, 220), width=2)
    draw.line([cx + 40, 425, cx + 100, 425], fill=(210, 205, 195, 220), width=2)
    draw_spaced_text(draw, 'OVER', 412, f_over, (245, 245, 240, 240), spacing=2)
    
    draw_spaced_text(draw, 'MOTIVATION', 445, f_main, (245, 245, 240, 250), spacing=2)
    draw_spaced_text(draw, '—  MMXXIV  —', 510, f_over, (200, 195, 185, 220), spacing=3)
    draw_spaced_text(draw, 'UNYIELDING WILL  //  DAILY DEDICATION', 545, f_sub, (215, 215, 205, 220), spacing=1)

# =========================================================================
# 18. Train Insane T-Shirt (Deep Crimson Rust Red)
# =========================================================================
def draw_train_insane(draw, w, h):
    cx, cy = 512, 450
    f_main = get_font('impact', 56)
    f_sub = get_font('agency_bold', 24)
    f_tag = get_font('arial_narrow_bold', 16)
    
    # Rugged iron shield
    pts = [
        (cx, cy - 85),
        (cx + 105, cy - 55),
        (cx + 85, cy + 40),
        (cx, cy + 95),
        (cx - 85, cy + 40),
        (cx - 105, cy - 55),
    ]
    draw.polygon(pts, fill=(28, 10, 12, 235), outline=(250, 245, 240, 245), width=3)
    
    # Crossed Olympic Barbells with round plate ends
    draw.line([cx - 70, cy - 50, cx + 70, cy + 50], fill=(250, 245, 240, 240), width=6)
    draw.line([cx + 70, cy - 50, cx - 70, cy + 50], fill=(250, 245, 240, 240), width=6)
    for px, py in [(cx - 70, cy - 50), (cx + 70, cy + 50), (cx + 70, cy - 50), (cx - 70, cy + 50)]:
        draw.ellipse([px - 10, py - 10, px + 10, py + 10], fill=(250, 245, 240, 250))
    
    draw_spaced_text(draw, 'TRAIN INSANE', 315, f_main, (250, 245, 240, 255), spacing=3)
    draw.rectangle([cx - 150, 565, cx + 150, 595], fill=(250, 245, 240, 250))
    draw_spaced_text(draw, 'OR REMAIN THE SAME', 569, f_sub, (28, 10, 12, 255), spacing=2)
    draw_spaced_text(draw, 'HEAVY IRON CLUB  //  NO PAIN NO PROGRESS', 610, f_tag, (230, 205, 210, 220), spacing=1)

# =========================================================================
# 19. Iron Mind T-Shirt (Industrial Steel Slate Blue)
# =========================================================================
def draw_iron_mind(draw, w, h):
    cx, cy = 512, 450
    f_main = get_font('impact', 56)
    f_stencil = get_font('agency_bold', 24)
    f_sub = get_font('arial_narrow_bold', 16)
    
    R = 100
    hex_pts = []
    for i in range(6):
        ang = math.radians(60 * i + 30)
        hex_pts.append((cx + R * math.cos(ang), cy + R * math.sin(ang)))
    draw.polygon(hex_pts, fill=(18, 26, 36, 235), outline=(230, 240, 250, 245), width=4)
    
    # Kettlebell
    draw.arc([cx - 32, cy - 50, cx + 32, cy - 5], 180, 360, fill=(230, 240, 250, 245), width=6)
    draw.ellipse([cx - 42, cy - 22, cx + 42, cy + 42], fill=(230, 240, 250, 245))
    draw.rectangle([cx - 14, cy - 8, cx + 14, cy + 24], fill=(18, 26, 36, 255))
    
    draw_spaced_text(draw, 'IRON MIND', 315, f_main, (245, 248, 252, 250), spacing=3)
    draw_spaced_text(draw, 'FORGED UNDER PRESSURE', 570, f_stencil, (230, 240, 250, 245), spacing=2)
    draw_spaced_text(draw, 'HEAVYWEIGHT ATHLETICS  //  BENT BY NONE', 610, f_sub, (170, 190, 210, 220), spacing=1)

# =========================================================================
# 20. Earn Your Strength T-Shirt (Warm Camel Tan Pump Cover)
# =========================================================================
def draw_earn_your_strength(draw, w, h):
    cx, cy = 512, 450
    f_arch = get_font('impact', 54)
    f_sub = get_font('impact', 58)
    f_vintage = get_font('agency_bold', 22)
    f_tag = get_font('arial_narrow_bold', 16)
    
    # Double Golden Era Barbell Rings
    draw.ellipse([cx - 105, cy - 95, cx + 105, cy + 95], outline=(42, 30, 20, 245), width=4)
    draw.ellipse([cx - 95, cy - 85, cx + 95, cy + 85], outline=(235, 175, 40, 245), width=3)
    
    # Heavy Olympic Barbell with multiple plates
    draw.rectangle([cx - 75, cy - 6, cx + 75, cy + 6], fill=(235, 175, 40, 250))
    # Plates
    draw.rectangle([cx - 65, cy - 30, cx - 55, cy + 30], fill=(42, 30, 20, 250))
    draw.rectangle([cx - 50, cy - 24, cx - 42, cy + 24], fill=(235, 175, 40, 250))
    draw.rectangle([cx + 55, cy - 30, cx + 65, cy + 30], fill=(42, 30, 20, 250))
    draw.rectangle([cx + 42, cy - 24, cx + 50, cy + 24], fill=(235, 175, 40, 250))
    
    draw_spaced_text(draw, 'EARN YOUR', 310, f_arch, (42, 30, 20, 250), spacing=3)
    draw.rectangle([cx - 145, cy + 20, cx + 145, cy + 50], fill=(42, 30, 20, 245))
    draw_spaced_text(draw, 'EST. 1977 // VENICE', cy + 24, f_vintage, (235, 175, 40, 250), spacing=2)
    draw_spaced_text(draw, 'STRENGTH', 560, f_sub, (215, 40, 35, 250), spacing=4)
    draw_spaced_text(draw, 'GOLDEN ERA BARBELL CLUB // CALIFORNIA', 625, f_tag, (65, 48, 35, 220), spacing=1)

def run():
    print('Generating 12 polished, authentic multi-colored designer apparel images...')
    
    # 9. Respawn Mode (Heather Ash Grey)
    ash_grey = make_base_shirt([175, 178, 183], [125, 128, 133], [220, 222, 225])
    composite_and_save(ash_grey, draw_respawn_mode, 'respawn-mode-tshirt.png')
    
    # 10. Night Raid (Deep Blackberry Plum)
    plum = make_base_shirt([65, 30, 52], [38, 16, 30], [105, 50, 85])
    composite_and_save(plum, draw_night_raid, 'night-raid-tshirt.png')
    
    # 11. Level Up (Vintage Sage Khaki)
    sage = make_base_shirt([95, 110, 85], [58, 70, 52], [140, 160, 128])
    composite_and_save(sage, draw_level_up, 'level-up-tshirt.png')
    
    # 12. Critical Hit (Dark Charcoal Melange)
    charcoal = make_base_shirt([48, 50, 54], [25, 26, 28], [80, 84, 90])
    composite_and_save(charcoal, draw_critical_hit, 'critical-hit-tshirt.png')
    
    # 13. Cyber Player (Washed Petrol Teal)
    teal = make_base_shirt([45, 80, 95], [26, 48, 58], [75, 125, 145])
    composite_and_save(teal, draw_cyber_player, 'cyber-player-tshirt.png')
    
    # 14. Game Over Never (Vanilla Cream)
    cream = make_base_shirt([232, 226, 212], [180, 172, 158], [255, 252, 245])
    composite_and_save(cream, draw_game_over_never, 'game-over-never-tshirt.png')
    
    # 15. Built Different (Vintage Washed Mineral Black)
    mineral_black = make_base_shirt([42, 42, 45], [20, 20, 22], [75, 75, 80], is_acid_wash=True)
    composite_and_save(mineral_black, draw_built_different, 'built-different-tshirt.png')
    
    # 16. No Days Off (Athletic Melange Grey)
    melange = make_base_shirt([150, 152, 158], [105, 108, 114], [195, 198, 205])
    composite_and_save(melange, draw_no_days_off, 'no-days-off-tshirt.png')
    
    # 17. Discipline (Tactical Military Olive Green)
    olive = make_base_shirt([65, 78, 52], [40, 48, 32], [102, 122, 82])
    composite_and_save(olive, draw_discipline, 'discipline-tshirt.png')
    
    # 18. Train Insane (Deep Crimson Rust Red)
    crimson = make_base_shirt([125, 42, 46], [75, 24, 26], [178, 62, 68])
    composite_and_save(crimson, draw_train_insane, 'train-insane-tshirt.png')
    
    # 19. Iron Mind (Industrial Steel Slate Blue)
    slate = make_base_shirt([72, 90, 110], [42, 54, 68], [115, 140, 170])
    composite_and_save(slate, draw_iron_mind, 'iron-mind-tshirt.png')
    
    # 20. Earn Your Strength (Warm Camel Tan)
    camel = make_base_shirt([185, 152, 118], [130, 102, 75], [235, 198, 158])
    composite_and_save(camel, draw_earn_your_strength, 'earn-your-strength-tshirt.png')
    
    print('All 12 items rendered and saved successfully!')

if __name__ == '__main__':
    run()
