# Asylum Tracker

A daily checklist for **Last Asylum: Plague** for free-to-play players who want the most progress for the least time. It covers your daily routine (morning, midday and evening) and what to do on each Alliance Duel day.

**Live site:** https://ceno.github.io/asylum-tracker/

- Static site with no build step. Serve the repo root with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).
- Ticks are saved in `localStorage` for each game day and clear at the daily reset. You can set the reset time and the weekday Duel Day 1 falls on (⚙ settings). The settings also show the time this device started keeping ticks, so you can tell if the phone wiped them.
- The Home Screen app checks for a new deploy each time you switch back to it and reloads itself, so you don't need to force-quit it.
- It's styled after the game's event screens, with game art for every task and objective: item icons on tiles coloured by rarity, building renders and hero art. Art and fonts are in `assets/`.
- The Duel card shows the day's objectives under "Anytime", then a timeline of the Survival Battle rounds where the same task scores in both events, e.g. construction speedups from 10:00. "Show all" fills in the rest of the day's rounds, greyed, with the ones that also score in the Duel tagged "Duel".
- The header with the Duel day buttons slides away while you scroll down and comes back when you scroll up.
- On the last day of a shop's week or month (by the server's date), a card at the top reminds you to buy from it before it resets: the Alliance Shop every Sunday and the Honor Shop on the last day of the month.
- Duel data comes from the [Alliance Duel guide](https://last-asylum-plague.fandom.com/wiki/Alliance_Duell_Guide). Edit it in `data.js`.

Run locally: `python3 -m http.server` and open http://localhost:8000.
