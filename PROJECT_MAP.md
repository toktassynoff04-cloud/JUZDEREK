# JUZDEREK Project Map

## Core flow

```text
index.html
  → periods.html
  → topic card
  → games.html?topic=<id>&mode=<mode>
  → topics-index.js
  → topic-loader.js
  → one topic JSON only
  → games-engine-v2.js
  → result-screen.js
```

`games.html` without a valid topic returns to `periods.html`.

## Content v2

### File structure

```text
data/
├── topics-index.js
├── content-validator.js
├── topic-loader.js
└── topics/
    ├── ancient-persia.json
    ├── ancient-greece.json
    └── ...
```

Each topic is a separate JSON file. The learner downloads only the opened topic JSON.

### Immutable content rule

**CONTENT IS IMMUTABLE.**

Author-provided historical text is never rewritten, corrected, shortened, expanded, inferred, or supplemented. The game engine may only read it and reorder authored items for gameplay.

No game may invent dates, events, people, clues, distractors, or chronology sets.

### 4 canonical games

1. Cards — all `facts`: date → event.
2. Date quiz — all `facts`: date + correct event + exactly 3 configured `distractorIds`.
3. Person — all `people`: clues → person.
4. Chronology — every configured `chronologySets` task.

Content volume equals game volume:
- N facts → N cards + N date questions
- N people → N person questions
- N chronologySets → N chronology tasks

Chronology rules:
- 5–10 tasks per topic
- exactly 4 fact ids per task
- engine only shuffles display order
- engine never generates a new chronology set

### Publish gate

Every topic must pass Content Validator before becoming ready.

Validation checks:
- unique fact/person ids
- non-empty dates/events/names/clues
- exactly 3 valid distractorIds per fact
- no self/duplicate distractors
- at least 4 people
- 5–10 chronology tasks
- exactly 4 valid unique fact ids per chronology task

CLI check:

```bash
node scripts/validate-content.mjs
```

Runtime validation remains as a safety net. Learners see a friendly unavailable state, never technical validation details.

## Progress / replay

Canonical reward writer: `games-engine-v2.js`.

Rules:
- no XP per correct answer
- XP once per first completed topic+mode
- replay remains available
- replay does not remove completion
- replay gives no duplicate XP
- all authored content is shown again on replay
- all 4 modes completed = topic mastered

## Ownership

- Topic JSON = what we teach
- Game engine = how we practice
- UI/CSS = how it is displayed
- Validator = whether content is publishable

## Change impact

Content addition:
1. create `data/topics/<topic-id>.json`
2. run `node scripts/validate-content.mjs`
3. after pass, add/update `data/topics-index.js`
4. never modify authored text in engine/UI

Daily mission icon styling: `mission-icon-fix.css`.

Before changes: read this map, identify the subsystem, validate content, then batch deploys.
