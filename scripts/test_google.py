import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
query = 'built different pump cover tshirt flat lay'
url = f'https://images.search.yahoo.com/search/images?p={urllib.parse.quote(query)}'
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        # Yahoo images has imgurl= or src=
        img_srcs = re.findall(r'imgurl=([^&]+)', html)
        print('Found Yahoo img_srcs:', len(img_srcs))
        for u in img_srcs[:5]:
            print(urllib.parse.unquote(u))
except Exception as e:
    print('Error:', e)
