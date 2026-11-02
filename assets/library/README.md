# Art library

Every game image found while redesigning the tracker, kept at full size so the page can grow without hunting for art again. The page doesn't load anything from here: it uses the small copies in `assets/` that `data.js` names.

Browse it with `index.html` in this folder (served locally at http://127.0.0.1:8765/assets/library/, or on the live site at https://ceno.github.io/asylum-tracker/assets/library/). Each image's caption is its path, e.g. `library/items/raven/raven-essence`.

## Where it came from

The art belongs to the game, Last Asylum: Plague. It was collected from fan projects on GitHub that had taken it from the game:

| Folder | Source |
|---|---|
| `items/*` (except `items/misc`), `lord-skills`, `classes`, `factions`, `stars`, `currencies`, `events`, `heroes/portraits` | [klingo/last-asylum-plague](https://github.com/klingo/last-asylum-plague), `webapp/public/assets/` |
| `buildings` (named from the site's building guides), `heroes/art`, `heroes/icons`, `heroes/cards`, `lord`, `monsters`, `scenes` | [Fongobongo/last-asylum-website](https://github.com/Fongobongo/last-asylum-website), `site/public/` |
| `items/misc/sign-medal` | [soutovp/last-asylum-br](https://github.com/soutovp/last-asylum-br), `public/images/` |

PNG and JPG files were converted to `.webp` at their original size. Files that were already `.webp` are unchanged. Names are the source names in lower case with hyphens, except buildings, which were numbered (`5002.png` is `buildings/explorers-camp.webp`), and the lord portraits (`pic_lz_touxiang01.png` is `lord/lord-portrait-1.webp`). Hero cards named after a hero replace the numbered copies of the same picture; the numbered ones left (`pic-card4-04-sj` and so on) are variants with no name.

## Using one on the page

1. Make a small copy in `assets/`, named with the prefix that says how it's drawn (see the top of `data.js`): about 128px for an item (`i-`), 220px for a building (`b-`), 360px wide for hero art (`h-`). For example, with Pillow:
   ```python
   from PIL import Image
   im = Image.open("assets/library/items/raven/sharp-beak.webp")
   im = im.crop(im.getbbox()); im.thumbnail((128, 128))
   im.save("assets/i-sharp-beak.webp", "WEBP", quality=82, method=6)
   ```
2. Name it in `data.js` (`icon: "i-sharp-beak"`). An item's tile is blue unless `ICON_RARITY` lists it under another colour.
3. After adding images to this library, rebuild the gallery with `python3 assets/library/gallery.py assets/library`. To describe a new folder, add it to `about` in that script.
