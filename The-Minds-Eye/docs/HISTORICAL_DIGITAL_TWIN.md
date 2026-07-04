# Historical Digital Twin

## Purpose

The Mind's Eye should be built as a historical digital twin of a town, not merely a game map or lesson generator.

A historical digital twin is a structured, reviewable, source-aware model of a town at a specific time. The simulation, lessons, quests, visuals, NPCs, travel, commerce, justice, and mastery evidence all run on top of that model.

## Core Principle

The historical town comes first.

The game experience comes second.

The learning evidence is measured throughout.

## Layered Model

### Layer 1: Historical Evidence

Raw and processed historical sources.

Sources may include:

- Sanborn Fire Insurance maps
- Portal to Texas History records
- newspapers and OCR text
- city directories
- census records
- photographs
- railroad records
- court records
- church/community records when available
- school records when available
- local histories
- oral histories

Every evidence object requires:

- evidence ID
- source provider
- source title
- date
- citation
- source URL
- confidence
- review status

### Layer 2: City Database

The structured town model.

Includes:

- streets
- intersections
- blocks
- lots
- buildings
- businesses
- homes
- institutions
- rail lines
- depots
- bridges
- creeks
- civic buildings
- churches
- schools
- public hazards
- fire/water infrastructure

### Layer 3: Community Review

Human reviewers verify what AI extracted or inferred.

Reviewers can:

- approve
- correct
- reject
- flag as uncertain
- add context
- request more evidence
- mark sensitive content

### Layer 4: Visual World Builder

Only after the city database is reviewed should the system generate a polished top-down playable map.

The visual map must follow the approved data. It should not invent building identities or street labels.

### Layer 5: World Simulation

The simulation uses the approved town model to run:

- travel
- rail arrivals
- commerce
- justice/court activity
- school/church/community concerns
- NPC interactions
- student choices
- world ledger events

### Layer 6: Learning Engine

The learning engine watches for evidence of TEKS execution.

It tracks whether students actually use skills, not whether they merely play through a scene.

## Building Record

Every building should eventually support:

- building ID
- map package ID
- sheet ID
- coordinates
- footprint
- street address if known
- street frontage
- building label
- building type
- business/institution/home status
- construction material
- stories
- roof style when known
- outbuildings
- known occupants
- known owners/operators
- active years
- connected quests
- source citations
- AI confidence
- review status

## Unknown Buildings

If the source does not identify a building, the system should not fake certainty.

Unknown buildings may appear visually as empty, generic, or unlabeled structures with a stable ID.

Student-facing label example:

> Building 42: unidentified structure

Teacher-facing note:

> The map confirms a structure here, but no supported label has been approved.

## Key Product Shift

The product must build a reusable town model that other teachers and communities can improve over time.

Texarkana should become the prototype for a repeatable town onboarding process.
