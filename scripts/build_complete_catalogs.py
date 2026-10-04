import subprocess
import os

# 1. Fetch exact core content from HEAD
head_client = subprocess.check_output(['git', 'show', 'HEAD:client/src/data/products.ts'], encoding='utf-8')
head_backend = subprocess.check_output(['git', 'show', 'HEAD:backend/src/config/seed.ts'], encoding='utf-8')

# In client:
# Prefix up to midnight-tokyo
client_prefix = head_client[:head_client.find("  // 8 New Original Streetwear Products")]

# Gaming core
g_start = head_client.find("  // Gaming (5 existing items)")
g_end = head_client.find("  // 6 New Original Gaming Products")
client_gaming_core = head_client[g_start:g_end]

# Gymwear core
gym_start = head_client.find("  // Gymwear (7 existing items)")
gym_end = head_client.find("  // 6 New Original Gymwear Products")
client_gymwear_core = head_client[gym_start:gym_end]

# In backend:
b_prefix = head_backend[:head_backend.find("  // 8 New Original Streetwear Products")]
b_g_start = head_backend.find("  // Gaming (5 existing items)")
b_g_end = head_backend.find("  // 6 New Original Gaming Products")
backend_gaming_core = head_backend[b_g_start:b_g_end]

b_gym_start = head_backend.find("  // Gymwear (7 existing items)")
b_gym_end = head_backend.find("  // 6 New Original Gymwear Products")
backend_gymwear_core = head_backend[b_gym_start:b_gym_end]

b_suffix = head_backend[head_backend.find("\n]\n\n/**\n * Synchronizes"):]

print(f"Extracted client parts: prefix({len(client_prefix)}), gaming({len(client_gaming_core)}), gymwear({len(client_gymwear_core)})")
print(f"Extracted backend parts: prefix({len(b_prefix)}), gaming({len(backend_gaming_core)}), gymwear({len(backend_gymwear_core)}), suffix({len(b_suffix)})")

# Load update_catalog_interleaved data
from update_catalog_interleaved import tshirts, gymwear_sets, format_ts_product

# Interleave the 20 T-shirts and 20 Gymwear sets
interleaved = []
for i in range(20):
    interleaved.append(tshirts[i])
    interleaved.append(gymwear_sets[i])

print(f"Total interleaved products: {len(interleaved)}")

# Assemble client/src/data/products.ts
client_interleaved_code = "  // 40 Interleaved Graphic Tees & Gymwear Sets\n" + "\n".join(format_ts_product(p, is_client=True) for p in interleaved)
full_client_code = client_prefix + client_gaming_core + client_gymwear_core + client_interleaved_code + "\n]\n"

with open('client/src/data/products.ts', 'w', encoding='utf-8') as f:
    f.write(full_client_code)

print("client/src/data/products.ts written successfully!")

# Assemble backend/src/config/seed.ts
backend_interleaved_code = "  // 40 Interleaved Graphic Tees & Gymwear Sets\n" + "\n".join(format_ts_product(p, is_client=False) for p in interleaved)
full_backend_code = b_prefix + backend_gaming_core + backend_gymwear_core + backend_interleaved_code + b_suffix

with open('backend/src/config/seed.ts', 'w', encoding='utf-8') as f:
    f.write(full_backend_code)

print("backend/src/config/seed.ts written successfully!")
