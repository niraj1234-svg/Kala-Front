import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
client_products_path = os.path.join(BASE_DIR, 'client', 'src', 'data', 'products.ts')
backend_seed_path = os.path.join(BASE_DIR, 'backend', 'src', 'config', 'seed.ts')

with open(client_products_path, 'r', encoding='utf-8') as f:
    c_content = f.read()

with open(backend_seed_path, 'r', encoding='utf-8') as f:
    b_content = f.read()

gymwear_ids = [
    'kala-apex-compression-set',
    'kala-discipline-set',
    'kala-oni-training-set',
    'kala-grind-mode-set',
    'kala-everyday-set',
    'kala-evolve-set',
    'kala-no-limits-set',
    'kala-wings-set',
    'kala-relentless-set',
    'kala-overthink-set',
    'kala-nature-set',
    'kala-iron-mind-set',
    'kala-good-mood-set',
    'kala-zen-set',
    'kala-tech-set',
    'kala-purpose-set',
    'kala-focus-set',
    'kala-progress-set',
    'kala-chaos-set',
    'kala-repeat-set'
]

# Update client
c_count = 0
for gid in gymwear_ids:
    target = f"image: getProductImage('{gid}.png'),"
    replacement = f"image: getProductImage('{gid}.png'),\n    images: [getProductImage('{gid}.png'), getProductImage('{gid}-back.png')],"
    if target in c_content and f"images: [getProductImage('{gid}.png')" not in c_content:
        c_content = c_content.replace(target, replacement)
        c_count += 1

with open(client_products_path, 'w', encoding='utf-8') as f:
    f.write(c_content)
print(f"Updated {c_count} products in client/src/data/products.ts")

# Update backend
b_count = 0
for gid in gymwear_ids:
    target = f"image: '{gid}.png',"
    replacement = f"image: '{gid}.png',\n    images: ['{gid}.png', '{gid}-back.png'],"
    if target in b_content and f"images: ['{gid}.png'" not in b_content:
        b_content = b_content.replace(target, replacement)
        b_count += 1

with open(backend_seed_path, 'w', encoding='utf-8') as f:
    f.write(b_content)
print(f"Updated {b_count} products in backend/src/config/seed.ts")
