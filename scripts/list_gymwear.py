import re

with open('client/src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r"id:\s*'(kala-[^']+)',\s*\n\s*name:\s*'([^']+)'"
matches = re.findall(pattern, text)
print(f"Total 'kala-' products found: {len(matches)}")
for i, m in enumerate(matches):
    print(f"{i+1:2d}. ID: {m[0]:<30} Name: {m[1]}")
