import json, urllib.request

with open('src/data/foods.json') as f:
    foods = json.load(f)

failed = []
for i, food in enumerate(foods):
    url = food.get('image', '')
    name = food.get('nameEN', f'item-{i}')
    try:
        req = urllib.request.Request(url, method='HEAD')
        req.add_header('User-Agent', 'Mozilla/5.0')
        resp = urllib.request.urlopen(req, timeout=10)
        ct = resp.headers.get('content-type', '')
        if resp.status != 200 or 'image' not in ct:
            failed.append((name, url, f"status={resp.status} ct={ct}"))
        else:
            print(f"  OK [{i+1}/{len(foods)}] {name}")
    except Exception as e:
        failed.append((name, url, str(e)))

print()
if failed:
    print(f"FAILED ({len(failed)}):")
    for name, url, err in failed:
        print(f"  {name}: {err}")
        print(f"    URL: {url}")
else:
    print(f"All {len(foods)} URLs verified OK")
