// Alliance Duel data from https://last-asylum-plague.fandom.com/wiki/Alliance_Duell_Guide
// Points are base values (before Alliance Duel research bonuses).

window.ROUTINE = [
  {
    id: "morning",
    title: "Morning",
    time: "~5 min",
    tasks: [
      { id: "login", text: "Claim login / attendance rewards and free chests" },
      { id: "caravan", text: "Use the free daily caravan reroll" },
      { id: "timers", text: "Start the longest build and research", note: "Try to have them finish on their Duel day (build → Day 2, research → Day 3)" },
      { id: "gather", text: "Send all idle squads out gathering" },
      { id: "help", text: "Alliance help and donations" },
    ],
  },
  {
    id: "midday",
    title: "Midday",
    time: "~3 min",
    tasks: [
      { id: "collect", text: "Collect resources and restart short timers" },
      { id: "help2", text: "Alliance help" },
      { id: "falcon", text: "Check Falcon Quests", note: "Leave them with the red dot so they don't expire, and redeem on a day that scores them (1, 3, 5)" },
    ],
  },
  {
    id: "evening",
    title: "Evening",
    time: "~5–10 min",
    tasks: [
      { id: "dailies", text: "Finish daily quests and open the milestone chests" },
      { id: "events", text: "Claim free event rewards" },
      { id: "duelchests", text: "Check the Duel chests for today's theme", note: "Spend only the items that match today's day" },
      { id: "overnight", text: "Queue long timers overnight", note: "Again, time them to finish on their matching Duel day" },
    ],
  },
];

// Each item: id, text, pts (base, display string), prio (high|med|low), note
window.DUEL_DAYS = [
  {
    day: 1,
    title: "Resources & Raven Items",
    headline: "Use ALL Raven Fruit & Raven Essence you saved this week.",
    actions: [
      { id: "falcon", text: "Complete Falcon Quests", pts: "25,500", prio: "high", note: "Free points, so do these first" },
      { id: "essence", text: "Consume Raven Essence", pts: "5,125", prio: "high", note: "Bulk-consume everything you saved" },
      { id: "stamina", text: "Consume Stamina", pts: "307.5", prio: "high", note: "Use as much as you have" },
      { id: "fruit", text: "Consume Raven Fruit", pts: "6.15", prio: "med", note: "Bulk-consume everything you saved" },
      { id: "gather", text: "Gather Grain / Timber / Herbs", pts: "10.25 / 100", prio: "med", note: "Keep every squad busy" },
      { id: "antitoxin", text: "Antitoxin (only if needed)", pts: "2.05 / 660", prio: "low", note: "Only if it's needed to reach the next chest and unlock more Fruit burns. Keep the rest for Day 4" },
    ],
    save: ["Hero Shards", "Skill Books", "Antitoxin", "Raven Gear Chests", "Speedups", "UR Caravans / Covert Ops"],
  },
  {
    day: 2,
    title: "Territory Development",
    headline: "Send UR Caravans and Covert Ops, then use construction speedups.",
    actions: [
      { id: "urcaravan", text: "Dispatch UR Caravans", pts: "210,000", prio: "high", note: "Use as many as you can" },
      { id: "urcovert", text: "Execute UR Covert Operations", pts: "157,500", prio: "high", note: "Use as many as you can" },
      { id: "conspeed", text: "Use Construction Speedups", pts: "127.5 / min", prio: "high", note: "Only where it helps your current progress" },
      { id: "recruit", text: "Recruit survivors", pts: "3,075", prio: "med", note: "Use all you have" },
      { id: "bmight", text: "Collect building upgrades (Building Might)", pts: "22.5", prio: "med", note: "Points only count when you tap the hammer icon, so collect builds that finished overnight now" },
    ],
    save: ["Hero Shards", "Skill Books", "Antitoxin", "Raven Gear Chests", "Training Boosts"],
  },
  {
    day: 3,
    title: "Research & Raven Gear Chests",
    headline: "Open every Raven Gear Chest you saved and use research speedups.",
    actions: [
      { id: "falcon", text: "Complete Falcon Quests", pts: "25,500", prio: "high", note: "Free points" },
      { id: "chest3", text: "Open Lv.3 Raven Gear Chests", pts: "20,500", prio: "high", note: "Best realistic chest" },
      { id: "chest2", text: "Open Lv.2 Raven Gear Chests", pts: "6,765", prio: "high", note: "" },
      { id: "chest1", text: "Open Lv.1 Raven Gear Chests", pts: "2,255", prio: "high", note: "Open them all" },
      { id: "resspeed", text: "Use Research Speedups", pts: "127.5 / min", prio: "high", note: "Use all of them" },
      { id: "scroll", text: "Consume Study Scrolls", pts: "615", prio: "med", note: "Use all you have" },
      { id: "tmight", text: "Collect research (Tech Might)", pts: "22", prio: "med", note: "Comes passively from finishing research" },
      { id: "chest4", text: "Open Lv.4+ Raven Gear Chests", pts: "61,500+", prio: "low", note: "Rare. Open any you have" },
    ],
    save: ["Hero Shards", "Skill Books", "Antitoxin", "Training Boosts", "UR Caravans / Covert Ops"],
  },
  {
    day: 4,
    title: "Hero Day",
    headline: "Use ALL Hero Shards, Skill Books and Antitoxin.",
    actions: [
      { id: "ssr", text: "Consume SSR Hero Shards", pts: "20,500", prio: "high", note: "Top priority. 10 shards = 205k" },
      { id: "sr", text: "Consume SR Hero Shards", pts: "7,175", prio: "high", note: "" },
      { id: "r", text: "Consume R Hero Shards", pts: "2,050", prio: "high", note: "" },
      { id: "recruit", text: "Recruit heroes", pts: "3,825", prio: "high", note: "As many times as you can" },
      { id: "antitoxin", text: "Use all Antitoxin", pts: "2.05 / 660", prio: "high", note: "Looks small, but a big stockpile can be worth 2M+ points" },
      { id: "books", text: "Consume Skill Books", pts: "20.5", prio: "high", note: "Use every one you saved" },
    ],
    save: ["Training Boosts", "Raven Essence / Fruit", "Raven Gear Chests", "UR Caravans / Covert Ops"],
  },
  {
    day: 5,
    title: "Training & Speedups",
    headline: "Train the highest-level soldiers you can (Lv.10 scores 5.5× Lv.1).",
    actions: [
      { id: "falcon", text: "Complete Falcon Quests", pts: "25,500", prio: "high", note: "Do these first" },
      { id: "trainspeed", text: "Use Training Boosts", pts: "127.5 / min", prio: "high", note: "Use everything you saved" },
      { id: "train10", text: "Train Lv.10 soldiers", pts: "264", prio: "high", note: "Lv.9 = 240, Lv.1 = 48" },
      { id: "camps", text: "Give each camp a different tier", pts: "", prio: "high", note: "Promote troops one level at a time for the most points" },
      { id: "otherspeed", text: "Use Construction / Research Speedups", pts: "127.5 / min", prio: "high", note: "Same rate as training boosts" },
      { id: "might", text: "Collect builds and research (Might)", pts: "22–22.5", prio: "med", note: "" },
    ],
    save: ["UR Caravans / Covert Ops", "Healing Speedups", "Raven Essence / Fruit", "Raven Gear Chests"],
  },
  {
    day: 6,
    title: "Combat & Final Speedups",
    headline: "Kills and losses both score. Fight in the right match.",
    actions: [
      { id: "urcaravan", text: "Dispatch UR Caravans", pts: "210,000", prio: "high", note: "Do this first" },
      { id: "urcovert", text: "Execute UR Covert Operations", pts: "157,500", prio: "high", note: "" },
      { id: "match", text: "Check which match counts as the \"specific match\"", pts: "", prio: "high", note: "Kills there score 5× normal kills" },
      { id: "kills", text: "Defeat soldiers in the specific match", pts: "132 / Lv.10", prio: "high", note: "Any match: 26.4" },
      { id: "losses", text: "Losses count too", pts: "22.55 / Lv.10", prio: "high", note: "" },
      { id: "speed", text: "Use ALL remaining speedups", pts: "127.5 / min", prio: "high", note: "Construction / Research / Training" },
      { id: "heal", text: "Use Healing Speedups after fighting", pts: "127.5 / min", prio: "med", note: "" },
      { id: "shield", text: "Shield up if you'll be offline", pts: "", prio: "med", note: "" },
    ],
    save: ["Raven Essence / Fruit (for Day 1)", "Raven Gear Chests", "Hero Shards", "Skill Books"],
  },
  {
    day: 7,
    title: "Rest Day",
    headline: "No Duel theme today. Just do the routine and get ready for Day 1.",
    actions: [
      { id: "falconstock", text: "Stock Falcon Quests for Day 1", pts: "", prio: "high", note: "Leave them on the red dot so they don't expire" },
      { id: "nospend", text: "Don't use Raven Essence or Fruit", pts: "", prio: "high", note: "" },
    ],
    save: ["Raven Essence / Fruit", "Hero Shards", "Skill Books", "Antitoxin", "Raven Gear Chests", "Speedups", "UR Caravans / Covert Ops"],
  },
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
