# Chat Context — 2026-07-05

This note captures planning context from a ChatGPT discussion with Adam Bell about **The Mind's Eye**. It is intended to preserve project direction for future AI agents, Codex sessions, and human contributors.

## Existing Direction Confirmed

The current repository direction should remain intact:

- **The Mind's Eye** is a historically grounded classroom RPG engine.
- The first prototype is the **Texarkana 1885 Quest Engine**.
- It should use real historical sources such as Sanborn Fire Insurance maps, Portal to Texas History records, OCR newspaper text, city directories, photographs, and other public records.
- The system should help teachers turn primary sources into D&D-like classroom missions.
- The game must clearly separate:
  1. verified historical facts,
  2. source-based inferences,
  3. fictional gameplay additions.

This note does **not** replace the existing `README.md` or `PROJECT_GOAL.md`. It extends them with implementation guidance from the conversation.

## Important Product Vision

The project is not just a single game about Texarkana. It should grow into a repeatable historical simulation framework that can support many towns.

A future teacher should be able to choose:

- a place,
- a year or time window,
- a subject,
- a grade level,
- and a standard or learning target,

and the system should generate a playable, source-grounded mission from that local history.

The first town is Texarkana, but the architecture should eventually allow additional town packs such as Wichita Falls, Waco, San Antonio, and other communities without rewriting the core code.

## Sanborn Map Accuracy Priority

Map accuracy is a major component of the project.

Students should be able to navigate through the historical town in ways that make real street sense. For example:

> I want to go down Fifth Street past the livery.

The system should be able to interpret that movement using the numbered Sanborn map layer, street layout, building index, and known historical locations.

For the prototype, this means the Sanborn map work should not be treated as decoration. It is a core gameplay and historical reasoning layer.

Map-related work should prioritize:

- accurate street names,
- accurate building placement,
- numbered building/location IDs,
- directionally consistent navigation,
- links from buildings to source records,
- and clear handling of uncertainty when a building's purpose, occupant, or owner is inferred rather than verified.

## Citation and Evidence UI Concept

A small citation icon should appear near historical claims, NPC dialogue, building details, events, and mission facts when source support exists.

The citation system should allow a user to click or inspect the evidence supporting a claim.

A possible visual rule:

- weak or single-source support = subtle citation icon,
- multiple supporting sources = stronger or more colorful citation indicator,
- uncertain inference = visually distinct from verified fact,
- fictional gameplay = clearly labeled as invented for engagement.

The purpose is to make historical evidence visible without overwhelming gameplay.

This should become a core design principle:

> Nothing historical in the world should exist without provenance.

## Inference Rule for Historical Content

The system should be allowed to infer likely people, businesses, ownership, relationships, and event context when primary sources are incomplete, but it must never present those inferences as verified fact.

Examples:

- If a newspaper mentions an event at a business, and a directory or map identifies the business location, the system may infer a connection.
- If a business owner name appears in one source and the building appears on the Sanborn map, the system may connect them with an appropriate confidence level.
- If the connection is uncertain, it must be labeled as an inference and cite the evidence that led to that conclusion.

The project should support confidence scoring and source chaining over time.

## Suggested Future Architecture Principle

Do not force every town into custom code. Treat each town as a data/content package connected to a shared engine.

A future town package may contain:

```text
towns/
  texarkana/
    metadata.json
    timeline.json
    maps/
    buildings/
    businesses/
    citizens/
    newspapers/
    missions/
    citations/
```

The exact folder structure can evolve, but the principle matters: adding a new town should primarily mean adding structured historical data, sources, and content — not rebuilding the application.

## Engine Separation Concept

Future development may benefit from keeping these concerns separate:

1. **World / Map Engine**
   - streets,
   - buildings,
   - movement,
   - locations,
   - time/place boundaries.

2. **Knowledge / Citation Engine**
   - historical facts,
   - source metadata,
   - inference chains,
   - confidence scoring,
   - citation display.

3. **Story / Mission Engine**
   - teacher-selected standards,
   - mission generation,
   - NPC dialogue,
   - classroom challenges,
   - grade-level adaptation.

4. **Game / Classroom Engine**
   - players,
   - groups,
   - choices,
   - inventory or clues,
   - progress tracking,
   - teacher controls.

This separation is not a required rewrite. It is guidance for future planning so the project remains scalable.

## Grant / Funding Context

The project may be a candidate for non-dilutive funding. The preferred funding direction discussed was grant support that does not require giving up ownership rights.

Potential framing:

> An AI-powered historical simulation platform that helps teachers generate standards-aligned, evidence-based learning missions from local primary sources.

Potential funding categories to research further:

- education technology SBIR/STTR grants,
- local history / humanities grants,
- rural education innovation grants,
- university or museum partnerships,
- civic learning and primary-source literacy funding.

Important caution:

Before accepting development help, accelerator support, university partnership work, or grant-connected services, the project should protect ownership and IP rights in writing.

## Immediate Development Caution

Future AI agents and contributors should not casually restructure the repository just because a more complex architecture is imaginable.

The existing system is intentionally simple right now:

```text
The-Minds-Eye/
  README.md
  PROJECT_GOAL.md
  docs/
  prompts/
  data/
  src/
  tests/
```

That simple structure is acceptable for the early prototype. Any expansion should serve the prototype, not distract from it.

## Current North Star

Build the smallest working version that proves this loop:

1. ingest real historical source material,
2. connect it to a numbered Sanborn/location map,
3. distinguish verified fact, inference, and fiction,
4. generate one playable classroom mission,
5. show teacher-facing citations and source notes,
6. allow students to experience local history as an explorable world.

If that loop works for Texarkana 1885, then the system can begin growing toward other towns and broader school use.
