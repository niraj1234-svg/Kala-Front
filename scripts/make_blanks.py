import os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

def inpaint_cream_blank():
    img_path = r'f:\Final kala\client\images\different-by-design-tshirt.png'
    img = Image.open(img_path).convert('RGB')
    
    # Crop clean fabric patch from belly area: y 620 to 920, x 330 to 690
    clean_patch = img.crop((330, 630, 690, 930))
    # Slight gaussian blur on patch high frequencies to ensure smoothness
    # Create feather mask
    mask = Image.new('L', (360, 300), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.rectangle([20, 20, 340, 280], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(15))
    
    img.paste(clean_patch, (330, 290), mask)
    
    out_dir = r'f:\Final kala\scripts\blanks'
    os.makedirs(out_dir, exist_ok=True)
    res_path = os.path.join(out_dir, 'blank_cream.png')
    img.save(res_path)
    print('Created blank_cream.png successfully')
    return img

if __name__ == '__main__':
    inpaint_cream_blank()
