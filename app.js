(() => {
  "use strict";

  const STORE_KEY = "asylum-routine:v1"; // pre-rename key, kept so saved ticks survive
  const KEEP_DAYS = 21;
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];
  const $ = (id) => document.getElementById(id);

  // ---- storage -------------------------------------------------------------

  // The daily reset is kept as minutes after midnight UTC (`resetUTC`), midnight UTC unless set,
  // so it stays with the game when the local clocks change.
  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (_) { /* storage unavailable */ }
    if (!data || typeof data !== "object") data = {};
    data.settings = data.settings || {};
    data.days = data.days || {};
    if (data.settings.resetUTC == null && data.settings.reset != null) {
      fromLocalReset(data);
      try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (_) { /* ignore */ }
    }
    data.settings = Object.assign({ resetUTC: 0, start: 1 }, data.settings);
    return data;
  }

  // Data saved before the reset was kept in UTC has it as a local time (`reset`, "HH:MM") and
  // ticks under the local date each game day started on. Convert the reset by today's clock, and
  // move each day's ticks to that game day's server date, which west of UTC is a day later.
  function fromLocalReset(data) {
    const [h, m] = String(data.settings.reset).split(":").map((n) => Number(n) || 0);
    data.settings.resetUTC = toUTC(h, m);
    delete data.settings.reset;
    const days = {};
    for (const [key, ticks] of Object.entries(data.days)) {
      const [y, mo, d] = key.split("-").map(Number);
      const mid = new Date(y, mo - 1, d, h + 12, m); // the middle of that game day
      if (!isNaN(mid)) days[dateKey(mid)] = ticks;
    }
    data.days = days;
  }

  // Local time h:m today, as minutes after midnight UTC.
  function toUTC(h, m) {
    const at = new Date();
    at.setHours(h, m, 0, 0);
    return at.getUTCHours() * 60 + at.getUTCMinutes();
  }

  function save() {
    state.saved = Date.now();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) { /* ignore */ }
  }

  function prune() {
    const cutoff = dateKey(addDays(gameDate(new Date()), -KEEP_DAYS));
    for (const k of Object.keys(state.days)) if (k < cutoff) delete state.days[k];
  }

  // ---- game-day maths --------------------------------------------------------

  const DAY = 86400000;

  // The daily reset in ms from midnight UTC, taken to within 12 hours of it, so that a reset late
  // in the UTC day starts the next date's game day.
  function resetOffset() {
    const m = (((Number(state.settings.resetUTC) || 0) % 1440) + 1440) % 1440;
    return (m >= 720 ? m - 1440 : m) * 60000;
  }

  // The game day that time `t` falls in, named by the server's date: the UTC date in the middle of
  // the game day, as midnight UTC. Read it with getUTC*. Ticks, Duel days and shop weeks all go by
  // it, so they match the game wherever the viewer is. West of UTC, a game day starts the
  // afternoon before its date.
  function gameDate(t) {
    return new Date(Math.floor((t - resetOffset()) / DAY) * DAY);
  }

  // When game day `d` starts.
  function dayStart(d) { return new Date(d.getTime() + resetOffset()); }

  function addDays(d, n) { return new Date(d.getTime() + n * DAY); }

  function dateKey(d) { return d.toISOString().slice(0, 10); }

  function duelDayOf(d) {
    return ((d.getUTCDay() - Number(state.settings.start) + 7) % 7) + 1;
  }

  function nextReset(now) { return dayStart(addDays(gameDate(now), 1)); }

  // Whether game day `d` is the last day of a shop's reset period (`resets` in LAST_CHANCE).
  const LAST_DAY = {
    week: (d) => d.getUTCDay() === 0, // Sunday
    month: (d) => addDays(d, 1).getUTCDate() === 1,
  };

  // ---- rendering -------------------------------------------------------------

  const state = load();
  // When this device's data starts. If it jumps to a later launch, the data was wiped.
  if (!state.created) { state.created = Date.now(); save(); }
  let today, todayDay, selected, round;
  // Finished routine and last-chance cards fold to their header. These are the ones opened again by hand.
  const unfolded = new Set();

  function el(tag, attrs = {}, ...children) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) if (c != null && c !== "") n.append(c);
    return n;
  }

  // An image from assets/ in a frame the stylesheet draws: an item (i-) on a tile coloured by
  // ICON_RARITY, a building (b-) as is. See the top of data.js.
  function icon(name, cls = "ico") {
    if (!name) return el("span", { class: `${cls} blank`, "aria-hidden": "true" });
    const rarity = Object.keys(window.ICON_RARITY).find((r) => window.ICON_RARITY[r].includes(name)) || "blue";
    return el("span", { class: cls, "data-kind": name.split("-")[0], "data-rarity": rarity, "aria-hidden": "true" },
      el("img", { src: `assets/${name}.webp`, alt: "", decoding: "async" }));
  }

  function checkItem(dayKey, id, text, { note, icon: art } = {}) {
    const ticks = state.days[dayKey] || {};
    const input = el("input", { type: "checkbox", "data-key": id });
    input.checked = !!ticks[id];
    input.addEventListener("change", () => {
      const d = (state.days[dayKey] = state.days[dayKey] || {});
      if (input.checked) d[id] = true; else delete d[id];
      save();
      updateProgress();
    });
    return el("li", {},
      el("label", { class: "check" },
        input,
        icon(art),
        el("span", { class: "text" }, text),
        note ? el("span", { class: "note" }, note) : null,
      ),
    );
  }

  function dateForDuelDay(day) {
    return addDays(today, day - todayDay);
  }

  // "today" or "tomorrow" by the real game day, otherwise the weekday, e.g. "Thu".
  function when(d) {
    const diff = Math.round((d - today) / DAY);
    return diff === 0 ? "today" : diff === 1 ? "tomorrow" : WEEKDAYS[d.getUTCDay()];
  }

  function renderTabs() {
    const nav = $("day-tabs");
    // Each button: the day's icon with its numeral as a badge, and the weekday below.
    nav.replaceChildren(...window.DUEL_DAYS.map(({ day, icon: art }) => {
      const d = dateForDuelDay(day);
      return el("button", {
        type: "button",
        class: day === todayDay ? "today" : "",
        "data-day": day,
        "aria-pressed": String(day === selected),
        "aria-label": `${day === 7 ? "Rest day" : `Day ${day}`}, ${WEEKDAYS[d.getUTCDay()]}`,
        onclick: () => { selected = day; render(); window.scrollTo({ top: 0, behavior: "smooth" }); },
      },
        icon(art, "tab-ico"),
        el("span", { class: "num" }, day === 7 ? "Rest" : ROMAN[day]),
        el("small", {}, WEEKDAYS[d.getUTCDay()]));
    }));
  }

  function renderDuel() {
    const info = window.DUEL_DAYS[selected - 1];
    const date = dateForDuelDay(selected);
    // The banner: the day's name, colour (by data-day) and art, and its reset countdown or date.
    $("duel").dataset.day = selected;
    $("duel-title").textContent = info.title;
    $("duel-art").src = `assets/${info.art}.webp`;
    $("duel-art").dataset.kind = info.art.split("-")[0];
    $("duel-meta").textContent = selected === todayDay
      ? `Ends in ${untilReset()}`
      : `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${date.toLocaleString("en", { month: "short", timeZone: "UTC" })}`;

    // The next day with objectives, so Day 6 saves for Day 1 instead of the rest day.
    let gap = 1;
    while (gap < 7 && !window.DUEL_DAYS[(selected + gap - 1) % 7].objectives.length) gap++;
    const next = ((selected + gap - 1) % 7) + 1;
    const nextDate = addDays(date, gap);

    // A Duel day's timeline shows the rounds that also score in the Duel, or every round with
    // "Show all" on. The rest day has no Duel objectives, so it always shows every round.
    const rest = !info.objectives.length;
    const all = rounds(selected);
    const showAll = rest || !!state.settings.sbAll;
    const slots = showAll ? all : all.filter((r) => r.items.length);
    const timed = new Set(all.flatMap((r) => r.items));
    const anytime = info.objectives.filter((o) => !timed.has(o));

    $("duel-body").replaceChildren(...[
      rest ? el("p", { class: "sub" }, info.note || "") : null,
      anytime.length && all.length ? el("p", { class: "minor-head" }, "Anytime") : null,
      anytime.length ? pairs(anytime) : null,
      all.length ? sbHead(rest, showAll) : null,
      slots.length ? timeline(slots, showAll, !rest)
        : all.length ? el("p", { class: "sub" }, "No Duel objective scores in today's rounds") : null,
      el("h3", { class: "group-head" },
        gap === 1 ? `Save for ${when(nextDate)}` : `Save for Day ${next} (${WEEKDAYS[nextDate.getUTCDay()]})`),
      gap === 1 ? null : el("p", { class: "sub" }, "After the rest day"),
      pairs(window.DUEL_DAYS[next - 1].objectives),
    ].filter(Boolean));
  }

  // Objectives as icon and name pairs, as on the timeline, flowing on from each other like words.
  // The spaces between them are where a line may break.
  function pairs(items) {
    return el("ul", { class: "pairs" }, items.flatMap((o, i) =>
      [i ? " " : null, el("li", {}, pair(text(o), o.icon))]));
  }

  // An item's small icon and its name. A name too long for a line may wrap, but the icon stays
  // with its first word.
  function pair(name, art, cls) {
    const [first, ...rest] = name.split(" ");
    return el("span", { class: cls ? `pair ${cls}` : "pair" },
      el("span", { class: "nw" }, icon(art, "ico mini"), first),
      rest.length ? ` ${rest.join(" ")}` : null);
  }

  // The Survival Battle heading. On a Duel day it has a "Show all" switch, which adds the rounds
  // that don't score in the Duel. The switch is kept in the settings, so it stays as it was left.
  function sbHead(rest, showAll) {
    return el("div", { class: "sb-head" },
      el("p", { class: "minor-head" }, rest || showAll ? "Survival Battle" : "During Survival Battle"),
      rest ? null : el("button", {
        type: "button", class: "chip", "aria-pressed": String(showAll),
        onclick: (e) => {
          const focused = document.activeElement === e.currentTarget;
          state.settings.sbAll = !showAll;
          save();
          renderDuel();
          if (focused) $("duel-body").querySelector(".chip").focus();
        },
      }, "Show all"));
  }

  // Survival Battle rounds on a timeline: a dot at each round's start, headed by the round's theme,
  // with the Duel objectives it scores. The next round's dot marks where a round ends, so a round's
  // end time gets its own (smaller) dot only when no shown round starts then: after the last round,
  // or before a gap. The current round's dot is gold.
  // With `full` (the rest day, or "Show all" on), every round is shown and lists all the tasks that
  // score in it. On a Duel day (`duelDay`), a round that also scores in the Duel is tagged "Duel",
  // and the tasks and rounds that don't are greyed.
  function timeline(slots, full, duelDay) {
    const now = new Date();
    const rows = [];
    // The spaces between items are where a line may break.
    const objectives = (s) => s.items.flatMap((o, n) => [n ? " " : null, pair(text(o), o.icon)]);
    const tasks = (s) => s.tasks.flatMap((t, n) => [n ? " " : null,
      pair(t.text, t.icon, duelDay && !t.duel ? "off" : "")]);
    const tagged = full && duelDay;
    slots.forEach((s, i) => {
      const phase = now >= s.end ? "past" : now >= s.start ? "now" : "";
      const duel = s.items.length > 0;
      rows.push(el("li", { class: [phase, tagged ? (duel ? "duel" : "other") : ""].join(" ").trim() },
        el("time", { class: "slot" }, hhmm(s.start)),
        el("div", { class: "what" },
          phase === "now" ? el("span", { class: "sr-only" }, "Now: ") : null,
          el("span", { class: "item theme" }, el("span", { class: "pair" }, SB.themes[s.theme])),
          el("span", { class: "item" }, full ? tasks(s) : objectives(s))),
        tagged && duel ? el("span", { class: "duel-tag" }, "Duel") : null));
      const next = slots[i + 1];
      if (!next || +next.start !== +s.end) {
        // `gap`: no shown round runs between this end and the next round's start.
        rows.push(el("li", { class: ["end", now >= s.end ? "past" : "", next ? "gap" : ""].join(" ").trim() },
          el("time", { class: "slot" }, hhmm(s.end)),
          el("div", { class: "what" }, el("span", { class: "sr-only" }, "Round ends"))));
      }
    });
    return el("ol", { class: "timeline" }, rows);
  }

  // ---- Survival Battle -------------------------------------------------------

  const SB = window.SURVIVAL_BATTLE;
  const text = (o) => (typeof o === "string" ? o : o.text);
  const hhmm = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  // Rounds are counted from the daily reset.
  function roundStart(day, i) {
    return new Date(dayStart(dateForDuelDay(day)).getTime() + i * SB.hours * 3600000);
  }

  // Whether a round overlaps the SB.show hours, in local time. A game day that starts after local
  // midnight runs into the next local date, so both dates' hours are checked.
  function shown(day, start, end) {
    const s = dayStart(dateForDuelDay(day));
    return [0, 1].some((n) => {
      const from = new Date(s.getFullYear(), s.getMonth(), s.getDate() + n, SB.show.from);
      const to = new Date(s.getFullYear(), s.getMonth(), s.getDate() + n, SB.show.to);
      return start < to && end > from;
    });
  }

  function currentRound() {
    return Math.floor((new Date() - roundStart(todayDay, 0)) / (SB.hours * 3600000));
  }

  // The rounds of a Duel day that overlap the hours in SB.show. Each has `items`, the Duel
  // objectives its theme also scores that day (none in the other rounds, or on the rest day), and
  // `tasks`, everything that scores in it, each marked `duel` if it's one of those objectives.
  function rounds(day) {
    const objectives = window.DUEL_DAYS[day - 1].objectives;
    return (SB.schedule[day] || []).flatMap((theme, i) => {
      const start = roundStart(day, i), end = roundStart(day, i + 1);
      if (!shown(day, start, end)) return [];
      const items = objectives.filter((o) => o.sb === theme);
      // An objective missing from the theme's list still shows, after it.
      const listed = SB.tasks[theme] || [];
      const tasks = [...listed, ...items.filter((o) => !listed.some((t) => t.text === o.text))]
        .map((t) => ({ ...t, duel: items.some((o) => o.text === t.text) }));
      return [{ theme, items, tasks, start, end }];
    });
  }

  // A card of today's ticks that folds to its header once every item is ticked. The header has the
  // block's building, its time and a progress bar. Ticks are saved as `<prefix>:<task id>`.
  function foldCard(block, prefix, { eyebrow, sub, cls = "" } = {}) {
    const key = dateKey(today);
    const list = (tasks) =>
      el("ul", { class: "checks" }, tasks.map((t) => checkItem(key, `${prefix}:${t.id}`, t.text, t)));
    const toggle = () => {
      if (!unfolded.delete(block.id)) unfolded.add(block.id);
      updateProgress();
    };
    return el("section", { class: `card foldable ${cls}`.trim(), "data-block": block.id },
      icon(block.art, "card-art"),
      eyebrow ? el("p", { class: "eyebrow" }, eyebrow) : null,
      el("div", { class: "section-head" },
        el("h2", {}, block.title),
        block.time ? el("span", { class: "time" }, block.time) : null,
        el("span", { class: "progress" }),
        el("button", { type: "button", class: "fold-btn", onclick: toggle }),
      ),
      el("span", { class: "bar", "aria-hidden": "true" }, el("i")),
      el("div", { class: "fold-body" },
        el("div", {},
          sub ? el("p", { class: "sub" }, sub) : null,
          block.groups
            ? block.groups.flatMap((g) => [el("h3", { class: "group-head" }, g.title), list(g.tasks)])
            : list(block.tasks),
        ),
      ),
    );
  }

  // Drops the `duel: true` groups and tasks on the rest day, when the Duel doesn't score,
  // the `notSunday: true` tasks on the server's Sunday, and `weekday` tasks on other weekdays.
  function forToday(block) {
    const rest = todayDay === 7;
    const sunday = LAST_DAY.week(today);
    const weekday = WEEKDAYS[today.getUTCDay()];
    const keep = (tasks) => tasks.filter((t) =>
      !(rest && t.duel) && !(sunday && t.notSunday) && !(t.weekday && t.weekday !== weekday));
    return block.groups
      ? { ...block, groups: block.groups.filter((g) => !(rest && g.duel)).map((g) => ({ ...g, tasks: keep(g.tasks) })) }
      : { ...block, tasks: keep(block.tasks) };
  }

  function renderRoutine() {
    $("routine").replaceChildren(...window.ROUTINE.map((block) =>
      foldCard(forToday(block), `routine:${block.id}`)));
  }

  // On the last game day of a week or month, the shops that reset after it: the last chance to buy.
  function renderLastChance() {
    const tasks = (window.LAST_CHANCE || []).filter((t) => LAST_DAY[t.resets]?.(today));
    const periods = Object.keys(LAST_DAY).filter((p) => tasks.some((t) => t.resets === p));
    const shops = periods.map((p) => `${p}ly`).join(" and ");
    $("last-chance").replaceChildren(...(tasks.length ? [
      foldCard({ id: "last-chance", title: "Last chance to buy", art: "b-nomad-trader", tasks }, "last-chance", {
        eyebrow: `Last day of the ${periods.join(" and ")}`,
        sub: `${shops[0].toUpperCase()}${shops.slice(1)} shops reset at ${hhmm(nextReset(new Date()))}`,
        cls: "last-chance",
      }),
    ] : []));
  }

  function updateProgress() {
    for (const card of document.querySelectorAll(".card.foldable")) {
      const boxes = card.querySelectorAll("input[type=checkbox]");
      const done = [...boxes].filter((b) => b.checked).length;
      const p = card.querySelector(".progress");
      if (p) p.textContent = `${done}/${boxes.length}`;
      card.style.setProperty("--p", boxes.length ? done / boxes.length : 0);
      const complete = boxes.length > 0 && done === boxes.length;
      card.classList.toggle("complete", complete);
      // Forget a hand-opened card once it's unfinished again, so finishing it folds it.
      if (!complete) unfolded.delete(card.dataset.block);
      const folded = complete && !unfolded.has(card.dataset.block);
      card.classList.toggle("folded", folded);
      card.querySelector(".fold-body").inert = folded;
      const btn = card.querySelector(".fold-btn");
      btn.hidden = !complete;
      btn.textContent = folded ? "Show" : "Hide";
      btn.setAttribute("aria-expanded", String(!folded));
    }
  }

  function untilReset() {
    const now = new Date();
    const mins = Math.max(0, Math.round((nextReset(now) - now) / 60000));
    return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
  }

  // The reset countdown on today's Duel banner.
  function renderStatus() {
    if (selected === todayDay) $("duel-meta").textContent = `Ends in ${untilReset()}`;
  }

  function render() {
    round = currentRound();
    renderTabs();
    renderLastChance();
    renderDuel();
    renderRoutine();
    renderStatus();
    updateProgress();
  }

  function refreshDay() {
    const g = gameDate(new Date());
    const changed = !today || dateKey(g) !== dateKey(today);
    if (changed) {
      today = g;
      unfolded.clear();
      todayDay = duelDayOf(today);
      selected = todayDay;
      prune();
      render();
    } else {
      renderStatus();
      // Move the "now" marker when a Survival Battle round ends.
      if (currentRound() !== round) { round = currentRound(); renderDuel(); }
    }
  }

  // ---- storage health --------------------------------------------------------

  // Safari grants this only to a Home Screen app's own site. It exempts the data
  // from WebKit's over-quota and long-inactivity evictions.
  let persisted = null;
  async function protectStorage() {
    try { persisted = (await navigator.storage.persisted()) || (await navigator.storage.persist()); }
    catch (_) { persisted = false; }
    renderStorageInfo();
  }

  function renderStorageInfo() {
    const standalone = navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;
    const stamp = (t) => new Date(t).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const protection = persisted == null ? "" : persisted ? ", storage protected" : ", storage not protected";
    $("storage-info").replaceChildren(
      `${standalone ? "Home Screen app" : "Browser tab"}${protection}`, el("br"),
      `Ticks kept since ${stamp(state.created)}, last saved ${stamp(state.saved)}`,
    );
  }

  // ---- updates ---------------------------------------------------------------

  // A Home Screen app resumes the open page instead of reloading it. So each
  // time it comes back, compare the deployed files with the ones this page
  // started with and reload into the new deploy if they differ. sw.js makes
  // every load fetch the latest files, so the first snapshot is what's running.
  const APP_FILES = ["./", "style.css", "data.js", "app.js"];
  let loaded = null;

  async function checkForUpdate() {
    try {
      if (!navigator.serviceWorker.controller) return;
      const texts = await Promise.all(APP_FILES.map(async (f) => {
        const res = await fetch(f, { cache: "no-store" });
        if (!res.ok) throw new Error(res.status);
        return res.text();
      }));
      const deployed = texts.join("\0");
      if (loaded === null) loaded = deployed;
      else if (deployed !== loaded) location.reload();
    } catch (_) { /* offline, mid-deploy or no service worker: try again next time */ }
  }

  try { navigator.serviceWorker.register("sw.js").catch(() => {}); } catch (_) { /* unsupported */ }

  // ---- settings --------------------------------------------------------------

  // The reset is kept in UTC and shown in local time, so it moves with the clocks when they change.
  function showReset() { $("reset-hour").value = hhmm(nextReset(new Date())); }

  $("settings-btn").addEventListener("click", () => {
    const s = $("settings");
    s.hidden = !s.hidden;
    $("settings-btn").setAttribute("aria-expanded", String(!s.hidden));
    if (!s.hidden) { showReset(); renderStorageInfo(); }
  });
  showReset();
  $("start-weekday").value = String(state.settings.start);
  $("reset-hour").addEventListener("change", (e) => {
    // A cleared field goes back to midnight UTC.
    const [h, m] = e.target.value.split(":").map(Number);
    state.settings.resetUTC = e.target.value ? toUTC(h || 0, m || 0) : 0;
    save(); today = null; refreshDay(); showReset();
  });
  $("start-weekday").addEventListener("change", (e) => {
    state.settings.start = Number(e.target.value);
    save(); today = null; refreshDay();
  });
  $("reset-today").addEventListener("click", () => {
    delete state.days[dateKey(today)];
    save(); render();
  });

  // ---- header: hidden while scrolling down, back on scrolling up -------------

  // Gives the screen to the checklist while reading down it. Any scroll back up, a return to
  // the top, or keyboard focus inside it brings the header back.
  const header = document.querySelector(".top");
  let lastY = scrollY, travel = 0, queued = false;
  function onScroll() {
    queued = false;
    const y = Math.max(0, scrollY), dy = y - lastY;
    lastY = y;
    if (Math.sign(dy) !== Math.sign(travel)) travel = 0; // direction changed: start counting again
    travel += dy;
    if (y <= header.offsetHeight) header.classList.remove("is-hidden");
    else if (travel > 24) header.classList.add("is-hidden");
    else if (travel < -12) header.classList.remove("is-hidden");
  }
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  header.addEventListener("focusin", () => header.classList.remove("is-hidden"));

  refreshDay();
  protectStorage();
  checkForUpdate();
  setInterval(refreshDay, 30000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) { refreshDay(); checkForUpdate(); }
  });
})();
