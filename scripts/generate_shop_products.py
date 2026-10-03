import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_IMAGES = os.path.join(BASE_DIR, 'client', 'images')
PUBLIC_IMAGES = os.path.join(BASE_DIR, 'client', 'public', 'images')
PUBLIC_PRODUCTS = os.path.join(BASE_DIR, 'client', 'public', 'products')

TEMPLATE_PATH = os.path.join(BASE_DIR, 'client', 'public', 'mockups', 'tshirt-black-front.png')

# Fonts
def get_font(name, size):
    fonts_dir = 'C:/Windows/Fonts'
    font_map = {
        'bold': os.path.join(fonts_dir, 'arialbd.ttf'),
        'black': os.path.join(fonts_dir, 'impact.ttf'),
        'heavy': os.path.join(fonts_dir, 'segoeuib.ttf'),
        'mono': os.path.join(fonts_dir, 'consolab.ttf'),
        'regular': os.path.join(fonts_dir, 'arial.ttf'),
    }
    path = font_map.get(name, font_map['bold'])
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def draw_centered_text(draw, text, y, font, fill, width=1024, tracking=0):
    if tracking == 0:
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = (width - tw) // 2
        draw.text((x, y), text, font=font, fill=fill)
        return bbox[3] - bbox[1]
    else:
        # Space out letters
        spaced_text = ' '.join(list(text)) if tracking == 1 else (' ' * tracking).join(list(text))
        bbox = draw.textbbox((0, 0), spaced_text, font=font)
        tw = bbox[2] - bbox[0]
        x = (width - tw) // 2
        draw.text((x, y), spaced_text, font=font, fill=fill)
        return bbox[3] - bbox[1]

def create_mockup(draw_func, filename):
    template = Image.open(TEMPLATE_PATH).convert('RGBA')
    w, h = template.size
    
    # Render graphic on transparent layer
    graphic = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(graphic)
    draw_func(draw, w, h)
    
    # Add subtle shadow to the print so it looks embedded on fabric
    shadow = graphic.filter(ImageFilter.GaussianBlur(radius=2))
    
    # Composite: template + shadow + graphic
    composite = Image.alpha_composite(template, graphic)
    
    # Convert to RGB with clean neutral background matching studio setup
    # Neutral background: #f3f4f6 (matches existing mockups)
    bg = Image.new('RGB', (w, h), (243, 244, 246))
    bg.paste(composite, (0, 0), composite)
    
    # Save to all target locations
    for target_dir in [CLIENT_IMAGES, PUBLIC_IMAGES, PUBLIC_PRODUCTS]:
        os.makedirs(target_dir, exist_ok=True)
        dest = os.path.join(target_dir, filename)
        bg.save(dest, 'PNG', optimize=True)
    print(f'[SUCCESS] Created {filename}')

# =========================================================================
# 1. Midnight Tokyo T-Shirt
# =========================================================================
def draw_midnight_tokyo(draw, w, h):
    cx, cy = 512, 470
    bw, bh = 280, 260
    left, top = cx - bw // 2, cy - bh // 2
    right, bottom = left + bw, top + bh
    
    # Dark Japanese night box
    draw.rectangle([left, top, right, bottom], fill=(13, 17, 23, 255), outline=(0, 242, 254, 220), width=2)
    
    # Glowing neon moon circle
    draw.ellipse([cx - 40, top + 25, cx + 40, top + 105], fill=(247, 37, 133, 200), outline=(255, 255, 255, 240), width=2)
    
    # Cyber skyline silhouettes
    buildings = [
        (left + 15, bottom - 120, 25, 120),
        (left + 45, bottom - 150, 30, 150),
        (left + 80, bottom - 110, 20, 110),
        (left + 105, bottom - 170, 35, 170), # tower
        (left + 145, bottom - 130, 25, 130),
        (left + 175, bottom - 160, 30, 160),
        (left + 210, bottom - 125, 25, 125),
        (left + 240, bottom - 95, 25, 95),
    ]
    for bx, by, bw_b, bh_b in buildings:
        draw.rectangle([bx, by, bx + bw_b, bottom], fill=(5, 7, 10, 255))
        # Small neon windows
        for wy in range(by + 12, bottom - 10, 18):
            draw.rectangle([bx + 6, wy, bx + bw_b - 6, wy + 4], fill=(0, 242, 254, 180))
            
    # Original hooded wanderer silhouette
    draw.ellipse([cx - 12, bottom - 75, cx + 12, bottom - 51], fill=(247, 37, 133, 255))
    draw.polygon([(cx - 18, bottom), (cx + 18, bottom), (cx + 12, bottom - 52), (cx - 12, bottom - 52)], fill=(5, 7, 10, 255))
    
    # Japanese katakana
    f_sub = get_font('bold', 15)
    draw_centered_text(draw, "ミッドナイト・トーキョー", top + 10, f_sub, (247, 37, 133, 255))
    
    # Main Title
    f_main = get_font('black', 32)
    draw_centered_text(draw, "MIDNIGHT TOKYO", bottom + 12, f_main, (255, 255, 255, 255))
    
    # Technical subtitle
    f_tech = get_font('mono', 12)
    draw_centered_text(draw, "SHINJUKU CYBER DISTRICT // 03:00 AM", bottom + 48, f_tech, (0, 242, 254, 255), tracking=1)

# =========================================================================
# 2. No Signal T-Shirt
# =========================================================================
def draw_no_signal(draw, w, h):
    cx, cy = 512, 470
    bw, bh = 280, 220
    left, top = cx - bw // 2, cy - bh // 2
    right, bottom = left + bw, top + bh
    
    # CRT Frame
    draw.rectangle([left, top, right, bottom], fill=(10, 10, 12, 255), outline=(255, 255, 255, 180), width=2)
    
    # Glitch CRT scanlines
    for y in range(top + 8, bottom - 8, 8):
        draw.line([(left + 10, y), (right - 10, y)], fill=(30, 35, 45, 200), width=1)
        
    # Audio frequency wave bars in center
    wave_bars = [15, 25, 45, 70, 95, 120, 90, 60, 110, 130, 85, 40, 65, 100, 115, 80, 50, 30]
    bar_w = 10
    start_x = cx - (len(wave_bars) * (bar_w + 3)) // 2
    for i, bh_bar in enumerate(wave_bars):
        bx = start_x + i * (bar_w + 3)
        # Cyan glitch
        draw.rectangle([bx - 1, cy - bh_bar // 2 - 1, bx + bar_w - 1, cy + bh_bar // 2 - 1], fill=(0, 242, 254, 150))
        # White center
        draw.rectangle([bx, cy - bh_bar // 2, bx + bar_w, cy + bh_bar // 2], fill=(255, 255, 255, 240))
        
    # Glitched NO SIGNAL typography with chromatic shift
    f_title = get_font('black', 40)
    ty = bottom + 12
    # Cyan shift
    draw_centered_text(draw, "NO SIGNAL", ty, f_title, (0, 242, 254, 180))
    # Red shift
    draw_centered_text(draw, "NO SIGNAL", ty + 2, f_title, (239, 68, 68, 180))
    # White main
    draw_centered_text(draw, "NO SIGNAL", ty + 1, f_title, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "SYSTEM OFFLINE // FREQUENCY 404.0 MHZ", bottom + 56, f_sub, (156, 163, 175, 255), tracking=1)

# =========================================================================
# 3. After Dark T-Shirt
# =========================================================================
def draw_after_dark(draw, w, h):
    cx, cy = 512, 460
    r = 130
    
    # Outer circle
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(12, 14, 20, 255), outline=(245, 158, 11, 200), width=2)
    
    # Glowing crescent moon
    draw.ellipse([cx - 50, cy - 100, cx + 50, cy], fill=(245, 158, 11, 230))
    draw.ellipse([cx - 35, cy - 110, cx + 55, cy - 10], fill=(12, 14, 20, 255))
    
    # Stars
    stars = [(cx - 70, cy - 60), (cx + 60, cy - 70), (cx - 40, cy - 30), (cx + 80, cy - 20), (cx - 85, cy + 10)]
    for sx, sy in stars:
        draw.polygon([(sx, sy - 4), (sx + 2, sy), (sx, sy + 4), (sx - 2, sy)], fill=(255, 255, 255, 220))
        
    # Cityscape silhouette inside circle
    base_y = cy + 60
    draw.rectangle([cx - 90, base_y - 45, cx - 60, cy + r], fill=(0, 0, 0, 255))
    draw.rectangle([cx - 55, base_y - 70, cx - 25, cy + r], fill=(0, 0, 0, 255))
    draw.rectangle([cx - 20, base_y - 90, cx + 15, cy + r], fill=(0, 0, 0, 255))
    draw.rectangle([cx + 20, base_y - 60, cx + 55, cy + r], fill=(0, 0, 0, 255))
    draw.rectangle([cx + 60, base_y - 40, cx + 85, cy + r], fill=(0, 0, 0, 255))
    
    # Wanderer silhouette
    draw.ellipse([cx - 6, base_y - 30, cx + 6, base_y - 18], fill=(245, 158, 11, 255))
    draw.polygon([(cx - 8, base_y), (cx + 8, base_y), (cx + 5, base_y - 18), (cx - 5, base_y - 18)], fill=(255, 255, 255, 255))
    
    # Typography
    f_main = get_font('heavy', 30)
    draw_centered_text(draw, "AFTER DARK", cy + r + 20, f_main, (255, 255, 255, 255), tracking=1)
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "NIGHTFALL STREETWEAR // EDITION 2026", cy + r + 56, f_sub, (245, 158, 11, 240), tracking=1)

# =========================================================================
# 4. Lost In Thought T-Shirt
# =========================================================================
def draw_lost_in_thought(draw, w, h):
    cx, cy = 512, 460
    
    # Celestial rings
    draw.ellipse([cx - 130, cy - 80, cx + 130, cy + 80], outline=(192, 132, 252, 180), width=2)
    draw.ellipse([cx - 100, cy - 110, cx + 100, cy + 110], outline=(103, 232, 249, 160), width=1)
    
    # Original anime-inspired head silhouette profile (facing right)
    points = [
        (cx - 20, cy - 70), (cx + 10, cy - 75), (cx + 35, cy - 55),
        (cx + 40, cy - 40), (cx + 30, cy - 25), (cx + 42, cy - 15), # nose
        (cx + 32, cy - 5), (cx + 38, cy + 5), # lips
        (cx + 25, cy + 20), (cx + 15, cy + 35), # chin
        (cx - 5, cy + 45), (cx - 30, cy + 50), # jaw
        (cx - 45, cy + 10), (cx - 50, cy - 35), # back of head
    ]
    draw.polygon(points, fill=(240, 240, 245, 255))
    # Hair accents
    hair_spikes = [(cx - 25, cy - 85), (cx + 5, cy - 90), (cx - 40, cy - 65), (cx - 60, cy - 20)]
    for hx, hy in hair_spikes:
        draw.line([(cx - 20, cy - 50), (hx, hy)], fill=(192, 132, 252, 255), width=3)
        
    # Orbiting star sparkles
    sparkles = [(cx + 90, cy - 60), (cx - 95, cy + 45), (cx + 70, cy + 70), (cx - 80, cy - 50)]
    for sx, sy in sparkles:
        draw.line([(sx - 8, sy), (sx + 8, sy)], fill=(255, 255, 255, 240), width=2)
        draw.line([(sx, sy - 8), (sx, sy + 8)], fill=(255, 255, 255, 240), width=2)
        
    f_main = get_font('heavy', 30)
    draw_centered_text(draw, "LOST IN THOUGHT", cy + 120, f_main, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "MIND OVER MATTER // ENDLESS HORIZON", cy + 156, f_sub, (192, 132, 252, 255), tracking=1)

# =========================================================================
# 5. Offline Society T-Shirt
# =========================================================================
def draw_offline_society(draw, w, h):
    cx, cy = 512, 470
    
    # Outer box border with corner crosshairs
    bw, bh = 290, 260
    left, top = cx - bw // 2, cy - bh // 2
    right, bottom = left + bw, top + bh
    
    draw.rectangle([left, top, right, bottom], outline=(255, 255, 255, 230), width=2)
    
    # Corner crosses
    cross_sz = 8
    for px, py in [(left, top), (right, top), (left, bottom), (right, bottom)]:
        draw.line([(px - cross_sz, py), (px + cross_sz, py)], fill=(255, 255, 255, 255), width=2)
        draw.line([(px, py - cross_sz), (px, py + cross_sz)], fill=(255, 255, 255, 255), width=2)
        
    # Headline text
    f_big = get_font('black', 46)
    draw_centered_text(draw, "OFFLINE", top + 25, f_big, (255, 255, 255, 255))
    draw_centered_text(draw, "SOCIETY", top + 75, f_big, (255, 255, 255, 255))
    
    # Divider rule
    draw.line([(left + 25, top + 135), (right - 25, top + 135)], fill=(255, 255, 255, 180), width=1)
    
    # Barcode
    bx_start = cx - 100
    by_start = top + 155
    bar_pattern = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3]
    curr_x = bx_start
    for bw_val in bar_pattern:
        draw.rectangle([curr_x, by_start, curr_x + bw_val, by_start + 45], fill=(255, 255, 255, 255))
        curr_x += bw_val + 3
        
    f_bar_num = get_font('mono', 11)
    draw_centered_text(draw, "0  8 4 7 2 9   1 0 4 8 2  6", by_start + 50, f_bar_num, (255, 255, 255, 200))
    
    f_foot = get_font('mono', 11)
    draw_centered_text(draw, "DISCONNECT TO RECONNECT // EST. 2026", bottom + 16, f_foot, (156, 163, 175, 255), tracking=1)

# =========================================================================
# 6. Future Is Loading T-Shirt
# =========================================================================
def draw_future_is_loading(draw, w, h):
    cx, cy = 512, 470
    
    # Header
    f_head = get_font('black', 34)
    draw_centered_text(draw, "FUTURE IS LOADING...", cy - 80, f_head, (255, 255, 255, 255))
    
    # Segmented progress bar
    bar_w, bar_h = 300, 36
    bx, by = cx - bar_w // 2, cy - 25
    draw.rectangle([bx, by, bx + bar_w, by + bar_h], fill=(15, 23, 42, 255), outline=(6, 182, 212, 255), width=2)
    
    # Progress blocks (85% filled)
    num_blocks = 14
    filled_blocks = 12
    block_width = (bar_w - (num_blocks + 1) * 4) // num_blocks
    for i in range(num_blocks):
        block_x = bx + 4 + i * (block_width + 4)
        if i < filled_blocks:
            draw.rectangle([block_x, by + 4, block_x + block_width, by + bar_h - 4], fill=(6, 182, 212, 255))
        else:
            draw.rectangle([block_x, by + 4, block_x + block_width, by + bar_h - 4], fill=(30, 41, 59, 255))
            
    # Percentage display
    f_pct = get_font('black', 22)
    draw_centered_text(draw, "85% COMPLETE", cy + 28, f_pct, (16, 185, 129, 255))
    
    # System telemetry lines
    f_sys = get_font('mono', 12)
    draw_centered_text(draw, "INITIALIZING SYSTEM // PROTOCOL V.26", cy + 68, f_sys, (148, 163, 184, 255), tracking=1)
    draw_centered_text(draw, "OPTIMIZING ASSETS [OK] • CONNECTED [OK]", cy + 88, f_sys, (6, 182, 212, 220), tracking=1)

# =========================================================================
# 7. Rebel Mind T-Shirt
# =========================================================================
def draw_rebel_mind(draw, w, h):
    cx, cy = 512, 460
    
    # Red grunge diamond background
    draw.polygon([(cx, cy - 110), (cx + 120, cy), (cx, cy + 110), (cx - 120, cy)], outline=(239, 68, 68, 220), width=3)
    
    # Masked rebel silhouette illustration
    # Spiky anime hair
    hair = [
        (cx - 50, cy - 40), (cx - 70, cy - 75), (cx - 35, cy - 65),
        (cx - 20, cy - 95), (cx, cy - 70), (cx + 20, cy - 95),
        (cx + 35, cy - 65), (cx + 70, cy - 75), (cx + 50, cy - 40)
    ]
    draw.polygon(hair, fill=(255, 255, 255, 255))
    
    # Head & mask
    draw.polygon([(cx - 40, cy - 35), (cx + 40, cy - 35), (cx + 35, cy + 40), (cx, cy + 65), (cx - 35, cy + 40)], fill=(17, 24, 39, 255), outline=(239, 68, 68, 255), width=2)
    
    # Fierce sharp eyes
    draw.polygon([(cx - 30, cy - 10), (cx - 8, cy - 5), (cx - 18, cy + 2)], fill=(239, 68, 68, 255))
    draw.polygon([(cx + 30, cy - 10), (cx + 8, cy - 5), (cx + 18, cy + 2)], fill=(239, 68, 68, 255))
    
    # Respirator / mask vents
    draw.line([(cx - 15, cy + 25), (cx + 15, cy + 25)], fill=(255, 255, 255, 200), width=2)
    draw.line([(cx - 10, cy + 35), (cx + 10, cy + 35)], fill=(255, 255, 255, 200), width=2)
    draw.line([(cx - 5, cy + 45), (cx + 5, cy + 45)], fill=(255, 255, 255, 200), width=2)
    
    # Typography
    f_title = get_font('black', 40)
    draw_centered_text(draw, "REBEL MIND", cy + 120, f_title, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "BREAK THE NORM // ZERO COMPROMISE", cy + 162, f_sub, (239, 68, 68, 255), tracking=1)

# =========================================================================
# 8. Urban Chaos T-Shirt
# =========================================================================
def draw_urban_chaos(draw, w, h):
    cx, cy = 512, 460
    
    # Wireframe grid & isometric boxes
    for offset in range(-100, 110, 40):
        draw.line([(cx - 120, cy + offset), (cx + 120, cy + offset)], fill=(75, 85, 99, 140), width=1)
        draw.line([(cx + offset, cy - 100), (cx + offset, cy + 100)], fill=(75, 85, 99, 140), width=1)
        
    # Diagonal hazard stripe bar
    draw.polygon([(cx - 140, cy - 25), (cx + 140, cy - 65), (cx + 140, cy - 35), (cx - 140, cy + 5)], fill=(234, 88, 12, 230))
    
    # Bold central typography
    f_main = get_font('black', 42)
    draw_centered_text(draw, "URBAN", cy - 10, f_main, (255, 255, 255, 255))
    draw_centered_text(draw, "CHAOS", cy + 34, f_main, (234, 88, 12, 255))
    
    # Subtitle
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "CONCRETE JUNGLE // RAW STREETWEAR", cy + 115, f_sub, (209, 213, 219, 255), tracking=1)

# =========================================================================
# 9. Respawn Mode T-Shirt
# =========================================================================
def draw_respawn_mode(draw, w, h):
    cx, cy = 512, 460
    r = 110
    
    # Outer tactical radar ring
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(249, 115, 22, 220), width=2)
    draw.ellipse([cx - r + 15, cy - r + 15, cx + r - 15, cy + r - 15], outline=(255, 255, 255, 120), width=1)
    
    # Radar sweep ticks
    for angle in range(0, 360, 45):
        rad = math.radians(angle)
        x1 = cx + (r - 12) * math.cos(rad)
        y1 = cy + (r - 12) * math.sin(rad)
        x2 = cx + r * math.cos(rad)
        y2 = cy + r * math.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=(249, 115, 22, 255), width=2)
        
    # Central Respawn Infinity / Arrow Loop
    draw.arc([cx - 45, cy - 35, cx + 5, cy + 35], start=45, end=315, fill=(255, 255, 255, 255), width=4)
    draw.arc([cx - 5, cy - 35, cx + 45, cy + 35], start=225, end=135, fill=(249, 115, 22, 255), width=4)
    # Arrow heads
    draw.polygon([(cx - 2, cy - 38), (cx + 6, cy - 30), (cx + 6, cy - 44)], fill=(255, 255, 255, 255))
    
    # Crosshairs
    draw.line([(cx, cy - 25), (cx, cy + 25)], fill=(239, 68, 68, 220), width=2)
    draw.line([(cx - 25, cy), (cx + 25, cy)], fill=(239, 68, 68, 220), width=2)
    
    # Typography
    f_main = get_font('black', 36)
    draw_centered_text(draw, "RESPAWN MODE", cy + r + 20, f_main, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "LIVES: INFINITE // PRESS START TO CONTINUE", cy + r + 58, f_sub, (249, 115, 22, 255), tracking=1)

# =========================================================================
# 10. Night Raid T-Shirt
# =========================================================================
def draw_night_raid(draw, w, h):
    cx, cy = 512, 460
    
    # Hexagonal tactical background
    hex_r = 100
    hex_pts = []
    for i in range(6):
        angle = math.radians(60 * i + 30)
        hex_pts.append((cx + hex_r * math.cos(angle), cy + hex_r * math.sin(angle)))
    draw.polygon(hex_pts, outline=(20, 184, 166, 220), width=2)
    
    # Tactical Operative Visor
    draw.polygon([(cx - 50, cy - 10), (cx + 50, cy - 10), (cx + 40, cy + 15), (cx - 40, cy + 15)], fill=(20, 184, 166, 255))
    draw.line([(cx - 45, cy + 2), (cx + 45, cy + 2)], fill=(255, 255, 255, 240), width=2)
    
    # Helmet silhouette
    draw.polygon([(cx - 55, cy - 45), (cx + 55, cy - 45), (cx + 60, cy - 10), (cx + 45, cy + 50), (cx - 45, cy + 50), (cx - 60, cy - 10)], outline=(255, 255, 255, 220), width=2)
    
    # Typography
    f_title = get_font('black', 38)
    draw_centered_text(draw, "NIGHT RAID", cy + 115, f_title, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "TACTICAL GAMING DIVISION // 00:00 HRS", cy + 155, f_sub, (20, 184, 166, 255), tracking=1)

# =========================================================================
# 11. Level Up T-Shirt
# =========================================================================
def draw_level_up(draw, w, h):
    cx, cy = 512, 460
    
    # 3 Ascending Pixel Chevrons
    for i, offset_y in enumerate([-60, -10, 40]):
        color = (34, 197, 94, 255) if i == 0 else (132, 204, 22, 220) if i == 1 else (255, 255, 255, 200)
        # Chevron points
        pts = [
            (cx, cy + offset_y - 25),
            (cx + 60, cy + offset_y + 15),
            (cx + 40, cy + offset_y + 25),
            (cx, cy + offset_y - 5),
            (cx - 40, cy + offset_y + 25),
            (cx - 60, cy + offset_y + 15)
        ]
        draw.polygon(pts, fill=color)
        
    f_main = get_font('black', 44)
    draw_centered_text(draw, "LEVEL UP", cy + 95, f_main, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "+1000 EXP // NEXT TIER UNLOCKED", cy + 145, f_sub, (34, 197, 94, 255), tracking=1)

# =========================================================================
# 12. Critical Hit T-Shirt
# =========================================================================
def draw_critical_hit(draw, w, h):
    cx, cy = 512, 460
    
    # Shattered Energy Burst
    for angle in range(15, 360, 30):
        rad = math.radians(angle)
        length = 100 if (angle % 60 == 15) else 70
        x2 = cx + length * math.cos(rad)
        y2 = cy + length * math.sin(rad)
        color = (168, 85, 247, 240) if (angle % 60 == 15) else (56, 189, 248, 220)
        draw.line([(cx, cy), (x2, y2)], fill=color, width=3)
        
    # Central impact flash diamond
    draw.polygon([(cx, cy - 35), (cx + 35, cy), (cx, cy + 35), (cx - 35, cy)], fill=(255, 255, 255, 255))
    
    f_title = get_font('black', 40)
    draw_centered_text(draw, "CRITICAL HIT", cy + 110, f_title, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "100% DAMAGE // COMBO MULTIPLIER x99", cy + 152, f_sub, (168, 85, 247, 255), tracking=1)

# =========================================================================
# 13. Cyber Player T-Shirt
# =========================================================================
def draw_cyber_player(draw, w, h):
    cx, cy = 512, 460
    
    # Synthwave grid lines
    for x in range(cx - 120, cx + 130, 30):
        draw.line([(x, cy - 20), (cx + (x - cx) * 2, cy + 90)], fill=(236, 72, 153, 140), width=1)
    for y in range(cy - 20, cy + 100, 25):
        span = int(120 * (1 + (y - (cy - 20)) / 100))
        draw.line([(cx - span, y), (cx + span, y)], fill=(6, 182, 212, 150), width=1)
        
    # Cyber headset silhouette
    draw.arc([cx - 45, cy - 80, cx + 45, cy + 10], start=180, end=0, fill=(255, 255, 255, 255), width=4)
    draw.rectangle([cx - 50, cy - 45, cx - 38, cy - 15], fill=(236, 72, 153, 255))
    draw.rectangle([cx + 38, cy - 45, cx + 50, cy - 15], fill=(6, 182, 212, 255))
    
    # AR Visor
    draw.polygon([(cx - 35, cy - 25), (cx + 35, cy - 25), (cx + 30, cy - 5), (cx - 30, cy - 5)], fill=(6, 182, 212, 255))
    
    f_main = get_font('black', 36)
    draw_centered_text(draw, "CYBER PLAYER", cy + 115, f_main, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "NEON ESPORTS // SYNTHWAVE GENERATION", cy + 155, f_sub, (236, 72, 153, 255), tracking=1)

# =========================================================================
# 14. Game Over Never T-Shirt
# =========================================================================
def draw_game_over_never(draw, w, h):
    cx, cy = 512, 460
    
    # Retro D-Pad Icon
    dpad_sz = 26
    # Cross
    draw.rectangle([cx - dpad_sz // 2, cy - 75, cx + dpad_sz // 2, cy - 25], fill=(255, 255, 255, 255))
    draw.rectangle([cx - 50, cy - 50 - dpad_sz // 2, cx + 50, cy - 50 + dpad_sz // 2], fill=(255, 255, 255, 255))
    
    # Action Buttons (A, B)
    draw.ellipse([cx + 70, cy - 65, cx + 90, cy - 45], fill=(239, 68, 68, 255))
    draw.ellipse([cx + 95, cy - 45, cx + 115, cy - 25], fill=(245, 158, 11, 255))
    
    # Crossed-out GAME OVER
    f_go = get_font('black', 32)
    draw_centered_text(draw, "GAME OVER", cy + 10, f_go, (156, 163, 175, 200))
    # Strike-through bar
    draw.line([(cx - 105, cy + 26), (cx + 105, cy + 26)], fill=(239, 68, 68, 255), width=4)
    
    # Massive bold NEVER
    f_never = get_font('black', 48)
    draw_centered_text(draw, "NEVER", cy + 45, f_never, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "CONTINUE? // 9... 8... NO RETREAT", cy + 115, f_sub, (239, 68, 68, 255), tracking=1)

# =========================================================================
# 15. Built Different T-Shirt
# =========================================================================
def draw_built_different(draw, w, h):
    cx, cy = 512, 460
    
    # Diamond Plate Shield
    d = 95
    draw.polygon([(cx, cy - d), (cx + d, cy), (cx, cy + d), (cx - d, cy)], outline=(255, 255, 255, 240), width=3)
    draw.polygon([(cx, cy - d + 12), (cx + d - 12, cy), (cx, cy + d - 12), (cx - d + 12, cy)], outline=(148, 163, 184, 180), width=1)
    
    # Barbell inside
    draw.line([(cx - 50, cy), (cx + 50, cy)], fill=(255, 255, 255, 255), width=4)
    draw.rectangle([cx - 45, cy - 25, cx - 35, cy + 25], fill=(255, 255, 255, 255))
    draw.rectangle([cx + 35, cy - 25, cx + 45, cy + 25], fill=(255, 255, 255, 255))
    
    # Typography
    f_main = get_font('black', 40)
    draw_centered_text(draw, "BUILT DIFFERENT", cy + 115, f_main, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "UNMATCHED WORK ETHIC // FORGED IN IRON", cy + 158, f_sub, (209, 213, 219, 255), tracking=1)

# =========================================================================
# 16. No Days Off T-Shirt
# =========================================================================
def draw_no_days_off(draw, w, h):
    cx, cy = 512, 460
    
    # Stacked Big Text
    f_big = get_font('black', 52)
    draw_centered_text(draw, "NO", cy - 100, f_big, (255, 255, 255, 255))
    draw_centered_text(draw, "DAYS", cy - 45, f_big, (255, 255, 255, 255))
    draw_centered_text(draw, "OFF", cy + 10, f_big, (255, 255, 255, 255))
    
    # 7-Day Tracker Boxes [M][T][W][T][F][S][S]
    days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    box_sz = 26
    start_x = cx - (len(days) * (box_sz + 6)) // 2
    f_day = get_font('bold', 12)
    for i, d in enumerate(days):
        bx = start_x + i * (box_sz + 6)
        by = cy + 85
        draw.rectangle([bx, by, bx + box_sz, by + box_sz], fill=(255, 255, 255, 255))
        # Day letter in black
        bbox = draw.textbbox((0, 0), d, font=f_day)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((bx + (box_sz - tw) // 2, by + (box_sz - th) // 2 - 1), d, font=f_day, fill=(0, 0, 0, 255))
        
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "CONSISTENCY OVER INTENSITY", cy + 135, f_sub, (156, 163, 175, 255), tracking=1)

# =========================================================================
# 17. Discipline T-Shirt
# =========================================================================
def draw_discipline(draw, w, h):
    cx, cy = 512, 460
    
    # Classical Roman Pillar Frame
    col_w, col_h = 16, 140
    # Left pillar
    draw.rectangle([cx - 100, cy - 80, cx - 100 + col_w, cy + 60], fill=(255, 255, 255, 230))
    draw.rectangle([cx - 108, cy - 90, cx - 100 + col_w + 8, cy - 80], fill=(255, 255, 255, 255))
    draw.rectangle([cx - 108, cy + 60, cx - 100 + col_w + 8, cy + 70], fill=(255, 255, 255, 255))
    
    # Right pillar
    draw.rectangle([cx + 100 - col_w, cy - 80, cx + 100, cy + 60], fill=(255, 255, 255, 230))
    draw.rectangle([cx + 100 - col_w - 8, cy - 90, cx + 108, cy - 80], fill=(255, 255, 255, 255))
    draw.rectangle([cx + 100 - col_w - 8, cy + 60, cx + 108, cy + 70], fill=(255, 255, 255, 255))
    
    # Top Arch Beam / Barbell
    draw.line([(cx - 110, cy - 85), (cx + 110, cy - 85)], fill=(255, 255, 255, 255), width=5)
    
    # Centered Typography
    f_main = get_font('black', 34)
    draw_centered_text(draw, "DISCIPLINE", cy - 40, f_main, (255, 255, 255, 255))
    
    f_mid = get_font('bold', 18)
    draw_centered_text(draw, "OVER", cy, f_mid, (156, 163, 175, 240), tracking=2)
    
    draw_centered_text(draw, "MOTIVATION", cy + 25, f_main, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "PROVEN IN IRON // FORGED BY HABIT", cy + 100, f_sub, (209, 213, 219, 255), tracking=1)

# =========================================================================
# 18. Train Insane T-Shirt
# =========================================================================
def draw_train_insane(draw, w, h):
    cx, cy = 512, 460
    
    # Aggressive Shield Crest
    shield_pts = [
        (cx - 75, cy - 80), (cx + 75, cy - 80),
        (cx + 85, cy + 10), (cx, cy + 85), (cx - 85, cy + 10)
    ]
    draw.polygon(shield_pts, fill=(185, 28, 28, 220), outline=(255, 255, 255, 255), width=2)
    
    # Stylized Beast/Predator eye slits
    draw.polygon([(cx - 45, cy - 25), (cx - 15, cy - 18), (cx - 25, cy - 10)], fill=(255, 255, 255, 255))
    draw.polygon([(cx + 45, cy - 25), (cx + 15, cy - 18), (cx + 25, cy - 10)], fill=(255, 255, 255, 255))
    
    # Crossed Barbells
    draw.line([(cx - 50, cy + 30), (cx + 50, cy - 30)], fill=(255, 255, 255, 220), width=3)
    draw.line([(cx - 50, cy - 30), (cx + 50, cy + 30)], fill=(255, 255, 255, 220), width=3)
    
    # Heavy Typography
    f_main = get_font('black', 40)
    draw_centered_text(draw, "TRAIN INSANE", cy + 115, f_main, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "OR REMAIN THE SAME // MAXIMUM INTENSITY", cy + 158, f_sub, (239, 68, 68, 255), tracking=1)

# =========================================================================
# 19. Iron Mind T-Shirt
# =========================================================================
def draw_iron_mind(draw, w, h):
    cx, cy = 512, 460
    
    # Hexagonal Industrial Anvil / Dumbbell Frame
    r = 85
    pts = []
    for i in range(6):
        angle = math.radians(60 * i)
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(pts, fill=(30, 41, 59, 255), outline=(148, 163, 184, 255), width=3)
    
    # Heavy Anvil Graphic
    anvil_top = cy - 30
    draw.polygon([
        (cx - 50, anvil_top), (cx + 50, anvil_top),
        (cx + 40, anvil_top + 25), (cx + 15, anvil_top + 45),
        (cx + 35, anvil_top + 60), (cx - 35, anvil_top + 60),
        (cx - 15, anvil_top + 45), (cx - 40, anvil_top + 25)
    ], fill=(255, 255, 255, 255))
    
    # Rivet dots
    for dot_x in [cx - 60, cx + 60]:
        draw.ellipse([dot_x - 3, cy - 3, dot_x + 3, cy + 3], fill=(148, 163, 184, 255))
        
    f_title = get_font('black', 42)
    draw_centered_text(draw, "IRON MIND", cy + 110, f_title, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "FORGED UNDER PRESSURE // HEAVY WEIGHTS", cy + 155, f_sub, (148, 163, 184, 255), tracking=1)

# =========================================================================
# 20. Earn Your Strength T-Shirt
# =========================================================================
def draw_earn_your_strength(draw, w, h):
    cx, cy = 512, 460
    r = 95
    
    # Laurel Wreath Leaves (Left and Right Arcs)
    for side in [-1, 1]:
        for i in range(7):
            theta = math.radians(90 + side * (25 + i * 18))
            lx = cx + r * math.cos(theta)
            ly = cy + r * math.sin(theta)
            # Draw leaf
            draw.ellipse([lx - 7, ly - 5, lx + 7, ly + 5], fill=(234, 179, 8, 240))
            
    # Central Barbell Plate
    draw.line([(cx - 45, cy), (cx + 45, cy)], fill=(255, 255, 255, 255), width=4)
    draw.rectangle([cx - 40, cy - 25, cx - 30, cy + 25], fill=(234, 179, 8, 255))
    draw.rectangle([cx + 30, cy - 25, cx + 40, cy + 25], fill=(234, 179, 8, 255))
    
    # Crown star
    draw.polygon([(cx, cy - r - 8), (cx + 5, cy - r), (cx, cy - r + 8), (cx - 5, cy - r)], fill=(234, 179, 8, 255))
    
    f_main = get_font('black', 34)
    draw_centered_text(draw, "EARN YOUR STRENGTH", cy + 115, f_main, (255, 255, 255, 255))
    
    f_sub = get_font('mono', 12)
    draw_centered_text(draw, "NOTHING IS GIVEN // EVERYTHING IS EARNED", cy + 155, f_sub, (234, 179, 8, 255), tracking=1)

# =========================================================================
# BATCH EXECUTION
# =========================================================================
PRODUCTS = [
    # Streetwear (8)
    (draw_midnight_tokyo, 'midnight-tokyo-tshirt.png'),
    (draw_no_signal, 'no-signal-tshirt.png'),
    (draw_after_dark, 'after-dark-tshirt.png'),
    (draw_lost_in_thought, 'lost-in-thought-tshirt.png'),
    (draw_offline_society, 'offline-society-tshirt.png'),
    (draw_future_is_loading, 'future-is-loading-tshirt.png'),
    (draw_rebel_mind, 'rebel-mind-tshirt.png'),
    (draw_urban_chaos, 'urban-chaos-tshirt.png'),
    # Gaming (6)
    (draw_respawn_mode, 'respawn-mode-tshirt.png'),
    (draw_night_raid, 'night-raid-tshirt.png'),
    (draw_level_up, 'level-up-tshirt.png'),
    (draw_critical_hit, 'critical-hit-tshirt.png'),
    (draw_cyber_player, 'cyber-player-tshirt.png'),
    (draw_game_over_never, 'game-over-never-tshirt.png'),
    # Gymwear (6)
    (draw_built_different, 'built-different-tshirt.png'),
    (draw_no_days_off, 'no-days-off-tshirt.png'),
    (draw_discipline, 'discipline-tshirt.png'),
    (draw_train_insane, 'train-insane-tshirt.png'),
    (draw_iron_mind, 'iron-mind-tshirt.png'),
    (draw_earn_your_strength, 'earn-your-strength-tshirt.png'),
]

if __name__ == '__main__':
    print(f'Starting generation of {len(PRODUCTS)} original T-shirt product mockup images...')
    for draw_func, filename in PRODUCTS:
        create_mockup(draw_func, filename)
    print('ALL 20 PRODUCT IMAGES GENERATED SUCCESSFULLY!')
