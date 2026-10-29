// Alliance Duel data from https://last-asylum-plague.fandom.com/wiki/Alliance_Duell_Guide
// Cheat-sheet points are base values (before Alliance Duel research bonuses).

window.ROUTINE = [
  {
    id: "morning",
    title: "Morning",
    time: "8:15",
    // groups split a block under sub-headers; ids stay unique across the whole block
    groups: [
      {
        title: "Base",
        tasks: [
          { id: "vip-pack", text: "Claim VIP daily free pack" },
          { id: "vip-points", text: "Claim VIP 200 points" },
          { id: "sanctuary-idle", text: "Claim Sanctuary idle rewards" },
          { id: "camp-idle", text: "Claim Explorer's Camp idle rewards" },
          { id: "falcon", text: "Complete Falcon Quests" },
          { id: "alliance-research", text: "Donate to Alliance Research" },
          { id: "caravans", text: "Dispatch 2 caravans" },
          { id: "soldiers", text: "Collect and start new soldiers" },
          { id: "covert-ops", text: "Dispatch and help covert ops" },
          { id: "freebies", text: "Collect various freebies" },
          { id: "builds-research", text: "Start new builds and research for the day" },
        ],
      },
      {
        title: "Alliance duel",
        tasks: [
          { id: "duel-research", text: "Check research for opportunities to maximise points" },
          { id: "duel-plan", text: "Plan out tasks to complete to achieve points" },
        ],
      },
    ],
  },
  {
    id: "midday",
    title: "Midday",
    time: "13:00",
    tasks: [
      { id: "sanctuary-idle", text: "Claim Sanctuary idle rewards" },
      { id: "alliance-research", text: "Donate to Alliance Research" },
      { id: "falcon", text: "Complete Falcon Quests" },
      { id: "covert-ops", text: "Dispatch and help covert ops" },
    ],
  },
  {
    id: "evening",
    title: "Evening",
    time: "20:15",
    tasks: [
      { id: "sanctuary-idle", text: "Claim Sanctuary idle rewards" },
      { id: "camp-idle", text: "Claim Explorer's Camp idle rewards" },
      { id: "alliance-research", text: "Donate to Alliance Research" },
      { id: "falcon", text: "Complete 2 sets of Falcon Quests back to back" },
      { id: "hero-pass", text: "Complete daily objective for Hero Pass" },
      { id: "plunder", text: "Plunder caravans and ops" },
      { id: "daily-quests", text: "Complete daily quests" },
      { id: "alliance-duel", text: "Complete Alliance Duel" },
    ],
  },
  {
    id: "final-shift",
    title: "Final shift",
    time: "22:30",
    tasks: [
      { id: "chests", text: "Open up chests" },
      { id: "dismantle-gear", text: "Disassemble gear" },
      { id: "ur-gear", text: "Attempt to make UR gear" },
      { id: "diamonds", text: "Consume Diamonds" },
    ],
  },
];

// objectives: the few things that score best that day, shown under "Objective today".
// "Save for tomorrow" lists the next scoring day's objectives (the rest day is skipped).
window.DUEL_DAYS = [
  { day: 1, title: "Resources & Raven Items", objectives: ["Raven Essence", "Raven Fruit", "Falcon Quests", "Stamina"] },
  { day: 2, title: "Territory Development", objectives: ["UR Caravans", "UR Covert Ops", "Construction speedups", "Survivor recruitment"] },
  { day: 3, title: "Research & Raven Gear Chests", objectives: ["Raven Gear Chests", "Falcon Quests", "Research speedups", "Study Scrolls"] },
  { day: 4, title: "Hero Day", objectives: ["Hero Shards", "Skill Books", "Antitoxin", "Hero recruitment"] },
  { day: 5, title: "Training & Speedups", objectives: ["Falcon Quests", "Training speedups", "Soldier training"] },
  { day: 6, title: "Combat & Final Speedups", objectives: ["UR Caravans", "UR Covert Ops", "Combat in the specific match", "Healing speedups", "Remaining speedups"] },
  { day: 7, title: "Rest Day", objectives: [], note: "Nothing scores today. Just do the routine." },
];

// What to set up the day *before* each Duel day (indexed by the upcoming day)
window.PREP = {
  1: ["Leave Falcon Quests on the red dot", "Count your Raven Essence and Fruit"],
  2: ["Start long builds that will finish after reset", "Save UR Caravans and Covert Ops"],
  3: ["Start long research that will finish after reset", "Leave Falcon Quests on the red dot"],
  4: ["Keep all Hero Shards, Skill Books and Antitoxin"],
  5: ["Stock up on low-tier troops to promote", "Leave Falcon Quests on the red dot"],
  6: ["Coordinate targets with your alliance", "Keep UR Caravans and Covert Ops for tomorrow"],
  7: [],
};

window.CHEATSHEET = [
  ["Raven Essence", "Day 1", "5,125", [1]],
  ["Raven Fruit", "Day 1", "6.15", [1]],
  ["Falcon Quest", "Days 1, 3, 5", "25,500", [1, 3, 5]],
  ["UR Caravan", "Day 2 or 6", "210,000", [2, 6]],
  ["UR Covert Op", "Day 2 or 6", "157,500", [2, 6]],
  ["Raven Gear Chest Lv.1–3", "Day 3", "2,255–20,500", [3]],
  ["Raven Gear Chest Lv.4+", "Day 3", "61,500+", [3]],
  ["Study Scroll", "Day 3", "615", [3]],
  ["SSR / SR / R Shard", "Day 4", "20,500 / 7,175 / 2,050", [4]],
  ["Skill Book", "Day 4", "20.5", [4]],
  ["Antitoxin (per 660)", "Day 4", "2.05", [4]],
  ["Training Boost (1m)", "Day 5", "127.5", [5]],
  ["Healing Speedup (1m)", "Day 6", "127.5", [6]],
  ["Construction / Research (1m)", "Day 2 / 3 (or 5, 6)", "127.5", [2, 3, 5, 6]],
];
