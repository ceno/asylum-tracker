(() => {
  "use strict";

  const STORE_KEY = "asylum-routine:v1"; // pre-rename key, kept so saved ticks survive
  const KEEP_DAYS = 21;
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

  // ---- rendering -------------------------------------------------------------

  const state = load();
  let today, todayDay, selected;

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

  function checkItem(dayKey, id, text, { note } = {}) {
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
        el("span", { class: "text" }, text),
        note ? el("span", { class: "note" }, note) : null,
      ),
    );
  }

  function dateForDuelDay(day) {
    return addDays(today, day - todayDay);
  }

  // "today" or "tomorrow" by the real game day, otherwise e.g. "on Thu".
  function when(d, prep) {
    const diff = Math.round((d - today) / 86400000);
    return diff === 0 ? "today" : diff === 1 ? "tomorrow" : `${prep} ${WEEKDAYS[d.getDay()]}`.trim();
  }

  function renderTabs() {
    const nav = $("day-tabs");
    nav.replaceChildren(...window.DUEL_DAYS.map(({ day }) => {
      const d = dateForDuelDay(day);
      const b = el("button", {
        type: "button",
        class: day === todayDay ? "today" : "",
        "aria-pressed": String(day === selected),
        onclick: () => { selected = day; render(); window.scrollTo({ top: 0, behavior: "smooth" }); },
      }, day === 7 ? "Rest" : `D${day}`, el("small", {}, WEEKDAYS[d.getDay()]));
      return b;
    }));
  }

  function renderDuel() {
    const info = window.DUEL_DAYS[selected - 1];
    const date = dateForDuelDay(selected);
    $("duel-eyebrow").textContent = selected === 7 ? "Alliance Duel · off day" : `Alliance Duel · Day ${selected}`;
    $("duel-title").textContent = info.title;

    // The next day with objectives, so Day 6 saves for Day 1 instead of the rest day.
    let gap = 1;
    while (gap < 7 && !window.DUEL_DAYS[(selected + gap - 1) % 7].objectives.length) gap++;
    const next = ((selected + gap - 1) % 7) + 1;
    const nextDate = addDays(date, gap);

    const bullets = (items) => el("ul", { class: "bullets" }, items.map((t) => el("li", {}, t)));
    $("duel-body").replaceChildren(...[
      el("h3", { class: "group-head" }, `Objective ${when(date, "on")}`),
      info.objectives.length ? bullets(info.objectives) : el("p", { class: "sub" }, info.note || ""),
      el("h3", { class: "group-head" },
        gap === 1 ? `Save for ${when(nextDate, "")}` : `Save for Day ${next} (${WEEKDAYS[nextDate.getDay()]})`),
      gap === 1 ? null : el("p", { class: "sub" }, "After the rest day"),
      bullets(window.DUEL_DAYS[next - 1].objectives),
    ].filter(Boolean));
  }

  function renderRoutine() {
    const key = dateKey(today);
    const list = (block, tasks) =>
      el("ul", { class: "checks" }, tasks.map((t) => checkItem(key, `routine:${block.id}:${t.id}`, t.text, t)));
    const card = (block) =>
      el("section", { class: "card routine", "data-block": block.id },
        el("div", { class: "section-head" },
          el("h2", {}, block.title),
          el("span", { class: "progress" }),
        ),
        block.time ? el("p", { class: "sub" }, block.time) : null,
        block.groups
          ? block.groups.flatMap((g) => [el("h3", { class: "group-head" }, g.title), list(block, g.tasks)])
          : list(block, block.tasks),
      );
    $("routine").replaceChildren(...window.ROUTINE.map(card));
  }

  function renderPrep() {
    const next = (selected % 7) + 1;
    const items = window.PREP[next] || [];
    const info = window.DUEL_DAYS[next - 1];
    const key = dateKey(dateForDuelDay(selected));
    $("prep-card").hidden = items.length === 0;
    $("prep-sub").textContent = `Next: ${next === 7 ? "Rest day" : `Day ${next}`}, ${info.title}`;
    $("prep-list").replaceChildren(...items.map((t, i) => checkItem(key, `prep:${next}:${i}`, t)));
  }

  function renderCheat() {
    $("cheat-body").replaceChildren(...window.CHEATSHEET.map(([item, when, pts, days]) =>
      el("tr", { class: days.includes(selected) ? "now" : "" },
        el("td", {}, item), el("td", {}, when), el("td", {}, pts))));
  }

  function updateProgress() {
    for (const card of document.querySelectorAll(".card.routine")) {
      const boxes = card.querySelectorAll("input[type=checkbox]");
      const done = [...boxes].filter((b) => b.checked).length;
      const p = card.querySelector(".progress");
      if (p) p.textContent = `${done}/${boxes.length}`;
      card.classList.toggle("complete", boxes.length > 0 && done === boxes.length);
    }
  }

  function renderStatus() {
    const now = new Date();
    const mins = Math.max(0, Math.round((nextReset(now) - now) / 60000));
    const h = Math.floor(mins / 60), m = mins % 60;
    const label = todayDay === 7 ? "Rest day" : `Duel Day ${todayDay}`;
    $("status").textContent = `${WEEKDAYS[today.getDay()]} · ${label} · resets in ${h}h ${String(m).padStart(2, "0")}m`;
  }

  function render() {
    renderTabs();
    renderDuel();
    renderRoutine();
    renderPrep();
    renderCheat();
    renderStatus();
    updateProgress();
  }

  function refreshDay() {
    const g = gameDate(new Date());
    const changed = !today || dateKey(g) !== dateKey(today);
    if (changed) {
      today = g;
      todayDay = duelDayOf(today);
      selected = todayDay;
      prune();
      render();
    } else {
      renderStatus();
    }
  }

  // ---- settings --------------------------------------------------------------

  $("settings-btn").addEventListener("click", () => {
    const s = $("settings");
    s.hidden = !s.hidden;
    $("settings-btn").setAttribute("aria-expanded", String(!s.hidden));
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

  refreshDay();
  setInterval(refreshDay, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshDay(); });
})();
