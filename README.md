# Asylum Tracker

A daily checklist for **Last Asylum: Plague** for free-to-play players who want the most progress for the least time. It covers your daily routine (morning, midday and evening) and what to do on each Alliance Duel day.

**Live site:** https://ceno.github.io/asylum-tracker/

- Static site with no build step. Serve the repo root with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).
- Ticks are saved in `localStorage` for each game day and clear at the daily reset. You can set the reset time and the weekday Duel Day 1 falls on (⚙ settings). The settings also show the time this device started keeping ticks, so you can tell if the phone wiped them.
- The Home Screen app checks for a new deploy each time you switch back to it and reloads itself, so you don't need to force-quit it.
- The Duel card lists the day's six Survival Battle rounds. Pick each round's theme from the in-game calendar, and the rounds where one task scores in both events are highlighted. The picks are remembered for the same Duel day next week.
- Duel data comes from the [Alliance Duel guide](https://last-asylum-plague.fandom.com/wiki/Alliance_Duell_Guide). Edit it in `data.js`.

Run locally: `python3 -m http.server` and open http://localhost:8000.
