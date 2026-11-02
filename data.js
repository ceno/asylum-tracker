// Alliance Duel data from https://last-asylum-plague.fandom.com/wiki/Alliance_Duell_Guide
//
// `icon` and `art` name an image in assets/ (without .webp). Its prefix says what it is:
//   i-  an item, drawn on a tile coloured by ICON_RARITY
//   b-  a building, drawn as is
//   h-  hero art, cropped to the face on the Duel banner
//   art- a scene, cropped like hero art

window.ROUTINE = [
  {
    id: "morning",
    title: "Morning",
    time: "8:15",
    art: "b-sanctuary",
    // groups split a block under sub-headers; ids stay unique across the whole block.
    // A group or task with `duel: true` is hidden on the Duel rest day, when nothing scores.
    // A task with `notSunday: true` is hidden on the server's Sunday.
    groups: [
      {
        title: "Base",
        tasks: [
          { id: "vip-pack", text: "Claim VIP daily free pack", icon: "i-deluxe-chest" },
          { id: "vip-points", text: "Claim VIP 200 points", icon: "i-vip-points" },
          { id: "sanctuary-idle", text: "Claim Sanctuary idle rewards", icon: "b-sanctuary" },
          { id: "camp-idle", text: "Claim Explorer's Camp idle rewards", icon: "b-explorers-camp" },
          { id: "falcon", text: "Complete Falcon Quests", icon: "b-falcon-tower" },
          { id: "alliance-research", text: "Donate to Alliance Research", icon: "i-help-research" },
          { id: "caravans", text: "Dispatch 2 caravans", icon: "i-trade-agreement" },
          { id: "soldiers", text: "Collect and start new soldiers", icon: "i-train-now" },
          { id: "recruit-survivor", text: "Recruit 1 survivor", icon: "i-survivor-ticket" },
          { id: "covert-ops", text: "Dispatch and help covert ops", icon: "i-covert-order" },
          { id: "help-ops", text: "Help alliance ops", icon: "i-alliance-aid" },
          { id: "demon-king", text: "Fight Demon King 3 times", icon: "i-eliminate", notSunday: true },
          { id: "free-stamina", text: "Consume free stamina", icon: "i-stamina" },
          { id: "freebies", text: "Collect various freebies", icon: "i-resource-supply" },
          { id: "builds-research", text: "Start new builds and research for the day", icon: "i-build-hammer" },
        ],
      },
      {
        title: "Alliance duel",
        duel: true,
        tasks: [
          { id: "duel-research", text: "Check research for opportunities to maximise points", icon: "i-instant-research" },
          { id: "duel-plan", text: "Plan out tasks to complete to achieve points", icon: "i-outstanding" },
        ],
      },
    ],
  },
  {
    id: "midday",
    title: "Midday",
    time: "13:00",
    art: "b-alliance-hall",
    tasks: [
      { id: "sanctuary-idle", text: "Claim Sanctuary idle rewards", icon: "b-sanctuary" },
      { id: "alliance-research", text: "Donate to Alliance Research", icon: "i-help-research" },
      { id: "covert-ops", text: "Dispatch and help covert ops", icon: "i-covert-order" },
      { id: "help-ops", text: "Help alliance ops", icon: "i-alliance-aid" },
    ],
  },
  {
    id: "evening",
    title: "Evening",
    time: "20:15",
    art: "b-falcon-tower",
    tasks: [
      { id: "sanctuary-idle", text: "Claim Sanctuary idle rewards", icon: "b-sanctuary" },
      { id: "camp-idle", text: "Claim Explorer's Camp idle rewards", icon: "b-explorers-camp" },
      { id: "alliance-research", text: "Donate to Alliance Research", icon: "i-help-research" },
      { id: "falcon", text: "Complete 2 sets of Falcon Quests back to back", icon: "b-falcon-tower" },
      { id: "hero-pass", text: "Complete daily objective for Hero Pass", icon: "i-recruit-ticket" },
      { id: "plunder", text: "Plunder caravans and ops", icon: "i-territory-raid" },
      { id: "daily-quests", text: "Complete daily quests", icon: "i-sign-medal" },
      { id: "alliance-duel", text: "Complete Alliance Duel", icon: "i-rally", duel: true },
    ],
  },
  {
    id: "final-shift",
    title: "Final shift",
    time: "22:30",
    art: "b-watchtower",
    tasks: [
      { id: "daily-quests", text: "Last claim of daily quests", icon: "i-sign-medal" },
      { id: "chests", text: "Open up chests", icon: "i-gear-chest" },
      { id: "dismantle-gear", text: "Disassemble gear", icon: "i-refined-iron" },
      { id: "ur-gear", text: "Attempt to make UR gear", icon: "i-ur-sword" },
      { id: "diamonds", text: "Consume Diamonds", icon: "i-diamonds" },
    ],
  },
];

// Shops whose stock resets each week (after Sunday) or each month. On a shop's last day, it's
// listed in a "Last chance to buy" card at the top. Ticks are kept as `last-chance:<id>`.
window.LAST_CHANCE = [
  { id: "honor-shop", text: "Buy what you want in the Honor Shop", resets: "month", icon: "b-hall-of-honor" },
  { id: "alliance-shop", text: "Buy what you want in the Alliance Shop", resets: "week", icon: "i-alliance-coins" },
  { id: "vip-shop", text: "Buy what you want in the VIP Shop", resets: "week", icon: "i-vip-points" },
  { id: "expedition-shop", text: "Buy what you want in the Expedition Shop", resets: "week", icon: "b-explorers-camp" },
  { id: "sanctuary-shop", text: "Buy what you want in the Sanctuary Shop", resets: "week", icon: "b-sanctuary" },
];

// objectives: the few things that score best that day, shown under "Anytime" or on the
// Survival Battle timeline. "Save for tomorrow" lists the next scoring day's objectives
// (the rest day is skipped).
// An objective with `sb` also scores in Survival Battle rounds of that theme, so it's shown at
// those rounds' times instead of under "Anytime".
// `art` is the picture on the day's banner and `icon` the one on its day button.
window.DUEL_DAYS = [
  { day: 1, title: "Enhance Raven", art: "b-falcon-tower-lg", icon: "i-raven-essence", objectives: [
    { text: "Raven Essence", icon: "i-raven-essence" },
    { text: "Falcon Quests", icon: "b-falcon-tower" },
    { text: "Stamina", icon: "i-stamina", sb: "raven" },
    { text: "Raven Fruit", icon: "i-raven-fruit", sb: "raven" },
    { text: "Gather Grain, Timber and Herbs", icon: "i-resource-supply" },
    { text: "Antitoxin", icon: "i-antitoxin", sb: "heroes" },
  ] },
  { day: 2, title: "Territory Development", art: "h-harper", icon: "i-construction-speedup", objectives: [
    { text: "UR Caravans", icon: "i-trade-agreement" },
    { text: "UR Covert Ops", icon: "i-covert-order" },
    { text: "Construction speedups", icon: "i-construction-speedup", sb: "territory" },
    { text: "Building Might (finish builds)", icon: "i-build-hammer", sb: "territory" },
    { text: "Survivor recruitment", icon: "i-survivor-ticket" },
  ] },
  { day: 3, title: "Research & Raven Gear Chests", art: "h-grenwald", icon: "i-raven-chest", objectives: [
    { text: "Raven Gear Chests", icon: "i-raven-chest" },
    { text: "Falcon Quests", icon: "b-falcon-tower" },
    { text: "Research speedups", icon: "i-research-speedup", sb: "research" },
    { text: "Study Scrolls", icon: "i-study-scroll" },
    { text: "Tech Might (finish research)", icon: "i-instant-research", sb: "research" },
  ] },
  { day: 4, title: "Hero Day", art: "h-marlena", icon: "i-hero-shard", objectives: [
    { text: "Hero Shards", icon: "i-hero-shard" },
    { text: "Skill Books", icon: "i-skill-book" },
    { text: "Antitoxin", icon: "i-antitoxin", sb: "heroes" },
    { text: "Hero recruitment", icon: "i-recruit-ticket", sb: "heroes" },
  ] },
  { day: 5, title: "Training & Speedups", art: "h-arthur", icon: "i-training-speedup", objectives: [
    { text: "Soldier training", icon: "i-train-now", sb: "training" },
    { text: "Training speedups", icon: "i-training-speedup", sb: "training" },
    { text: "Building Might (finish builds)", icon: "i-build-hammer", sb: "territory" },
    { text: "Tech Might (finish research)", icon: "i-instant-research", sb: "research" },
    { text: "Research speedups", icon: "i-research-speedup", sb: "research" },
    { text: "Construction speedups", icon: "i-construction-speedup", sb: "territory" },
    { text: "Falcon Quests", icon: "b-falcon-tower" },
  ] },
  { day: 6, title: "Combat & Final Speedups", art: "h-daskal", icon: "i-eliminate", objectives: [
    { text: "UR Caravans", icon: "i-trade-agreement" },
    { text: "UR Covert Ops", icon: "i-covert-order" },
    { text: "Kills in the specific match", icon: "i-eliminate" },
    { text: "Soldier losses", icon: "i-weakened" },
    { text: "Healing speedups", icon: "i-healing-speedup" },
    { text: "Construction speedups", icon: "i-construction-speedup", sb: "territory" },
    { text: "Training speedups", icon: "i-training-speedup", sb: "training" },
    { text: "Research speedups", icon: "i-research-speedup", sb: "research" },
  ] },
  { day: 7, title: "Rest Day", art: "art-raven", icon: "i-feather", objectives: [],
    note: "Nothing scores in the Duel today, but Survival Battle still runs." },
];

// Survival Battle: 6 rounds of 4 hours a day, counted from the daily reset, each with one theme.
// The schedule is copied from the in-game calendar, whose Day N is Duel Day N-1 (its Day 1 is the
// rest day). Themes run in a fixed cycle and each day starts one theme later than the day before,
// except Duel Day 1, which starts one theme earlier than the rest day.
window.SURVIVAL_BATTLE = {
  rounds: 6,
  hours: 4,
  // Only rounds that overlap these local hours are shown. An objective whose rounds are all
  // outside them goes back under "Anytime", since it still scores in the Duel.
  show: { from: 8, to: 24 },
  themes: {
    territory: "Build Territory",
    training: "Train Soldiers",
    research: "Technology Research",
    raven: "Enhance Raven",
    heroes: "Enhance Heroes",
  },
  // Shown with the theme's name on the rest day, when no Duel objectives score, and on every round
  // with "Show all" on.
  icons: {
    territory: "i-construction-speedup",
    training: "i-training-speedup",
    research: "i-research-speedup",
    raven: "i-raven-essence",
    heroes: "i-hero-shard",
  },
  schedule: {
    1: ["heroes", "territory", "training", "research", "raven", "heroes"],
    2: ["territory", "training", "research", "raven", "heroes", "territory"],
    3: ["training", "research", "raven", "heroes", "territory", "training"],
    4: ["research", "raven", "heroes", "territory", "training", "research"],
    5: ["raven", "heroes", "territory", "training", "research", "raven"],
    6: ["heroes", "territory", "training", "research", "raven", "heroes"],
    7: ["territory", "training", "research", "raven", "heroes", "territory"],
  },
};

// What to set up the day *before* each Duel day (indexed by the upcoming day).
// Ticks are kept by position as `prep:<day>:<n>`, so add new items at the end.
window.PREP = {
  1: [
    { text: "Leave Falcon Quests on the red dot", icon: "b-falcon-tower" },
    { text: "Count your Raven Essence and Fruit", icon: "i-raven-essence" },
  ],
  2: [
    { text: "Start long builds that will finish after reset", icon: "i-build-hammer" },
    { text: "Save UR Caravans and Covert Ops", icon: "i-trade-agreement" },
  ],
  3: [
    { text: "Start long research that will finish after reset", icon: "i-instant-research" },
    { text: "Leave Falcon Quests on the red dot", icon: "b-falcon-tower" },
  ],
  4: [
    { text: "Keep all Hero Shards, Skill Books and Antitoxin", icon: "i-hero-shard" },
  ],
  5: [
    { text: "Start long builds and research that will finish after reset", icon: "i-build-hammer" },
    { text: "Stock up on low-tier troops to promote", icon: "i-training-speedup" },
    { text: "Leave Falcon Quests on the red dot", icon: "b-falcon-tower" },
  ],
  6: [
    { text: "Coordinate targets with your alliance", icon: "i-rally" },
    { text: "Keep UR Caravans and Covert Ops for tomorrow", icon: "i-trade-agreement" },
  ],
  7: [],
};

// The tile colour behind each item icon (i-), as the game frames items by rarity. Blue unless listed.
window.ICON_RARITY = {
  purple: ["i-raven-essence", "i-raven-fruit", "i-raven-chest", "i-feather", "i-hero-shard", "i-skill-book", "i-study-scroll"],
  orange: ["i-trade-agreement", "i-covert-order", "i-deluxe-chest", "i-ur-sword", "i-recruit-ticket", "i-vip-points", "i-eliminate", "i-rally"],
  green: ["i-resource-supply", "i-survivor-ticket", "i-alliance-aid", "i-help-research", "i-sign-medal", "i-refined-iron"],
  gold: ["i-alliance-coins", "i-gear-chest", "i-outstanding", "i-territory-raid", "i-build-hammer", "i-weakened"],
};
