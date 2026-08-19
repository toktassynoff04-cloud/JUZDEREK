# JUZDEREK Project Map

> Repository architecture map. Update this file when navigation, state ownership, reward logic, or major components change.

## Core flow

```text
index.html
  → periods.html
  → period cards
  → topic cards
  → topic-routing.js
  → games.html?topic=<id>&mode=<mode>
  → games-engine.js
  → result-screen.js
```

`games.html` without a valid `topic` must return to `periods.html`.

## Main pages

### index.html
Home/landing page. Main scripts: `site-header-component.js`, `real-stats-progress.js`.

### periods.html
Main learning dashboard. Owns period selection, topic selection, daily mission entry, recent activity, personal progress board, and level journey.

Important files:
- `dashboard.js`
- `reference.js`
- `period-progress.js`
- `topic-card-lite.js`
- `topic-routing.js`
- `real-stats-progress.js`
- `level-journey.js`
- `ux-hotfix.js`

### games.html
Topic game shell. Modes: `cards`, `quiz`, `person`, `chrono`.

Important files:
- `data/topics.js`
- `games-engine.js`
- `chrono-game.js`
- `mistakes.js`
- `result-screen.js`
- `achievements-system.js`

## State keys

### juzderek_game_progress
```js
{ xp, correct, games }
```
Global player totals.

### juzderek_topics_progress
Per-topic state:
```js
{
  "<topicId>": {
    completed: ["cards","quiz","person","chrono"],
    scores: {},
    rewarded: {},
    corrected: {},
    topicBonus: Boolean,
    updatedAt: Number
  }
}
```
A topic is mastered when all 4 modes are in `completed`.

### juzderek_learning_meta
Streak state: `lastDay`, `streak`, `bestStreak`, `daily`.

### juzderek_daily_activity
Daily mission state:
```js
{ "YYYY-MM-DD": { games, xp, masteredAtStart, bonus, modes } }
```

### juzderek_daily_xp
Yesterday/today and 7-day XP history.

### juzderek_username
Shared username.

### juzderek_seen_achievements
Achievement notification state.

## Reward ownership

Canonical reward writer: `games-engine.js`.

Rules:
- No XP per correct answer.
- XP is granted once when a mode is completed for the first time.
- Replaying the same topic+mode gives 0 XP.
- Current mode rewards: cards 50, quiz 100, person 80, chrono 100 XP.
- Completing all 4 modes grants a one-time 200 XP topic bonus.
- Correct-answer counter is separately deduplicated with `corrected` keys.

`next-ux.js` must not calculate game rewards.

## Levels and ranks

Ranks:
- Ізденуші — 0 XP
- Зерттеуші — 1,200 XP
- Білгір — 3,500 XP
- Сарапшы — 9,500 XP
- Тарихшы — 20,000 XP
- Аңыз — 38,000 XP

Levels: Lv.1–Lv.15. UI owner: `level-journey.js` and shared header rank logic.

## Daily Mission

Owner on `periods.html`: `ux-hotfix.js`.

Entry points:
- navbar `Бүгінгі миссия`
- mission metric card
- `#dailyMission` hash

All entry points call one `openMission()` implementation.

Mascot: `assets/mascot-daily-mission.webp`.
Missions are deterministic per local date and balanced across games / XP / mode / mastery.

## Progress Board

Owner: `real-stats-progress.js`.

Shows:
- yesterday XP
- today XP
- delta
- 7-day graph
- large modal on click

Leaderboard is not part of active product flow.

## Topic cards

Files:
- `topic-card-lite.js`
- `period-progress.js`
- related CSS
- `ux-hotfix.css`

Rules:
- `.topic-go` is arrow/action only.
- Progress is a separate `.topic-live-progress` block.
- Never render progress twice.

## Period backgrounds

- Medieval: `assets/period-bg-medieval.webp`
- Modern: `assets/period-bg-modern.webp`
- Contemporary: `assets/period-bg-contemporary.webp`

Use as hero/container backgrounds with `cover`; no overflow or distortion.

## Mascots

- Daily mission: `assets/mascot-daily-mission.webp`
- Progress card: `assets/mascot-progress-card.webp`
- Achievement: `assets/achievement-mascot.webp`
- Main mascot: `assets/mascot-main.webp`

Never globally overwrite every `.mascot` source; component-specific assets win.

## Change impact guide

Games / XP:
1. `games-engine.js`
2. `result-screen.js`
3. `chrono-game.js`
4. `real-stats-progress.js`
5. `achievements-system.js`

Topic cards:
1. `topic-card-lite.js`
2. `period-progress.js`
3. related CSS
4. `ux-hotfix.css`

Daily mission:
1. `ux-hotfix.js`
2. `ux-hotfix.css`
3. `periods.html`
4. shared header only if nav changes

Progress board:
1. `real-stats-progress.js`
2. `real-stats-progress.css`
3. `periods.html`

Levels / ranks:
1. `level-journey.js`
2. `level-journey.css`
3. `site-header-component.js`

Before changes: read this map, identify subsystem, open only affected files, check duplicate ownership, make smallest scoped change, then update this map if architecture changes.