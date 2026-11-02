# python3 assets/library/gallery.py assets/library  -- rewrites index.html: every image in the library, with its path
import os, sys, html
lib = sys.argv[1]
about = {
    "buildings": "Base buildings, named as in the game",
    "classes": "Hero classes", "currencies": "Currencies", "events": "Event banners (2:1)", "factions": "Hero factions",
    "heroes/art": "Full hero art (portrait)", "heroes/cards": "Hero card portraits (square)", "heroes/icons": "Hero icons",
    "heroes/portraits": "Hero portraits on a rounded tile, by rarity",
    "items/boost": "Boosts", "items/chest": "Chests", "items/consumable": "Consumables", "items/event": "Event items",
    "items/gear": "Gear", "items/material": "Materials and shards", "items/misc": "Other items", "items/raven": "Raven items",
    "items/resource": "Resources", "items/skin-decor": "Skin decorations", "items/speedup": "Speedups",
    "lord": "Lord portraits (the plague doctor)", "lord-skills": "Lord skills", "monsters": "Monsters and bosses",
    "scenes": "Scenes", "stars": "Star ratings",
}
folders = sorted(os.path.relpath(d, lib) for d, _, fs in os.walk(lib) if any(f.endswith(".webp") for f in fs))
total = sum(len([f for f in os.listdir(os.path.join(lib, d)) if f.endswith(".webp")]) for d in folders)
out = ['''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Asylum Tracker art library</title>
<style>
  :root { color-scheme: dark; --bg: #172030; --panel: #22324a; --ink: #f1f5fa; --muted: #9db0c6; }
  body { margin: 0 auto; max-width: 1100px; padding: 16px; background: var(--bg); color: var(--ink); font: 14px/1.4 system-ui, sans-serif; }
  h1 { margin: 0 0 4px; font-size: 1.4rem; }
  h2 { margin: 28px 0 2px; font-size: 1.05rem; }
  p { margin: 0; color: var(--muted); }
  nav { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 12px; }
  nav a { color: var(--muted); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; margin-top: 10px; }
  .grid.wide { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  figure { margin: 0; padding: 6px; border-radius: 8px; background: var(--panel); }
  img { display: block; width: 100%; height: 92px; object-fit: contain; }
  .wide img { height: 110px; }
  figcaption { margin-top: 4px; font: 11px/1.3 ui-monospace, monospace; color: var(--muted); overflow-wrap: anywhere; user-select: all; }
</style>
</head>
<body>
<h1>Art library</h1>
''' + f'<p>{total} images from the game, at full size. Paths are relative to <code>assets/</code>. See README.md for where they came from and how to use one on the page.</p>\n<nav>'
       + "".join(f'<a href="#{html.escape(d.replace("/", "-"))}">{html.escape(d)}</a>' for d in folders) + "</nav>\n"]
for d in folders:
    files = sorted(f for f in os.listdir(os.path.join(lib, d)) if f.endswith(".webp"))
    wide = d in ("events", "scenes", "buildings", "heroes/art")
    out.append(f'<h2 id="{html.escape(d.replace("/", "-"))}">{html.escape(d)} <small>({len(files)})</small></h2><p>{html.escape(about.get(d, ""))}</p>\n')
    out.append(f'<div class="grid{" wide" if wide else ""}">\n')
    for f in files:
        p = f"{d}/{f}"
        out.append(f'<figure><img src="{html.escape(p)}" alt="" loading="lazy"><figcaption>library/{html.escape(p[:-5])}</figcaption></figure>\n')
    out.append("</div>\n")
out.append("</body>\n</html>\n")
open(os.path.join(lib, "index.html"), "w").write("".join(out))
print("gallery:", total, "images in", len(folders), "folders")
