# Asylum Tracker

A daily checklist for **Last Asylum: Plague** for free-to-play players who want the most progress for the least time. It covers your daily routine (morning, midday and evening) and what to do on each Alliance Duel day.

- Static site with no build step. Serve the repo root with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).
- Ticks are saved in `localStorage` for each game day and clear at the daily reset. You can set the reset time and the weekday Duel Day 1 falls on (⚙ settings).
- Duel data comes from the [Alliance Duel guide](https://last-asylum-plague.fandom.com/wiki/Alliance_Duell_Guide). Edit it in `data.js`.

Run locally: `python3 -m http.server` and open http://localhost:8000.
