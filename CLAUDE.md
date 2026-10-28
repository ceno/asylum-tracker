# Asylum Tracker

A mobile-first daily checklist for the mobile game **Last Asylum: Plague**. It's for free-to-play players who want the most progress for the least time in game. The page has a daily routine (the Morning card sits at the top, then Midday and Evening). It also has a card for the current Alliance Duel day (Days 1–6 plus a rest day) that lists each scoring action with its base points, the items not to use today, a "prep for tomorrow" list, and a weekly saving cheat sheet. It is a static site served by GitHub Pages from the repo root. There is no build step, no framework and no dependencies. Ticks are stored in `localStorage` for each game day, so they reset at the in-game daily reset. The user can set the reset time and the weekday Duel Day 1 falls on in the ⚙ settings.

## Files

- `data.js`: all content (`ROUTINE`, `DUEL_DAYS`, `PREP`, `CHEATSHEET`). Most edits belong here. The Duel values come from https://last-asylum-plague.fandom.com/wiki/Alliance_Duell_Guide. WebFetch gets a 402 from Fandom, so read the page through the API instead: `curl -sL "https://last-asylum-plague.fandom.com/api.php?action=parse&page=Alliance_Duell_Guide&prop=wikitext&format=json&formatversion=2"`.
- `app.js`: rendering, game-day maths and storage. Tick keys look like `duel:<id>`, `routine:<block>:<id>` and `prep:<day>:<n>`, grouped under a `YYYY-MM-DD` game date. Changing an item's `id` drops its saved tick.
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

Deploy: push to `main`. GitHub Pages is set to deploy from the branch, from the `main` root.
