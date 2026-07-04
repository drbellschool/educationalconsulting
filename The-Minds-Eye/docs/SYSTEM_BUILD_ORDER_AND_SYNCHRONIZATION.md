# System Build Order and Synchronization

## Purpose

The Mind's Eye has many interconnected systems. They must be built in the correct order so the platform remains accurate, scalable, and instructionally valid.

## Build Principle

Build the trust layer before the magic layer.

Do not build rich AI quest generation until sources, provenance, maps, TEKS, and review workflows exist.

## Correct Build Order

### Phase 1: Provenance and Source Foundation

Build:

- source records
- citation model
- provenance labels
- confidence scores
- source integrity tables

Why first:

Everything depends on knowing what is verified, inferred, simulated, or creative.

### Phase 2: TEKS and Mastery Foundation

Build:

- TEKS database
- subject/course picker
- student expectation selector
- mastery evidence schema
- success criteria model

Why second:

The platform must know what students are supposed to master before quests are generated.

### Phase 3: Sanborn Map Builder

Build:

- sheet retrieval
- index sheet identification
- feature extraction
- draft city database
- building IDs
- street graph
- map review workflow

Why third:

The map is the world. No accurate town simulation exists without a reviewed map package.

### Phase 4: Community Review Dashboard

Build:

- map review interface
- fact review interface
- sensitive content flags
- approval states
- audit log

Why fourth:

Human review is required before generated maps and town data become student-facing.

### Phase 5: Historical Digital Twin

Build:

- town model
- building/location model
- institutions
- people
- rail assets
- commerce assets
- source-linked city database

Why fifth:

This converts reviewed map/source data into a reusable town model.

### Phase 6: Visual Map Generator

Build:

- top-down map renderer
- zoom levels
- label system
- unknown building display
- selectable buildings

Why sixth:

The visual map should only be generated from reviewed data.

### Phase 7: World Engine

Build:

- world state
- ledger
- NPC state
- reputation
- travel
- consequence engine
- item ownership

Why seventh:

Now the approved town can become interactive.

### Phase 8: Railroad, Commerce, Institution, Justice Engines

Build:

- train events
- commerce tables
- church/community concerns
- sheriff/court scenarios
- inventory item use

Why eighth:

These systems give the town motion and generate new quest branches.

### Phase 9: Lesson and Quest Generator

Build:

- teacher request parser
- TEKS-to-scenario matcher
- source-grounded quest generator
- mastery evidence planner
- role cards
- dice/check moments

Why ninth:

Generation should come after the data and world systems are trustworthy.

### Phase 10: Teacher Dashboard

Build:

- lesson request flow
- TEKS picker
- source approval
- map approval status
- class launch
- live controls
- mastery dashboard

### Phase 11: Student Dashboard

Build:

- role card
- mission view
- map view
- evidence notebook
- item inventory
- dice/check panel
- vocabulary coach
- accessibility supports

### Phase 12: AI Visuals and Avatars

Build:

- historical scene generation
- map visual polish
- optional avatar generation
- moderation checks
- teacher approval

Why last:

Visual richness must not outrun data accuracy, student privacy, or teacher control.

## Synchronization Model

All systems should connect through shared IDs:

- town_id
- map_package_id
- source_id
- location_id
- person_id
- institution_id
- item_id
- quest_id
- TEKS_id
- student_id
- session_id
- ledger_id

## Event Bus Concept

When something happens, it should create an event.

Examples:

- source approved
- building label corrected
- map package finalized
- train arrived
- item picked up
- evidence submitted
- consequence triggered
- mastery demonstration scored

Each event can update other systems.

## Example Synchronization

A train arrives.

System updates:

- world ledger
- railroad engine
- commerce inventory
- NPC availability
- possible quest hooks
- teacher dashboard alert
- student map marker

A student submits evidence.

System updates:

- mastery evidence table
- TEKS dashboard
- teacher review queue
- world ledger
- quest progress

## Non-Negotiable

Do not let isolated systems invent their own truth.

All systems must synchronize through shared IDs, provenance, and teacher/community approval states.
