# Implementation Roadmap

## MVP Goal

Build one strong prototype before expanding.

**MVP:** Teacher selects a TEKS, chooses Texarkana and a historical window, approves a source-grounded moment, launches a classroom simulation, and sees mastery evidence accumulate by student and standard.

## Phase 1: Source of Truth and Schemas

### Goals

- Define lesson schema
- Define source fact schema
- Define location schema
- Define TEKS schema
- Define mastery evidence schema
- Define moderation schema

### Deliverables

- JSON schemas in `/data/schemas`
- architecture docs
- prompt docs
- first seed data for Texarkana

## Phase 2: TEKS Picker

### Goals

Make TEKS selectable for grades 7-12 core subjects.

### Subjects

- ELAR
- Math
- Science
- Social Studies

### Deliverables

- TEKS ingestion script
- searchable TEKS database
- course/grade selector
- student expectation selector
- TEKS metadata API

## Phase 3: Historical Source Retrieval

### Goals

Connect to historical sources and retrieve source packets.

### Initial Sources

- Portal to Texas History API
- Sanborn map metadata
- OCR newspaper text when available
- historical photographs

### Deliverables

- Portal API client
- search and metadata parser
- OCR retrieval helper
- source packet builder
- citation/provenance tracker

## Phase 4: Map and Location Engine

### Goals

Turn Sanborn maps into playable town spaces.

### Deliverables

- map sheet metadata model
- location ID model
- numbered building index
- street/location lookup
- source-linked map notes

## Phase 5: Lesson and Simulation Generator

### Goals

Generate teacher-approved simulation lessons.

### Deliverables

- source summary
- verified facts table
- inference table
- fictional gameplay table
- teacher script
- student briefing
- role cards
- dice-check moments
- vocabulary supports
- mastery prompts

## Phase 6: Teacher Dashboard

### Goals

Let teachers build, approve, launch, and monitor lessons.

### Deliverables

- lesson request flow
- TEKS picker UI
- source approval UI
- class/session setup
- accommodations settings
- live session controls
- mastery dashboard

## Phase 7: Student Dashboard

### Goals

Let students participate simply and clearly.

### Deliverables

- role view
- mission view
- map/location view
- evidence notebook
- vocabulary coach
- translation support
- dice panel
- reflection prompt

## Phase 8: Community Dashboard

### Goals

Allow local review and contextualization without rewriting history.

### Deliverables

- source review queue
- town profile
- people/place directory
- sensitive content flags
- context notes
- approval states
- audit log

## Phase 9: AI Images and Avatars

### Goals

Generate historically appropriate visuals safely.

### Deliverables

- teacher-approved historical scene generation
- optional student-safe avatars
- moderation checks
- district-level avatar settings
- no-real-photo default

## Phase 10: Classroom Scaling

### Goals

Support 20-30 students without chaos.

### Deliverables

- team-based orchestration
- checkpoint progression
- teacher pacing controls
- group submissions
- individual mastery checks
- real-time status dashboard

## First Codex Task

Build the initial schemas and a tiny command-line prototype:

```text
Input:
- town: Texarkana
- year: 1895
- subject: social studies
- TEKS: placeholder

Output:
- source packet
- historical facts table
- generated simulation brief
- source integrity table
```

## Product Rule

Do not build a beautiful dashboard before the source-integrity pipeline works.
