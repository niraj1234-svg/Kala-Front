import re

with open('client/src/data/products.ts', 'r', encoding='utf-8') as f:
    c_f = f.read()

with open('backend/src/config/seed.ts', 'r', encoding='utf-8') as f:
    b_f = f.read()

c_ids = re.findall(r"id:\s*'([^']+)'", c_f)
b_ids = re.findall(r"id:\s*'([^']+)'", b_f)

print(f"Client products count: {len(c_ids)}")
print(f"Backend products count: {len(b_ids)}")
print(f"All IDs identical in order? {c_ids == b_ids}")

if c_ids != b_ids:
    print("Diff in client only:", set(c_ids) - set(b_ids))
    print("Diff in backend only:", set(b_ids) - set(c_ids))
else:
    print("\nCatalog items verification:")
    for i, pid in enumerate(c_ids, 1):
        print(f"{i:2d}. {pid}")
