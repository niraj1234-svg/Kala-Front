import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cv2

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_IMAGES = os.path.join(BASE_DIR, 'client', 'images')
PUBLIC_IMAGES = os.path.join(BASE_DIR, 'client', 'public', 'images')
PUBLIC_PRODUCTS = os.path.join(BASE_DIR, 'client', 'public', 'products')

SIZE = 2048
CENTER_X = SIZE // 2

# Load the perfect textured blank black tee and upscale to 2048
BLANK_PATH = os.path.join(BASE_DIR, 'scripts', 'blanks', 'inpaint_textured.png')
raw_cv2 = cv2.imread(BLANK_PATH)
base_cv2 = cv2.resize(raw_cv2, (SIZE, SIZE), interpolation=cv2.INTER_LANCZOS4)
base_rgb = cv2.cvtColor(base_cv2, cv2.COLOR_BGR2RGB).astype(np.float32)

# Compute fabric folds and mask at 2048
shirt_mask = np.mean(base_rgb, axis=2) < 95
lum = cv2.cvtColor(base_cv2, cv2.COLOR_BGR2GRAY).astype(np.float32)
shirt_lum = lum[shirt_mask]
p_min, p_max = np.percentile(shirt_lum, 3), np.percentile(shirt_lum, 97)
norm_fabric = np.clip((lum - p_min) / (p_max - p_min), 0.0, 1.0)

# Feather shirt mask
mask_im = Image.fromarray((shirt_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.0))
feathered_mask = np.array(mask_im).astype(np.float32)[:, :, np.newaxis] / 255.0

# Fonts
FONTS_DIR = 'C:/Windows/Fonts'
def get_font(name, size):
    font_map = {
        'impact': os.path.join(FONTS_DIR, 'impact.ttf'),
        'arial': os.path.join(FONTS_DIR, 'arial.ttf'),
        'arial_bold': os.path.join(FONTS_DIR, 'arialbd.ttf'),
        'arial_narrow_bold': os.path.join(FONTS_DIR, 'ARIALNB.TTF'),
        'georgia': os.path.join(FONTS_DIR, 'georgia.ttf'),
        'georgia_bold': os.path.join(FONTS_DIR, 'georgiab.ttf'),
        'times_bold': os.path.join(FONTS_DIR, 'timesbd.ttf'),
        'rock_bold': os.path.join(FONTS_DIR, 'ROCKB.TTF'),
        'gothic_bold': os.path.join(FONTS_DIR, 'GOTHICB.TTF'),
        'segoe_bold': os.path.join(FONTS_DIR, 'segoeuib.ttf'),
        'agency_bold': os.path.join(FONTS_DIR, 'AGENCYB.TTF'),
        'japanese_bold': os.path.join(FONTS_DIR, 'YuGothB.ttc'),
        'japanese_gothic': os.path.join(FONTS_DIR, 'msgothic.ttc'),
    }
    path = font_map.get(name, font_map['arial_bold'])
    if os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

def draw_spaced_text(draw, text, y, font, fill, width=SIZE, spacing=4, center_x=CENTER_X):
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

def draw_arched_text(draw, text, cx, cy, radius, font, fill, start_angle=-60, sweep_angle=120):
    n = len(text)
    if n <= 1:
        draw_spaced_text(draw, text, cy - radius, font, fill, center_x=cx)
        return
    step = sweep_angle / (n - 1)
    for i, ch in enumerate(text):
        ang_deg = start_angle + i * step
        ang_rad = math.radians(ang_deg - 90)
        px = cx + radius * math.cos(ang_rad)
        py = cy + radius * math.sin(ang_rad)
        bbox = draw.textbbox((0, 0), ch, font=font)
        cw, ch_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((px - cw//2, py - ch_h//2), ch, font=font, fill=fill)

def make_base_shirt(base_rgb_val, shadow_rgb=None, highlight_rgb=None, is_acid_wash=False):
    if shadow_rgb is None:
        shadow_rgb = [c * 0.62 for c in base_rgb_val]
    if highlight_rgb is None:
        highlight_rgb = [min(255, c * 1.38) for c in base_rgb_val]
        
    c_shadow = np.array(shadow_rgb, dtype=np.float32)
    c_highlight = np.array(highlight_rgb, dtype=np.float32)
    colored = c_shadow + norm_fabric[:, :, np.newaxis] * (c_highlight - c_shadow)
    
    if is_acid_wash:
        noise_im = Image.fromarray((np.random.rand(SIZE//12, SIZE//12) * 255).astype(np.uint8)).resize((SIZE, SIZE), Image.Resampling.BILINEAR)
        noise_arr = (np.array(noise_im).astype(np.float32) - 128) * 0.24
        colored = np.clip(colored + noise_arr[:, :, np.newaxis], 15, 245)
        
    out = base_rgb * (1.0 - feathered_mask) + colored * feathered_mask
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert('RGBA')

def composite_and_save(base_im, draw_graphic_func, filename):
    graphic = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(graphic)
    draw_graphic_func(draw, SIZE, SIZE)
    
    # 1. Soft ink drop shadow on fabric
    ink_shadow = graphic.filter(ImageFilter.GaussianBlur(3.5))
    
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
    print(f'[SUCCESS 4K] Created {filename}')

# =========================================================================
# 1. Keep Moving Forward (Black - Samurai, Rising Sun, Cherry Blossoms, Kanji)
# =========================================================================
def draw_keep_moving_forward(draw, w, h):
    cx, cy = 1024, 910
    f_kanji = get_font('japanese_bold', 76)
    f_sub = get_font('arial_bold', 28)
    
    # Crimson Rising Sun
    sun_r = 310
    draw.ellipse([cx - sun_r, cy - 250, cx + sun_r, cy + 370], fill=(215, 35, 35, 250))
    
    # Samurai ink-wash silhouette & robes
    # Head & Topknot
    draw.ellipse([cx - 42, cy - 145, cx + 42, cy - 65], fill=(20, 20, 22, 255))
    draw.polygon([(cx - 20, cy - 145), (cx, cy - 210), (cx + 25, cy - 150)], fill=(20, 20, 22, 255))
    draw.ellipse([cx - 5, cy - 220, cx + 25, cy - 190], fill=(20, 20, 22, 255))
    # Katana scabbard angled across back
    draw.line([cx - 160, cy + 180, cx + 180, cy - 160], fill=(240, 240, 240, 240), width=10)
    draw.line([cx - 160, cy + 180, cx + 180, cy - 160], fill=(20, 20, 22, 255), width=6)
    draw.rectangle([cx + 140, cy - 130, cx + 175, cy - 110], fill=(215, 35, 35, 255))
    # Traditional Kimono Robes
    body_pts = [
        (cx - 50, cy - 70), (cx + 55, cy - 65),
        (cx + 170, cy + 60), (cx + 195, cy + 280),
        (cx + 120, cy + 330), (cx - 140, cy + 330),
        (cx - 180, cy + 260), (cx - 150, cy + 50)
    ]
    draw.polygon(body_pts, fill=(24, 24, 28, 255))
    # Kimono fold highlights
    draw.line([(cx - 40, cy - 40), (cx + 60, cy + 140)], fill=(235, 235, 240, 220), width=8)
    draw.line([(cx + 40, cy - 40), (cx - 30, cy + 130)], fill=(200, 200, 205, 220), width=6)
    draw.line([(cx - 110, cy + 80), (cx - 50, cy + 260)], fill=(210, 210, 215, 200), width=5)
    draw.line([(cx + 120, cy + 80), (cx + 60, cy + 260)], fill=(210, 210, 215, 200), width=5)
    
    # Cherry blossom sakura branches & floating petals
    draw.line([cx + 130, cy + 220, cx + 280, cy + 120], fill=(120, 60, 40, 255), width=8)
    draw.line([cx + 220, cy + 160, cx + 310, cy + 200], fill=(120, 60, 40, 255), width=6)
    for px, py in [(cx + 250, cy + 110), (cx + 290, cy + 125), (cx + 220, cy + 145), (cx + 280, cy + 190), (cx + 320, cy + 195), (cx + 170, cy + 180)]:
        draw.ellipse([px - 14, py - 14, px + 14, py + 14], fill=(255, 185, 200, 240))
        draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(255, 255, 255, 255))
    # Floating petals
    for px, py in [(cx - 80, cy - 80), (cx + 80, cy - 180), (cx - 150, cy + 60), (cx + 220, cy + 300)]:
        draw.ellipse([px - 10, py - 6, px + 10, py + 6], fill=(255, 175, 195, 230))
        
    # Vertical Japanese Calligraphy Kanji: 進み続ける
    draw_vertical_text(draw, '進み続ける', cx - 290, cy - 190, f_kanji, (255, 255, 255, 255), spacing=20)
    
    # Subtitle
    draw_spaced_text(draw, 'KEEP MOVING FORWARD', cy + 365, f_sub, (255, 255, 255, 245), spacing=4)

# =========================================================================
# 2. Wander More (Vintage Cream - Mountain Range, Pine Forest, "WANDER more")
# =========================================================================
def draw_wander_more(draw, w, h):
    cx, cy = 1024, 910
    f_wander = get_font('georgia_bold', 105)
    f_more = get_font('georgia', 48)
    f_sub = get_font('arial_bold', 24)
    
    # Typography
    draw_spaced_text(draw, 'WANDER', cy - 250, f_wander, (28, 42, 58, 250), spacing=8)
    draw_spaced_text(draw, '— more —', cy - 135, f_more, (28, 42, 58, 230), spacing=4)
    
    # Snowy Alpine Mountain Range
    # Back mountain
    draw.polygon([(cx - 380, cy + 220), (cx - 160, cy - 70), (cx + 60, cy + 220)], fill=(75, 98, 125, 240))
    # Main high peak
    draw.polygon([(cx - 180, cy + 220), (cx + 30, cy - 130), (cx + 280, cy + 220)], fill=(40, 60, 84, 255))
    # Right peak
    draw.polygon([(cx + 100, cy + 220), (cx + 260, cy - 30), (cx + 420, cy + 220)], fill=(65, 88, 112, 240))
    
    # Snowcaps on peaks
    draw.polygon([(cx - 160, cy - 70), (cx - 120, cy - 10), (cx - 160, cy + 15), (cx - 190, cy - 15)], fill=(255, 255, 255, 255))
    draw.polygon([(cx + 30, cy - 130), (cx + 90, cy - 30), (cx + 40, cy + 5), (cx - 20, cy - 40)], fill=(255, 255, 255, 255))
    draw.polygon([(cx + 260, cy - 30), (cx + 300, cy + 30), (cx + 270, cy + 50), (cx + 230, cy + 20)], fill=(255, 255, 255, 255))
    
    # Mountain ridge lines
    draw.line([(cx + 30, cy - 130), (cx + 15, cy + 220)], fill=(255, 255, 255, 180), width=4)
    draw.line([(cx - 160, cy - 70), (cx - 180, cy + 220)], fill=(255, 255, 255, 180), width=3)
    
    # Evergreen Pine Forest at base
    pines_x = np.linspace(cx - 360, cx + 380, 24)
    for px in pines_x:
        ph = np.random.randint(60, 110)
        py = cy + 220
        draw.polygon([(px - 14, py), (px, py - ph), (px + 14, py)], fill=(24, 38, 52, 255))
    
    draw.rectangle([cx - 280, cy + 235, cx + 280, cy + 238], fill=(28, 42, 58, 220))
    draw_spaced_text(draw, 'DISCOVER THE UNKNOWN  //  EST. 2024', cy + 255, f_sub, (65, 80, 100, 230), spacing=3)

# =========================================================================
# 3. Brooklyn Varsity (Forest Green - Arched "BROOKLYN", "NEW YORK")
# =========================================================================
def draw_brooklyn_varsity(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('impact', 125)
    f_sub = get_font('arial_bold', 38)
    f_div = get_font('arial_bold', 28)
    
    # Double Arched Varsity Lettering: BROOKLYN
    draw_arched_text(draw, 'BROOKLYN', cx, cy - 20, 480, f_main, (255, 255, 255, 255), start_angle=-62, sweep_angle=124)
    
    # Accent line & subtext
    line_y = cy + 60
    draw.line([cx - 240, line_y, cx - 110, line_y], fill=(255, 255, 255, 240), width=4)
    draw.line([cx + 110, line_y, cx + 240, line_y], fill=(255, 255, 255, 240), width=4)
    draw_spaced_text(draw, 'NEW YORK', line_y - 20, f_sub, (255, 255, 255, 255), spacing=5)
    
    # Year stamp
    draw_spaced_text(draw, 'ATHLETICS DIVISION  //  AUTHENTIC', line_y + 60, f_div, (200, 225, 210, 230), spacing=3)

# =========================================================================
# 4. Good Things Take Time (Black - Clean Minimal Typography + Underline)
# =========================================================================
def draw_good_things(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('arial_bold', 68)
    f_sub = get_font('arial_bold', 24)
    
    draw_spaced_text(draw, 'GOOD THINGS', cy - 80, f_main, (250, 250, 250, 255), spacing=6)
    draw_spaced_text(draw, 'TAKE TIME', cy + 15, f_main, (250, 250, 250, 255), spacing=6)
    
    # Minimalist horizontal underline bar
    draw.rectangle([cx - 70, cy + 125, cx + 70, cy + 131], fill=(250, 250, 250, 255))
    draw_spaced_text(draw, 'PATIENCE & PERSEVERANCE', cy + 165, f_sub, (160, 165, 175, 220), spacing=3)

# =========================================================================
# 5. Out Of Office (Cream - 70s Sedan, Striped Sunset, Palm Trees, "OUT OF OFFICE")
# =========================================================================
def draw_out_of_office(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('impact', 110)
    f_sub = get_font('arial_bold', 28)
    
    draw_spaced_text(draw, 'OUT OF OFFICE', cy - 250, f_main, (32, 34, 38, 255), spacing=6)
    
    # 70s Retro Striped Sunset Oval
    sun_w, sun_h = 560, 240
    sy = cy - 80
    stripes = [
        (255, 105, 45, sy - 80, 24),
        (255, 135, 55, sy - 50, 24),
        (255, 165, 65, sy - 20, 24),
        (255, 195, 75, sy + 10, 24),
        (255, 220, 95, sy + 40, 24),
    ]
    for r, g, b, y_pos, thick in stripes:
        draw.ellipse([cx - sun_w//2, y_pos, cx + sun_w//2, y_pos + thick + 10], fill=(r, g, b, 230))
        
    # Silhouette Palm Trees on Left and Right
    for px, flip in [(cx - 210, 1), (cx + 210, -1)]:
        draw.line([px, cy + 120, px + 20 * flip, cy - 80], fill=(32, 34, 38, 255), width=8)
        # Leaves
        for ang in [-70, -35, 0, 35, 70]:
            rad = math.radians(ang)
            lx = px + 20 * flip + 85 * math.cos(rad) * flip
            ly = cy - 80 + 40 * math.sin(rad)
            draw.line([px + 20 * flip, cy - 80, lx, ly], fill=(32, 34, 38, 255), width=5)
            
    # Classic 1970s Sedan Muscle Car in Foreground
    car_y = cy + 100
    # Car body lower
    draw.polygon([(cx - 280, car_y + 35), (cx + 290, car_y + 35), (cx + 280, car_y - 15), (cx - 270, car_y - 15)], fill=(40, 48, 54, 255))
    # Car cabin & windows
    draw.polygon([(cx - 170, car_y - 15), (cx - 110, car_y - 65), (cx + 140, car_y - 65), (cx + 195, car_y - 15)], fill=(28, 34, 38, 255))
    # Windows
    draw.polygon([(cx - 100, car_y - 20), (cx - 85, car_y - 58), (cx + 30, car_y - 58), (cx + 30, car_y - 20)], fill=(225, 235, 245, 220))
    draw.polygon([(cx + 40, car_y - 20), (cx + 40, car_y - 58), (cx + 130, car_y - 58), (cx + 175, car_y - 20)], fill=(225, 235, 245, 220))
    # Bumpers & lights
    draw.rectangle([cx - 285, car_y + 15, cx - 270, car_y + 35], fill=(210, 215, 220, 255))
    draw.rectangle([cx + 275, car_y + 15, cx + 295, car_y + 35], fill=(255, 60, 40, 255))
    # Chrome side trim
    draw.line([cx - 270, car_y + 10, cx + 280, car_y + 10], fill=(220, 225, 230, 240), width=4)
    # Wheels with chrome hubcaps
    for wx in [cx - 180, cx + 180]:
        draw.ellipse([wx - 34, car_y + 15, wx + 34, car_y + 83], fill=(20, 20, 22, 255))
        draw.ellipse([wx - 18, car_y + 31, wx + 18, car_y + 67], fill=(220, 225, 230, 255))
        draw.ellipse([wx - 6, car_y + 43, wx + 6, car_y + 55], fill=(20, 20, 22, 255))
        
    draw_spaced_text(draw, 'CALIFORNIA HIGHWAY 1  //  WEEKEND ESCAPE', car_y + 120, f_sub, (65, 70, 80, 230), spacing=3)

# =========================================================================
# 6. Discipline Builds Freedom (Deep Forest Green - Collegiate Arched + Barbell)
# =========================================================================
def draw_discipline_builds_freedom(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('impact', 115)
    f_sub = get_font('arial_bold', 42)
    f_tag = get_font('arial_bold', 26)
    
    # Arched DISCIPLINE
    draw_arched_text(draw, 'DISCIPLINE', cx, cy - 40, 460, f_main, (255, 255, 255, 255), start_angle=-60, sweep_angle=120)
    
    # Heavy Barbell
    by = cy + 80
    draw.rectangle([cx - 260, by - 10, cx + 260, by + 10], fill=(255, 255, 255, 255))
    # 45lb Plates outer & inner
    for side in [-1, 1]:
        px = cx + side * 210
        draw.rectangle([px - 14, by - 65, px + 14, by + 65], fill=(255, 255, 255, 255))
        px2 = cx + side * 175
        draw.rectangle([px2 - 12, by - 55, px2 + 12, by + 55], fill=(240, 240, 240, 255))
        px3 = cx + side * 145
        draw.rectangle([px3 - 10, by - 45, px3 + 10, by + 45], fill=(225, 225, 225, 255))
        # Collar
        draw.rectangle([cx + side * 125 - 6, by - 16, cx + side * 125 + 6, by + 16], fill=(255, 255, 255, 255))
    # Center knurling
    draw.rectangle([cx - 30, by - 12, cx + 30, by + 12], fill=(255, 255, 255, 255))
    
    # Subtitle: BUILDS FREEDOM
    draw_spaced_text(draw, 'BUILDS FREEDOM', by + 105, f_sub, (255, 255, 255, 255), spacing=5)
    draw_spaced_text(draw, 'DAILY HABITS  //  UNYIELDING WILL', by + 170, f_tag, (190, 225, 205, 220), spacing=3)

# =========================================================================
# 7. Feel Everything (Acid Wash Charcoal - Classical David Statue + Red Censor Bar)
# =========================================================================
def draw_feel_everything(draw, w, h):
    cx, cy = 1024, 910
    f_sub = get_font('arial_bold', 38)
    f_tag = get_font('arial_bold', 24)
    
    # David Bust Silhouette & Anatomy Shading
    # Torso & Shoulders
    draw.polygon([(cx - 240, cy + 260), (cx + 240, cy + 260), (cx + 170, cy + 90), (cx - 190, cy + 90)], fill=(210, 210, 215, 240))
    draw.polygon([(cx - 70, cy + 90), (cx + 60, cy + 90), (cx + 50, cy - 20), (cx - 60, cy - 20)], fill=(225, 225, 230, 255))
    # Head & classical curls
    draw.polygon([(cx - 100, cy - 10), (cx + 90, cy - 10), (cx + 110, cy - 140), (cx - 110, cy - 140)], fill=(235, 235, 240, 255))
    # Hair volume curls
    draw.ellipse([cx - 120, cy - 200, cx + 110, cy - 90], fill=(195, 195, 205, 255))
    draw.ellipse([cx - 90, cy - 220, cx + 80, cy - 130], fill=(220, 220, 230, 255))
    # Facial shading shadows
    draw.polygon([(cx - 40, cy - 80), (cx + 10, cy - 80), (cx, cy + 20), (cx - 30, cy + 30)], fill=(155, 155, 165, 220))
    # Classical nose & chin
    draw.polygon([(cx - 15, cy - 70), (cx + 15, cy - 40), (cx - 10, cy - 25)], fill=(245, 245, 250, 255))
    draw.rectangle([cx - 35, cy + 5, cx + 25, cy + 25], fill=(190, 190, 200, 255))
    
    # BOLD VIBRANT SOLID RED CENSOR BLOCK OVER EYES
    draw.rectangle([cx - 145, cy - 85, cx + 135, cy - 35], fill=(255, 25, 35, 255))
    
    # Subtitle: FEEL EVERYTHING
    draw_spaced_text(draw, 'FEEL EVERYTHING', cy + 300, f_sub, (250, 250, 250, 255), spacing=8)
    draw_spaced_text(draw, 'RENAISSANCE STATUARY  //  RAW EMOTION', cy + 355, f_tag, (170, 175, 185, 220), spacing=3)

# =========================================================================
# 8. Lost In The Right Direction (Crisp White - Ocean Swell Photo Frame + Text)
# =========================================================================
def draw_lost_in_direction(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('impact', 72)
    f_coord = get_font('arial_bold', 26)
    
    # Framed ocean landscape on Left
    fx1, fy1, fx2, fy2 = cx - 340, cy - 180, cx - 20, cy + 220
    # Ocean background
    draw.rectangle([fx1, fy1, fx2, fy2], fill=(20, 45, 75, 255), outline=(32, 34, 38, 255), width=4)
    # Ocean horizon & swells
    draw.rectangle([fx1, fy1, fx2, fy1 + 140], fill=(60, 95, 135, 255))
    for oy in range(fy1 + 140, fy2, 28):
        pts = [(fx1, oy)]
        for ox in range(fx1, fx2, 30):
            pts.append((ox, oy + int(math.sin(ox * 0.05) * 8)))
        pts.extend([(fx2, fy2), (fx1, fy2)])
        draw.polygon(pts, fill=(15, 38, 62, 230))
        
    # Typographic Block on Right
    tx = cx + 50
    ty = cy - 140
    lines = ['LOST', 'IN THE', 'RIGHT', 'DIRECTION']
    for i, line in enumerate(lines):
        draw_spaced_text(draw, line, ty + i * 78, f_main, (24, 26, 30, 255), spacing=4, center_x=cx + 170)
        
    # Latitude / Longitude coordinates
    draw_spaced_text(draw, 'LAT 45° 18\' N  //  LON 122° 40\' W', cy + 260, f_coord, (90, 95, 105, 230), spacing=3)

# =========================================================================
# 9. Moon Friend (Mocha Brown - Astronaut, Cratered Moon, Earth Balloon Orb, Stars)
# =========================================================================
def draw_moon_friend(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('impact', 76)
    f_sub = get_font('arial_bold', 28)
    
    # Cratered Moon surface
    moon_cy = cy + 160
    draw.ellipse([cx - 280, moon_cy - 120, cx + 280, moon_cy + 220], fill=(225, 220, 210, 255))
    # Moon craters
    for crx, cry, crr in [(cx - 140, moon_cy + 10, 28), (cx - 60, moon_cy + 70, 36), (cx + 80, moon_cy + 20, 42), (cx + 160, moon_cy + 60, 25)]:
        draw.ellipse([crx - crr, cry - crr//2, crx + crr, cry + crr//2], fill=(185, 180, 170, 240))
        
    # Sitting Astronaut
    ax, ay = cx - 50, cy - 30
    # Backpack
    draw.rounded_rectangle([ax - 95, ay - 60, ax - 45, ay + 60], radius=16, fill=(210, 210, 215, 255))
    # Helmet & gold reflective visor
    draw.ellipse([ax - 48, ay - 110, ax + 48, ay - 14], fill=(245, 245, 250, 255))
    draw.ellipse([ax - 10, ay - 95, ax + 44, ay - 30], fill=(245, 160, 35, 255), outline=(255, 255, 255, 255), width=3)
    # Torso
    draw.rounded_rectangle([ax - 45, ay - 15, ax + 40, ay + 75], radius=14, fill=(240, 240, 245, 255))
    # Sitting Legs
    draw.rounded_rectangle([ax - 20, ay + 65, ax + 85, ay + 115], radius=14, fill=(230, 230, 235, 255))
    # Boots
    draw.rounded_rectangle([ax + 75, ay + 80, ax + 115, ay + 125], radius=8, fill=(200, 200, 205, 255))
    
    # Earth Balloon held by string
    ex, ey = cx + 140, cy - 140
    draw.line([ax + 20, ay + 10, ex, ey + 45], fill=(240, 240, 245, 220), width=3)
    # Earth Orb
    draw.ellipse([ex - 48, ey - 48, ex + 48, ey + 48], fill=(35, 115, 215, 255), outline=(255, 255, 255, 255), width=2)
    # Green continents
    draw.ellipse([ex - 28, ey - 20, ex + 10, ey + 15], fill=(55, 185, 85, 255))
    draw.ellipse([ex + 5, ey - 35, ex + 35, ey - 10], fill=(55, 185, 85, 255))
    
    # Tiny Stars & Sparkles
    for sx, sy in [(cx - 240, cy - 180), (cx - 160, cy - 220), (cx + 260, cy - 80), (cx + 220, cy - 240)]:
        draw.line([sx - 12, sy, sx + 12, sy], fill=(255, 255, 255, 240), width=3)
        draw.line([sx, sy - 12, sx, sy + 12], fill=(255, 255, 255, 240), width=3)
        
    draw_spaced_text(draw, 'MOON FRIEND', cy + 300, f_main, (245, 240, 235, 255), spacing=6)
    draw_spaced_text(draw, 'SPACE EXPLORATION  //  SOLITARY WONDER', cy + 375, f_sub, (200, 180, 165, 220), spacing=3)

# =========================================================================
# 10. Anti Social Club (Black - Distressed Typography + Dripping Pink Smiley)
# =========================================================================
def draw_anti_social_club(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('impact', 125)
    f_sub = get_font('arial_bold', 28)
    
    # Heavy Stencil / Distressed Font: ANTI SOCIAL CLUB
    draw_spaced_text(draw, 'ANTI', cy - 220, f_main, (245, 245, 250, 255), spacing=8)
    draw_spaced_text(draw, 'SOCIAL', cy - 90, f_main, (245, 245, 250, 255), spacing=8)
    draw_spaced_text(draw, 'CLUB', cy + 40, f_main, (245, 245, 250, 255), spacing=8)
    
    # Neon Hot-Pink Dripping Spray-Paint Smiley Face (Overlapping right)
    sx, sy, sr = cx + 140, cy + 140, 95
    draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], outline=(255, 20, 147, 250), width=10)
    # X Eyes
    for ex in [sx - 35, sx + 35]:
        draw.line([ex - 16, sy - 35, ex + 16, sy - 3], fill=(255, 20, 147, 255), width=8)
        draw.line([ex + 16, sy - 35, ex - 16, sy - 3], fill=(255, 20, 147, 255), width=8)
    # Wide dripping smile
    draw.arc([sx - 55, sy - 15, sx + 55, sy + 55], 20, 160, fill=(255, 20, 147, 255), width=9)
    # Dripping spray-paint runs
    for dx, dlen in [(sx - 45, 75), (sx, 110), (sx + 45, 85), (sx + 75, 55)]:
        draw.line([dx, sy + 45, dx, sy + 45 + dlen], fill=(255, 20, 147, 255), width=6)
        draw.ellipse([dx - 5, sy + 45 + dlen - 5, dx + 5, sy + 45 + dlen + 5], fill=(255, 20, 147, 255))
        
    draw_spaced_text(draw, 'REJECT CONFORMITY  //  UNDERGROUND', cy + 300, f_sub, (160, 160, 170, 220), spacing=4)

# =========================================================================
# 11. Evolve (Crisp White - Blue Morpho Butterfly, Gold Crown, "EVOLVE")
# =========================================================================
def draw_evolve(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('impact', 115)
    f_sub = get_font('arial_bold', 34)
    
    # Gold Coronet Crown floating above
    c_y = cy - 230
    crown_pts = [
        (cx - 55, c_y), (cx - 70, c_y - 45), (cx - 25, c_y - 20),
        (cx, c_y - 55), (cx + 25, c_y - 20), (cx + 70, c_y - 45),
        (cx + 55, c_y)
    ]
    draw.polygon(crown_pts, fill=(245, 175, 35, 255), outline=(220, 140, 20, 255), width=3)
    for px, py in [(cx - 70, c_y - 45), (cx, c_y - 55), (cx + 70, c_y - 45)]:
        draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(255, 255, 255, 255))
        
    # Blue Morpho Butterfly
    by = cy - 60
    # Left Forewing & Hindwing
    draw.polygon([(cx - 8, by - 20), (cx - 240, by - 140), (cx - 280, by - 40), (cx - 180, by + 40), (cx - 10, by + 10)], fill=(0, 130, 245, 250))
    draw.polygon([(cx - 8, by + 15), (cx - 190, by + 60), (cx - 150, by + 160), (cx - 50, by + 150), (cx - 8, by + 50)], fill=(0, 85, 195, 250))
    # Right Forewing & Hindwing
    draw.polygon([(cx + 8, by - 20), (cx + 240, by - 140), (cx + 280, by - 40), (cx + 180, by + 40), (cx + 10, by + 10)], fill=(0, 130, 245, 250))
    draw.polygon([(cx + 8, by + 15), (cx + 190, by + 60), (cx + 150, by + 160), (cx + 50, by + 150), (cx + 8, by + 50)], fill=(0, 85, 195, 250))
    # Wing Iridescent Cyan Highlights
    draw.polygon([(cx - 20, by - 20), (cx - 190, by - 110), (cx - 150, by - 10)], fill=(65, 225, 255, 220))
    draw.polygon([(cx + 20, by - 20), (cx + 190, by - 110), (cx + 150, by - 10)], fill=(65, 225, 255, 220))
    # Black borders and veins
    draw.line([cx - 8, by - 20, cx - 240, by - 140], fill=(20, 24, 30, 240), width=6)
    draw.line([cx + 8, by - 20, cx + 240, by - 140], fill=(20, 24, 30, 240), width=6)
    # Butterfly Body & Antennae
    draw.ellipse([cx - 9, by - 65, cx + 9, by + 85], fill=(20, 24, 30, 255))
    draw.arc([cx - 35, by - 100, cx, by - 55], 180, 310, fill=(20, 24, 30, 255), width=3)
    draw.arc([cx, by - 100, cx + 35, by - 55], 230, 360, fill=(20, 24, 30, 255), width=3)
    
    # Typography: EVOLVE
    draw_spaced_text(draw, 'EVOLVE', cy + 180, f_main, (24, 26, 30, 255), spacing=8)
    draw_spaced_text(draw, 'A BETTER VERSION OF ME', cy + 295, f_sub, (55, 60, 70, 230), spacing=4)

# =========================================================================
# 12. Beyond Reality (Black - Anime Eyes Manga Panel, Kanji, "BEYOND REALITY")
# =========================================================================
def draw_beyond_reality(draw, w, h):
    cx, cy = 1024, 910
    f_kanji = get_font('japanese_bold', 64)
    f_sub = get_font('arial_bold', 28)
    
    # Horizontal Rectangular Manga Box
    bx1, by1, bx2, by2 = cx - 320, cy - 120, cx + 320, cy + 90
    draw.rectangle([bx1, by1, bx2, by2], fill=(245, 245, 250, 255), outline=(255, 255, 255, 255), width=5)
    
    # Manga Eyes Details (Left & Right Eye)
    for eye_cx in [cx - 150, cx + 150]:
        # Upper sharp anime eyelid
        draw.line([eye_cx - 95, cy - 10, eye_cx, cy - 45], fill=(20, 20, 22, 255), width=10)
        draw.line([eye_cx, cy - 45, eye_cx + 95, cy - 20], fill=(20, 20, 22, 255), width=12)
        # Lower eyelid
        draw.line([eye_cx - 70, cy + 35, eye_cx + 70, cy + 30], fill=(20, 20, 22, 255), width=6)
        # Iris & Pupil
        draw.ellipse([eye_cx - 40, cy - 40, eye_cx + 40, cy + 30], fill=(30, 32, 38, 255))
        draw.ellipse([eye_cx - 22, cy - 25, eye_cx + 22, cy + 15], fill=(10, 10, 12, 255))
        # Dramatic white shine reflections
        draw.ellipse([eye_cx - 24, cy - 30, eye_cx - 6, cy - 12], fill=(255, 255, 255, 255))
        draw.ellipse([eye_cx + 10, cy + 5, eye_cx + 20, cy + 15], fill=(255, 255, 255, 255))
        # Eyebrow angled intently
        draw.line([eye_cx - 105, cy - 70, eye_cx + 90, cy - 55], fill=(20, 20, 22, 255), width=10)
        # Manga speed hatching lines
        for hx in range(eye_cx - 80, eye_cx + 81, 14):
            draw.line([hx, cy - 90, hx - 8, cy - 75], fill=(50, 50, 55, 200), width=2)
            
    # Japanese Kanji: 現実を超えて
    draw_spaced_text(draw, '現実を超えて', cy + 130, f_kanji, (255, 255, 255, 255), spacing=8)
    draw_spaced_text(draw, 'BEYOND REALITY', cy + 225, f_sub, (200, 200, 210, 230), spacing=5)

# =========================================================================
# 13. The Mountains Are Calling (Denim Blue - Alpine Peaks, Orange Moon)
# =========================================================================
def draw_mountains_calling(draw, w, h):
    cx, cy = 1024, 910
    f_the = get_font('arial_bold', 34)
    f_main = get_font('impact', 88)
    f_sub = get_font('arial_bold', 28)
    
    # Typography
    draw_spaced_text(draw, 'THE', cy - 235, f_the, (255, 255, 255, 240), spacing=6)
    draw_spaced_text(draw, 'MOUNTAINS', cy - 180, f_main, (255, 255, 255, 255), spacing=6)
    draw_spaced_text(draw, 'ARE CALLING', cy - 85, f_sub, (255, 255, 255, 240), spacing=5)
    
    # Glowing Orange Moon behind peaks
    draw.ellipse([cx + 120, cy - 100, cx + 220, cy], fill=(245, 125, 40, 245))
    
    # Detailed Snowy Mountain Ridges
    # Main center peak
    draw.polygon([(cx - 260, cy + 240), (cx - 20, cy - 40), (cx + 220, cy + 240)], fill=(32, 48, 68, 255))
    draw.polygon([(cx - 20, cy - 40), (cx + 35, cy + 40), (cx - 15, cy + 70), (cx - 60, cy + 20)], fill=(255, 255, 255, 255))
    # Right peak
    draw.polygon([(cx + 40, cy + 240), (cx + 180, cy + 10), (cx + 340, cy + 240)], fill=(45, 65, 88, 245))
    draw.polygon([(cx + 180, cy + 10), (cx + 220, cy + 65), (cx + 180, cy + 85), (cx + 145, cy + 50)], fill=(255, 255, 255, 255))
    # Snow ridge lines
    draw.line([(cx - 20, cy - 40), (cx - 40, cy + 240)], fill=(255, 255, 255, 200), width=4)
    draw.line([(cx + 180, cy + 10), (cx + 160, cy + 240)], fill=(255, 255, 255, 200), width=3)
    
    # Pine forest
    for px in np.linspace(cx - 300, cx + 320, 20):
        ph = np.random.randint(45, 85)
        draw.polygon([(px - 12, cy + 240), (px, cy + 240 - ph), (px + 12, cy + 240)], fill=(22, 34, 48, 255))

# =========================================================================
# 14. Bloom At Your Own Pace (Ecru Cream - Wildflowers / Sunflowers & Serif)
# =========================================================================
def draw_bloom_pace(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('georgia_bold', 68)
    f_sub = get_font('arial_bold', 24)
    
    # Editorial Serif Text on Left
    tx = cx - 180
    ty = cy - 80
    draw_spaced_text(draw, 'BLOOM', ty, f_main, (42, 44, 48, 255), spacing=4, center_x=tx)
    draw_spaced_text(draw, 'AT YOUR', ty + 80, f_main, (42, 44, 48, 255), spacing=4, center_x=tx)
    draw_spaced_text(draw, 'OWN PACE', ty + 160, f_main, (42, 44, 48, 255), spacing=4, center_x=tx)
    draw_spaced_text(draw, 'GROW IN HARMONY', ty + 245, f_sub, (95, 100, 110, 220), spacing=3, center_x=tx)
    
    # Botanical Wildflower Stems & Sunflowers on Right
    fx = cx + 180
    # Main stem
    draw.line([fx - 30, cy + 280, fx, cy - 140], fill=(60, 68, 52, 240), width=5)
    draw.line([fx + 40, cy + 280, fx + 80, cy - 40], fill=(60, 68, 52, 240), width=4)
    # Sunflower 1 (top)
    flx, fly = fx, cy - 140
    for ang in range(0, 360, 30):
        rad = math.radians(ang)
        px = flx + 55 * math.cos(rad)
        py = fly + 55 * math.sin(rad)
        draw.ellipse([px - 14, py - 14, px + 14, py + 14], fill=(225, 165, 45, 240))
    draw.ellipse([flx - 26, fly - 26, flx + 26, fly + 26], fill=(52, 38, 28, 255))
    # Wildflower 2 (lower right)
    flx2, fly2 = fx + 80, cy - 40
    for ang in range(0, 360, 36):
        rad = math.radians(ang)
        px = flx2 + 40 * math.cos(rad)
        py = fly2 + 40 * math.sin(rad)
        draw.ellipse([px - 10, py - 10, px + 10, py + 10], fill=(245, 195, 75, 240))
    draw.ellipse([flx2 - 18, fly2 - 18, flx2 + 18, fly2 + 18], fill=(52, 38, 28, 255))
    # Leaves
    draw.polygon([(fx - 15, cy + 40), (fx - 70, cy + 20), (fx - 30, cy + 70)], fill=(75, 88, 62, 240))
    draw.polygon([(fx + 10, cy + 120), (fx + 65, cy + 100), (fx + 25, cy + 150)], fill=(75, 88, 62, 240))

# =========================================================================
# 15. Inner Peace (Acid Wash Charcoal - Woodcut Tidal Wave Circle, Kanji "平和")
# =========================================================================
def draw_inner_peace(draw, w, h):
    cx, cy = 1024, 910
    f_kanji = get_font('japanese_bold', 92)
    f_sub = get_font('arial_bold', 38)
    f_div = get_font('arial_bold', 24)
    
    # Circular Woodcut Wave Crest
    crx, cry, crr = cx - 60, cy - 30, 240
    draw.ellipse([crx - crr, cry - crr, crx + crr, cry + crr], fill=(24, 26, 30, 255), outline=(245, 245, 250, 255), width=6)
    
    # Swirling Great Wave of Kanagawa linework inside circle
    # Foam swells
    for y_offset, w_mult in [(60, 1.0), (0, 0.8), (-60, 0.6)]:
        pts = [(crx - crr + 30, cry + y_offset)]
        for x in range(crx - crr + 30, crx + crr - 30, 25):
            y = cry + y_offset - int(math.sin((x - crx) * 0.02) * 55 * w_mult)
            pts.append((x, y))
        pts.extend([(crx + crr - 30, cry + crr - 20), (crx - crr + 30, cry + crr - 20)])
        draw.polygon(pts, fill=(45, 52, 62, 240), outline=(255, 255, 255, 255), width=3)
    # Wave spray claw foam
    for fx, fy in [(crx + 40, cry - 110), (crx + 90, cry - 70), (crx + 130, cry - 40)]:
        draw.line([fx, fy, fx - 25, fy + 25], fill=(255, 255, 255, 255), width=5)
        draw.ellipse([fx - 6, fy - 6, fx + 6, fy + 6], fill=(255, 255, 255, 255))
        
    # Vertical Japanese Kanji: 平和 (Peace) on the Right
    draw_vertical_text(draw, '平和', cx + 270, cy - 140, f_kanji, (255, 255, 255, 255), spacing=25)
    
    # Subtitle: INNER PEACE
    draw_spaced_text(draw, 'INNER PEACE', cy + 270, f_sub, (250, 250, 250, 255), spacing=8)
    draw_spaced_text(draw, 'STILLNESS WITHIN CHAOS', cy + 330, f_div, (180, 185, 195, 220), spacing=4)

# =========================================================================
# 16. Better Days Ahead (Maroon - Brush Script "BETTER DAYS AHEAD" + Stars)
# =========================================================================
def draw_better_days(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('impact', 115)
    f_sub = get_font('arial_bold', 28)
    
    # Dynamic Brush Script Lines
    draw_spaced_text(draw, 'BETTER', cy - 180, f_main, (255, 245, 235, 255), spacing=8)
    draw_spaced_text(draw, 'DAYS', cy - 50, f_main, (255, 245, 235, 255), spacing=8)
    draw_spaced_text(draw, 'AHEAD', cy + 80, f_main, (255, 245, 235, 255), spacing=8)
    
    # Golden 4-point sparkle starbursts
    for sx, sy, sr in [(cx - 260, cy - 100, 36), (cx + 250, cy + 20, 42), (cx - 210, cy + 180, 28)]:
        # Starburst diamond
        draw.polygon([(sx, sy - sr), (sx + sr//3, sy), (sx, sy + sr), (sx - sr//3, sy)], fill=(255, 175, 45, 255))
        draw.polygon([(sx - sr, sy), (sx, sy + sr//3), (sx + sr, sy), (sx, sy - sr//3)], fill=(255, 175, 45, 255))
        draw.ellipse([sx - sr//5, sy - sr//5, sx + sr//5, sy + sr//5], fill=(255, 255, 255, 255))
        
    draw_spaced_text(draw, 'HOPE & RESILIENCE  //  NEW HORIZONS', cy + 240, f_sub, (235, 185, 195, 230), spacing=4)

# =========================================================================
# 17. Create Your Own Reality (Vanilla Cream - 3D Puffy Graffiti "CREATE" + Star)
# =========================================================================
def draw_create_reality(draw, w, h):
    cx, cy = 1024, 910
    f_create = get_font('impact', 140)
    f_main = get_font('arial_bold', 48)
    f_sub = get_font('arial_bold', 26)
    
    # 3D Extruded Shadow for "CREATE"
    for offset in range(16, 0, -2):
        draw_spaced_text(draw, 'CREATE', cy - 150 + offset, f_create, (20, 24, 20, 255), spacing=10)
    # Emerald Green Vibrant Face
    draw_spaced_text(draw, 'CREATE', cy - 150, f_create, (35, 195, 85, 255), spacing=10)
    
    # Subtitle: YOUR OWN REALITY
    draw_spaced_text(draw, 'YOUR OWN REALITY', cy + 50, f_main, (24, 26, 30, 255), spacing=5)
    
    # Emerald 4-point star on right
    sx, sy, sr = cx + 290, cy + 75, 28
    draw.polygon([(sx, sy - sr), (sx + sr//3, sy), (sx, sy + sr), (sx - sr//3, sy)], fill=(35, 195, 85, 255))
    draw.polygon([(sx - sr, sy), (sx, sy + sr//3), (sx + sr, sy), (sx, sy - sr//3)], fill=(35, 195, 85, 255))
    
    draw_spaced_text(draw, 'IMAGINE  //  MANIFEST  //  TRANSCEND', cy + 150, f_sub, (90, 95, 105, 220), spacing=4)

# =========================================================================
# 18. Chaos Makes Better Stories (Black - Gothic "chaos", Purple Flames)
# =========================================================================
def draw_chaos_stories(draw, w, h):
    cx, cy = 1024, 910
    f_chaos = get_font('times_bold', 125)
    f_sub = get_font('arial_bold', 38)
    f_tag = get_font('arial_bold', 24)
    
    # Electric Violet / Purple Hot Flames
    flame_pts = [
        (cx - 240, cy + 40), (cx - 210, cy - 160), (cx - 160, cy - 40),
        (cx - 110, cy - 220), (cx - 60, cy - 80),
        (cx, cy - 260), (cx + 60, cy - 80),
        (cx + 110, cy - 220), (cx + 160, cy - 40),
        (cx + 210, cy - 160), (cx + 240, cy + 40)
    ]
    draw.polygon(flame_pts, fill=(160, 32, 240, 245))
    # Inner bright magenta flame core
    inner_flame = [
        (cx - 180, cy + 20), (cx - 140, cy - 100), (cx - 90, cy - 20),
        (cx, cy - 170), (cx + 90, cy - 20), (cx + 140, cy - 100),
        (cx + 180, cy + 20)
    ]
    draw.polygon(inner_flame, fill=(235, 60, 255, 250))
    
    # Gothic Lettering: chaos in white
    draw_spaced_text(draw, 'chaos', cy - 85, f_chaos, (255, 255, 255, 255), spacing=8)
    
    # Subtitle: MAKES BETTER STORIES
    draw_spaced_text(draw, 'MAKES BETTER STORIES', cy + 120, f_sub, (255, 255, 255, 255), spacing=5)
    draw_spaced_text(draw, 'EMBRACE THE UNEXPECTED', cy + 185, f_tag, (190, 160, 230, 220), spacing=3)

# =========================================================================
# 19. Still Here (Navy Blue - Human Skeleton Ribcage + Cyan Butterfly)
# =========================================================================
def draw_still_here(draw, w, h):
    cx, cy = 1024, 910
    f_sub = get_font('arial_bold', 38)
    f_tag = get_font('arial_bold', 24)
    
    # Detailed Anatomical Human Ribcage in Off-White Engraving
    # Spinal column
    draw.rectangle([cx - 12, cy - 160, cx + 12, cy + 220], fill=(245, 245, 250, 255))
    for vy in range(cy - 150, cy + 210, 28):
        draw.ellipse([cx - 24, vy - 10, cx + 24, vy + 10], fill=(235, 235, 245, 255))
    # Sternum
    draw.polygon([(cx - 22, cy - 130), (cx + 22, cy - 130), (cx + 14, cy + 20), (cx - 14, cy + 20)], fill=(250, 250, 255, 255))
    # Clavicles (collarbones)
    draw.arc([cx - 190, cy - 190, cx - 10, cy - 130], 20, 160, fill=(245, 245, 250, 255), width=10)
    draw.arc([cx + 10, cy - 190, cx + 190, cy - 130], 20, 160, fill=(245, 245, 250, 255), width=10)
    # Pairs of Ribs curving outward
    for i in range(8):
        ry = cy - 100 + i * 36
        rw = 110 + int(math.sin(i * 0.4) * 110)
        # Left rib
        draw.arc([cx - rw, ry - 30, cx - 10, ry + 35], 30, 190, fill=(240, 240, 245, 255), width=7)
        # Right rib
        draw.arc([cx + 10, ry - 30, cx + rw, ry + 35], -10, 150, fill=(240, 240, 245, 255), width=7)
        
    # Electric Cyan Butterfly perched on left clavicle
    bx, by = cx + 130, cy - 190
    draw.polygon([(bx, by), (bx - 55, by - 45), (bx - 65, by + 10), (bx, by + 15)], fill=(0, 230, 255, 255))
    draw.polygon([(bx, by), (bx + 55, by - 45), (bx + 65, by + 10), (bx, by + 15)], fill=(0, 230, 255, 255))
    draw.ellipse([bx - 4, by - 15, bx + 4, by + 20], fill=(20, 25, 35, 255))
    
    # Subtitle: STILL HERE
    draw_spaced_text(draw, 'STILL HERE', cy + 270, f_sub, (250, 250, 250, 255), spacing=8)
    draw_spaced_text(draw, 'ENDURANCE & BEAUTY  //  MEMENTO VIVERE', cy + 325, f_tag, (165, 185, 215, 220), spacing=3)

# =========================================================================
# 20. Nature Heals (Military Olive - Framed Misty Forest Photo + Serif Text)
# =========================================================================
def draw_nature_heals(draw, w, h):
    cx, cy = 1024, 910
    f_main = get_font('georgia_bold', 68)
    f_tag = get_font('arial_bold', 24)
    
    # Typography: NATURE HEALS
    draw_spaced_text(draw, 'NATURE', cy - 250, f_main, (245, 245, 240, 255), spacing=8)
    draw_spaced_text(draw, 'HEALS', cy - 170, f_main, (245, 245, 240, 255), spacing=8)
    
    # Framed Misty Alpine Pine Forest Landscape
    fx1, fy1, fx2, fy2 = cx - 240, cy - 70, cx + 240, cy + 240
    # Mountain backdrop
    draw.rectangle([fx1, fy1, fx2, fy2], fill=(42, 54, 46, 255), outline=(245, 245, 240, 255), width=4)
    draw.polygon([(fx1, fy1 + 130), (cx - 70, fy1 + 40), (cx + 80, fy1 + 90), (fx2, fy1 + 20), (fx2, fy2), (fx1, fy2)], fill=(65, 78, 70, 240))
    # Dense Evergreen Pines in Foreground
    for px in range(fx1, fx2 + 1, 16):
        ph = np.random.randint(60, 130)
        draw.polygon([(px - 14, fy2), (px, fy2 - ph), (px + 14, fy2)], fill=(22, 32, 25, 255))
        
    draw_spaced_text(draw, 'SACRED SILENCE  //  CASCADE WILDERNESS', cy + 280, f_tag, (200, 210, 195, 220), spacing=3)

# =========================================================================
# Main Generator Runner
# =========================================================================
def run():
    print('Generating all 20 Ultra-HD 4K Apparel Images matching the catalog...')
    
    # 1. Keep Moving Forward (Black)
    black1 = make_base_shirt([22, 22, 24])
    composite_and_save(black1, draw_keep_moving_forward, 'keep-moving-forward-tshirt.png')
    
    # 2. Wander More (Vintage Cream)
    cream1 = make_base_shirt([244, 239, 230], [195, 188, 175], [255, 255, 252])
    composite_and_save(cream1, draw_wander_more, 'wander-more-tshirt.png')
    
    # 3. Brooklyn Varsity (Deep Forest Green)
    green1 = make_base_shirt([30, 56, 43], [16, 32, 24], [52, 92, 70])
    composite_and_save(green1, draw_brooklyn_varsity, 'brooklyn-varsity-tshirt.png')
    
    # 4. Good Things Take Time (Black)
    black2 = make_base_shirt([20, 20, 22])
    composite_and_save(black2, draw_good_things, 'good-things-take-time-tshirt.png')
    
    # 5. Out Of Office (Cream)
    cream2 = make_base_shirt([245, 239, 228], [195, 188, 175], [255, 255, 252])
    composite_and_save(cream2, draw_out_of_office, 'out-of-office-tshirt.png')
    
    # 6. Discipline Builds Freedom (Deep Green)
    green2 = make_base_shirt([27, 51, 38], [15, 30, 22], [48, 85, 64])
    composite_and_save(green2, draw_discipline_builds_freedom, 'discipline-builds-freedom-tshirt.png')
    
    # 7. Feel Everything (Acid Wash Charcoal)
    acid1 = make_base_shirt([46, 46, 50], [24, 24, 26], [75, 75, 80], is_acid_wash=True)
    composite_and_save(acid1, draw_feel_everything, 'feel-everything-tshirt.png')
    
    # 8. Lost In The Right Direction (Crisp White)
    white1 = make_base_shirt([248, 248, 250], [200, 200, 205], [255, 255, 255])
    composite_and_save(white1, draw_lost_in_direction, 'lost-in-the-right-direction-tshirt.png')
    
    # 9. Moon Friend (Mocha Brown)
    brown1 = make_base_shirt([74, 51, 38], [42, 28, 20], [115, 82, 62])
    composite_and_save(brown1, draw_moon_friend, 'moon-friend-tshirt.png')
    
    # 10. Anti Social Club (Washed Black)
    black3 = make_base_shirt([26, 26, 28], is_acid_wash=True)
    composite_and_save(black3, draw_anti_social_club, 'anti-social-club-tshirt.png')
    
    # 11. Evolve (Crisp White)
    white2 = make_base_shirt([248, 248, 250], [200, 200, 205], [255, 255, 255])
    composite_and_save(white2, draw_evolve, 'evolve-tshirt.png')
    
    # 12. Beyond Reality (Jet Black)
    black4 = make_base_shirt([18, 18, 20])
    composite_and_save(black4, draw_beyond_reality, 'beyond-reality-tshirt.png')
    
    # 13. The Mountains Are Calling (Denim Blue)
    blue1 = make_base_shirt([59, 78, 99], [32, 45, 60], [95, 125, 155])
    composite_and_save(blue1, draw_mountains_calling, 'the-mountains-are-calling-tshirt.png')
    
    # 14. Bloom At Your Own Pace (Oatmeal Cream)
    cream3 = make_base_shirt([243, 238, 228], [195, 188, 175], [255, 255, 252])
    composite_and_save(cream3, draw_bloom_pace, 'bloom-at-your-own-pace-tshirt.png')
    
    # 15. Inner Peace (Acid Wash Charcoal)
    acid2 = make_base_shirt([44, 44, 48], [24, 24, 26], [75, 75, 80], is_acid_wash=True)
    composite_and_save(acid2, draw_inner_peace, 'inner-peace-tshirt.png')
    
    # 16. Better Days Ahead (Maroon Burgundy)
    maroon1 = make_base_shirt([94, 31, 41], [54, 16, 22], [145, 52, 68])
    composite_and_save(maroon1, draw_better_days, 'better-days-ahead-tshirt.png')
    
    # 17. Create Your Own Reality (Vanilla Cream)
    cream4 = make_base_shirt([245, 239, 229], [195, 188, 175], [255, 255, 252])
    composite_and_save(cream4, draw_create_reality, 'create-your-own-reality-tshirt.png')
    
    # 18. Chaos Makes Better Stories (Black)
    black5 = make_base_shirt([18, 18, 20])
    composite_and_save(black5, draw_chaos_stories, 'chaos-makes-better-stories-tshirt.png')
    
    # 19. Still Here (Navy Blue)
    navy1 = make_base_shirt([35, 43, 62], [18, 24, 36], [60, 75, 105])
    composite_and_save(navy1, draw_still_here, 'still-here-tshirt.png')
    
    # 20. Nature Heals (Military Olive)
    olive1 = make_base_shirt([58, 68, 46], [34, 42, 26], [95, 112, 75])
    composite_and_save(olive1, draw_nature_heals, 'nature-heals-tshirt.png')
    
    print('All 20 Ultra-HD 4K products created successfully!')

if __name__ == '__main__':
    run()
