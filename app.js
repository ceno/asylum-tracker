(() => {
  "use strict";

  const STORE_KEY = "asylum-routine:v1"; // pre-rename key, kept so saved ticks survive
  const KEEP_DAYS = 21;
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];
  const $ = (id) => document.getElementById(id);

  // ---- storage -------------------------------------------------------------

  function defaultResetTime() {
    // Fall back to midnight UTC, shown in the viewer's local time.
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (_) { /* storage unavailable */ }
    if (!data || typeof data !== "object") data = {};
    data.settings = Object.assign({ reset: defaultResetTime(), start: 1 }, data.settings);
    data.days = data.days || {};
    return data;
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

  function resetMinutes() {
    const [h, m] = state.settings.reset.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  // The calendar date of the in-game day that `now` falls in (local midnight).
  function gameDate(now) {
    const shifted = new Date(now.getTime() - resetMinutes() * 60000);
    return new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate());
  }

  function addDays(d, n) { const c = new Date(d); c.setDate(c.getDate() + n); return c; }

  function dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function duelDayOf(d) {
    return ((d.getDay() - Number(state.settings.start) + 7) % 7) + 1;
  }

  function nextReset(now) {
    const r = addDays(gameDate(now), 1);
    r.setMinutes(resetMinutes());
    return r;
  }

  // The server's date for game day `d`, to read with getUTC*: the middle of the game day in UTC.
  // Shop weeks and months turn over on the server's date, which west of UTC can be a day after the
  // local `d`. This holds as long as the reset is within 12 hours of midnight UTC.
  function serverDate(d) {
    const mid = new Date(d);
    mid.setMinutes(resetMinutes() + 12 * 60);
    return mid;
  }

  // Whether a server date is the last day of a shop's reset period (`resets` in LAST_CHANCE).
  const LAST_DAY = {
    week: (s) => s.getUTCDay() === 0, // Sunday
    month: (s) => new Date(s.getTime() + 86400000).getUTCDate() === 1,
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
    const diff = Math.round((d - today) / 86400000);
    return diff === 0 ? "today" : diff === 1 ? "tomorrow" : WEEKDAYS[d.getDay()];
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
        "aria-label": `${day === 7 ? "Rest day" : `Day ${day}`}, ${WEEKDAYS[d.getDay()]}`,
        onclick: () => { selected = day; render(); window.scrollTo({ top: 0, behavior: "smooth" }); },
      },
        icon(art, "tab-ico"),
        el("span", { class: "num" }, day === 7 ? "Rest" : ROMAN[day]),
        el("small", {}, WEEKDAYS[d.getDay()]));
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
      : `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${date.toLocaleString("en", { month: "short" })}`;

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
      slots.length ? timeline(slots, showAll && !rest)
        : all.length ? el("p", { class: "sub" }, "No Duel objective scores in today's rounds") : null,
      el("h3", { class: "group-head" },
        gap === 1 ? `Save for ${when(nextDate)}` : `Save for Day ${next} (${WEEKDAYS[nextDate.getDay()]})`),
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
  function pair(name, art) {
    const [first, ...rest] = name.split(" ");
    return el("span", { class: "pair" },
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

  // Survival Battle rounds on a timeline: a dot at each round's start, with the objectives it
  // scores. The next round's dot marks where a round ends, so a round's end time gets its own
  // (smaller) dot only when no shown round starts then: after the last round, or before a gap.
  // The current round's dot is gold.
  // With `all` (a Duel day with "Show all" on), every round is headed by its theme. A round that
  // also scores in the Duel is tagged "Duel" and lists its objectives below; the others are greyed.
  function timeline(slots, all = false) {
    const now = new Date();
    const rows = [];
    // The spaces between items are where a line may break.
    const objectives = (s) => s.items.flatMap((o, n) => [n ? " " : null, pair(text(o), o.icon)]);
    const theme = (s) => pair(SB.themes[s.theme], SB.icons[s.theme]);
    slots.forEach((s, i) => {
      const phase = now >= s.end ? "past" : now >= s.start ? "now" : "";
      const duel = s.items.length > 0;
      rows.push(el("li", { class: [phase, all ? (duel ? "duel" : "other") : ""].join(" ").trim() },
        el("time", { class: "slot" }, hhmm(s.start)),
        el("div", { class: "what" },
          phase === "now" ? el("span", { class: "sr-only" }, "Now: ") : null,
          // Otherwise a round with no Duel objectives (the rest day) shows its theme instead.
          all ? [
            el("span", { class: "item theme" }, theme(s)),
            duel ? el("span", { class: "item" }, objectives(s)) : null,
          ] : el("span", { class: "item" }, duel ? objectives(s) : theme(s))),
        all && duel ? el("span", { class: "duel-tag" }, "Duel") : null));
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
    const d = dateForDuelDay(day);
    d.setMinutes(resetMinutes() + i * SB.hours * 60);
    return d;
  }

  // Whether a round overlaps the SB.show hours. A game day that starts after midnight runs into the
  // next calendar date, so both dates' hours are checked.
  function shown(day, start, end) {
    return [0, 1].some((n) => {
      const from = addDays(dateForDuelDay(day), n), to = new Date(from);
      from.setHours(SB.show.from);
      to.setHours(SB.show.to);
      return start < to && end > from;
    });
  }

  function currentRound() {
    return Math.floor((new Date() - roundStart(todayDay, 0)) / (SB.hours * 3600000));
  }

  // The rounds of a Duel day that overlap the hours in SB.show, each with the Duel objectives its
  // theme also scores that day (none in the other rounds, or on the rest day).
  function rounds(day) {
    const objectives = window.DUEL_DAYS[day - 1].objectives;
    return (SB.schedule[day] || []).flatMap((theme, i) => {
      const start = roundStart(day, i), end = roundStart(day, i + 1);
      return shown(day, start, end) ? [{ theme, items: objectives.filter((o) => o.sb === theme), start, end }] : [];
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
  // and the `notSunday: true` tasks on the server's Sunday.
  function forToday(block) {
    const rest = todayDay === 7;
    const sunday = LAST_DAY.week(serverDate(today));
    const keep = (tasks) => tasks.filter((t) => !(rest && t.duel) && !(sunday && t.notSunday));
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
    const s = serverDate(today);
    const tasks = (window.LAST_CHANCE || []).filter((t) => LAST_DAY[t.resets]?.(s));
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

  function renderPrep() {
    const next = (selected % 7) + 1;
    const items = window.PREP[next] || [];
    const info = window.DUEL_DAYS[next - 1];
    const key = dateKey(dateForDuelDay(selected));
    $("prep-card").hidden = items.length === 0;
    $("prep-sub").textContent = `Next: ${next === 7 ? "Rest day" : `Day ${next}`}, ${info.title}`;
    $("prep-list").replaceChildren(...items.map((t, i) => checkItem(key, `prep:${next}:${i}`, t.text, t)));
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
    renderPrep();
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

  $("settings-btn").addEventListener("click", () => {
    const s = $("settings");
    s.hidden = !s.hidden;
    $("settings-btn").setAttribute("aria-expanded", String(!s.hidden));
    if (!s.hidden) renderStorageInfo();
  });
  $("reset-hour").value = state.settings.reset;
  $("start-weekday").value = String(state.settings.start);
  $("reset-hour").addEventListener("change", (e) => {
    state.settings.reset = e.target.value || "00:00";
    save(); today = null; refreshDay();
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
