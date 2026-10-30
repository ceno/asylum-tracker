# Asylum Tracker

A mobile-first daily checklist for the mobile game **Last Asylum: Plague**. It's for free-to-play players who want the most progress for the least time in game. The Alliance Duel card sits at the top. For the current Duel day (Days 1–6 plus a rest day) it lists the day's objectives as bullets under "Objective today", then the next scoring day's objectives under "Save for tomorrow". On Day 6 that skips the rest day and shows Day 1. Objectives that also score in Survival Battle (its 4-hour rounds are counted from the reset) are taken out of the "Anytime" list and shown on a timeline at the times their round runs that day, with the current round marked. Below it are the daily routine cards (Morning, Midday, Evening), which fold down to their header once every item is ticked, a "prep for tomorrow" list and a weekly saving cheat sheet. It is a static site served by GitHub Pages from the repo root. There is no build step, no framework and no dependencies. Ticks are stored in `localStorage` for each game day, so they reset at the in-game daily reset. The user can set the reset time and the weekday Duel Day 1 falls on in the ⚙ settings.

## Files

- `data.js`: all content (`ROUTINE`, `DUEL_DAYS`, `SURVIVAL_BATTLE`, `PREP`, `CHEATSHEET`). Most edits belong here. An objective written as `{ text, sb }` scores in the Survival Battle rounds with theme `sb`. `SURVIVAL_BATTLE.schedule` is the weekly round order copied from the in-game calendar, keyed by Duel day. The Duel values come from https://last-asylum-plague.fandom.com/wiki/Alliance_Duell_Guide. WebFetch gets a 402 from Fandom, so read the page through the API instead: `curl -sL "https://last-asylum-plague.fandom.com/api.php?action=parse&page=Alliance_Duell_Guide&prop=wikitext&format=json&formatversion=2"`.
- `app.js`: rendering, game-day maths and storage. Tick keys look like `routine:<block>:<id>` and `prep:<day>:<n>`, grouped under a `YYYY-MM-DD` game date. Changing an item's `id` drops its saved tick. It also asks for persistent storage and shows a storage readout in ⚙. That readout shows whether the page is running as a Home Screen app, whether storage is protected, and the `created` time of the saved data (it jumps forward if the data was wiped). Each time the app comes back into view, it compares the deployed files in `APP_FILES` with the ones it started with and reloads if they differ. Add any new file the page loads to `APP_FILES`.
- `sw.js`: network-first service worker. Every load revalidates with the server instead of reusing GitHub Pages' 10-minute cache, and the cache is only used offline. Without it, the update check above can't tell what's running.
- `index.html`, `style.css`: markup and styles. Colours are CSS custom properties on `:root`, with dark-mode overrides.

The storage key is still `asylum-routine:v1` from before the rename. Keep it so saved ticks aren't lost.

## Commands

```bash
# Serve locally (then open http://127.0.0.1:8765/, e.g. via VS Code "Simple Browser: Show")
python3 -m http.server 8765 --bind 127.0.0.1

# Smoke test in a mobile browser with the playwright-cli skill
playwright-cli open --mobile http://127.0.0.1:8765/
playwright-cli console          # should show no errors
playwright-cli close && rm -rf .playwright-cli
```

Deploy: push to `main`. GitHub Pages is set to deploy from the branch, from the `main` root. Live site: https://ceno.github.io/asylum-tracker/

## Preview artifact

There is a private claude.ai artifact of the page at https://claude.ai/artifact/A8tFVv6s1ZnXcVVceQdeFL so changes can be previewed in claude.ai before merging. After any change to the page, republish it to that same URL with the Artifact tool:

- `url`: the URL above. If this session hasn't published it yet, first read it with `action: "read"` and also with `paths: ["style.css", "data.js", "app.js"]`, otherwise the publish is refused for overwriting files it hasn't read
- `file_path`: `index.html`
- `files`: `{"style.css": "style.css", "data.js": "data.js", "app.js": "app.js"}`

Never publish without `url`. That creates a second artifact instead of updating this one. Ticks saved in the artifact are separate from the live site's. `sw.js` is left out on purpose: the preview runs without a service worker, so it never reloads itself.
