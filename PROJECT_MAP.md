# JUZDEREK Project Map

## Core flow

```text
index.html
  → periods.html
  → topic card
  → games.html?topic=<id>&mode=<mode>
  → data/topics-index.js
  → data/topic-loader.js
  → data/topics/<topic-id>.json
  → games-engine-v2.js
  → result-screen.js
```

`games.html` without a valid topic returns to `periods.html`.

## Content v2

### File structure

```text
data/
├── topics-index.js        # generated registry + static navigation patch
├── content-validator.js
├── topic-loader.js
├── topic-v2.schema.json
└── topics/
    ├── ancient-persia.json
    ├── ancient-greece.json
    └── ...

scripts/
├── build-topics-index.mjs
├── build-content.mjs
└── validate-content.mjs
```

Each topic is a separate JSON file. The learner downloads only the opened topic JSON.

### Adding a topic

1. Create `data/topics/<topic-id>.json`.
2. Run:

```bash
node scripts/build-content.mjs
```

This command regenerates `data/topics-index.js` from every JSON file and then runs content validation. Do not hand-edit generated topic registry entries.

`topics-index.js` contains a marker:

```text
// === GENERATED INDEX END / STATIC NAVIGATION PATCH BELOW ===
```

Everything above it is generated. The navigation patch below it is preserved by the generator.

### Immutable content rule

**CONTENT IS IMMUTABLE.**

Author-provided historical text is never rewritten, corrected, shortened, expanded, inferred, or supplemented by UI/game code. The engine may only read and reorder authored items for gameplay.

### 4 canonical games

1. Cards — all `facts`: date → event.
2. Date quiz — all `facts`: date + correct event + exactly 3 distractors.
3. Person — all `people`: clues → person.
4. Chronology — configured chronology tasks.

### Publish gate

Every ready topic must pass Content Validator.

Validation checks include:
- unique fact/person ids
- non-empty dates/events/names/clues
- exactly 3 valid distractors per fact after runtime normalization
- no self/duplicate distractors
- at least 4 people
- 5–10 chronology tasks
- exactly 4 valid unique fact ids per chronology task

CLI:

```bash
node scripts/validate-content.mjs
```

## Progress / replay

Canonical reward writer: `games-engine-v2.js`.

User data keys such as XP, streak, tracker progress, achievements and recent activity are persistent learner data. UI/content migrations must never clear localStorage, rename active keys without migration, or overwrite existing values with defaults.

Rules:
- no XP per correct answer
- XP once per first completed topic+mode
- replay remains available
- replay gives no duplicate XP
- all 4 modes completed = topic mastered

## Level journey

Active files:
- `level-journey.js`
- `level-journey.css`
- `assets/level-seeker.webp`
- `assets/level-researcher.webp`
- `assets/level-scholar.webp`
- `assets/level-expert.webp`
- `assets/level-historian.webp`
- `assets/level-legend.webp`

The rank system remains: Ізденуші → Зерттеуші → Білгір → Сарапшы → Тарихшы → Аңыз.

## Active / legacy cleanup

Removed legacy/orphan files:
- `app.js`
- `games.js`
- `games-engine.js` (superseded by `games-engine-v2.js`)
- `chrono-game.js`
- `achievements-nav.js`
- `leaderboard-full.js`
- `leaderboard-full.css`
- `profile-menu.js`
- `landing-v2.html`

Do not reintroduce these names without an explicit architecture decision.

## Ownership

- Topic JSON = what we teach
- Index generator = topic discovery/registry
- Game engine = how we practice
- UI/CSS = how it is displayed
- Validator = whether content is publishable
- localStorage progress = learner-owned persistent state

## Deployment discipline

Batch changes on a feature/dev branch. Do not trigger Production unless explicitly requested. Before deployment: build content, validate, verify responsive UI, and confirm no user-data reset/migration risk.
