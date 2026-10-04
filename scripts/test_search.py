from duckduckgo_search import DDGS
import json

with DDGS() as ddgs:
    results = list(ddgs.images("built different gym t-shirt flat lay", max_results=5))
    for r in results:
        print(r['title'])
        print(r['image'])
