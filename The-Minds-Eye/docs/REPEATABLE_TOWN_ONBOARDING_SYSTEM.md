# Repeatable Town Onboarding System

## Purpose

The Mind's Eye must be able to expand from Texarkana to Wichita Falls, Waco, San Antonio, and future towns without changing core application code.

A new town should be added through configuration, source ingestion, AI-assisted extraction, human review, approval, and publication.

## Core Principle

New towns are data packages, not code changes.

The platform should treat each town as a versioned, reviewable, source-grounded package that can be onboarded using the same pipeline.

## Town Package Model

Each town package should include:

- town_id
- town name
- county/state
- supported years
- source bundle
- Sanborn sheet bundle
- approved map package
- historical digital twin
- institution inventory
- rail/travel inventory
- commerce inventory
- civic/legal inventory
- community notes
- provenance report
- HQIM/TEKS opportunity index
- publication status

## Town Onboarding Flow

```text
Town Request
  ↓
Town Configuration
  ↓
Source Discovery
  ↓
Sanborn Sheet Import
  ↓
AI Extraction
  ↓
Draft City Database
  ↓
Community Review
  ↓
Consistency Checks
  ↓
Approved Town Package
  ↓
Visual Map Rendering
  ↓
TEKS Opportunity Index
  ↓
Teacher-Ready Town
```

## Town Configuration

A new town should start with configuration, not custom code.

Configuration fields:

- town_id
- display_name
- state
- county
- target_years
- source_search_terms
- known_archive_sources
- Sanborn source URLs or search instructions
- local reviewer contacts
- school/district ownership
- default visibility settings
- sensitive content rules
- supported subjects
- initial TEKS focus

## Source Discovery

The system should search and attach sources from:

- Portal to Texas History
- Library of Congress Sanborn collection
- local historical societies
- newspapers
- city directories
- photographs
- census records
- railroad records
- court/civic records
- school/church/community sources when available

Every source must include provenance metadata.

## No-Code Expansion Rule

Adding a new town should not require editing source code.

Allowed expansion methods:

- admin dashboard town creation
- JSON/YAML town manifest
- source bundle upload
- archive connector search
- reviewer assignment
- map package approval
- publishing workflow

Not allowed:

- hard-coding town names
- hard-coding map paths
- hard-coding source URLs in logic
- one-off database tables per town
- one-off lesson generators per town

## Town Manifest Example

```yaml
town_id: wichita-falls-tx
name: Wichita Falls
state: Texas
county: Wichita
target_years:
  - 1890
  - 1896
  - 1901
source_connectors:
  - portal_to_texas_history
  - library_of_congress_sanborn
  - city_directories
review:
  local_review_required: true
  district_review_required: true
subjects:
  - social_studies
  - elar
  - science
  - math
status: draft
```

## TEKS Opportunity Index

Once a town package is approved, the system should create a TEKS opportunity index.

This index answers:

> What can this town teach well?

Examples:

- railroad depot → economics, geography, industrialization, math routes/costs
- creek/bridge → science water testing, engineering, civic infrastructure
- courthouse → civic process, argument writing, evidence
- newspaper office → ELAR writing, claims, audience, source evaluation
- livery/blacksmith → commerce, supply chains, measurement, technology
- church/school → community life, public notices, civic responsibility

The opportunity index should be generated from approved town data, not generic prompts.

## Versioning

Town packages must be versioned.

Examples:

- waco-tx-1886-v0.1-draft
- waco-tx-1886-v1.0-approved
- san-antonio-tx-1892-v0.3-review

Versioning protects classrooms from changing content mid-session.

## Multi-Town Architecture

The application should support:

- multiple towns
- multiple years per town
- multiple map packages per town
- multiple school districts using the same public town package
- district-specific overlays
- teacher-specific sessions
- class-specific world states

## District and Community Overlays

The approved base town package should stay stable.

Districts may add overlays:

- local curriculum notes
- sensitivity settings
- approved lesson templates
- local reviewer annotations
- district-specific restrictions
- preferred TEKS bundles

Overlays should not rewrite the core source record.

## Quality Gates

A town cannot be published until:

1. sources have citations
2. Sanborn sheets are imported or marked unavailable
3. streets/buildings have stable IDs
4. unknown buildings are marked honestly
5. reviewed features are approved
6. sensitive content is flagged
7. map package passes consistency checks
8. provenance report is generated
9. TEKS opportunity index exists
10. district/community approval requirements are satisfied

## Reusable Codex Tasks

Codex should build reusable town tools, not town-specific scripts.

Build:

- town manifest parser
- source connector interface
- Sanborn importer interface
- map extraction job interface
- review task generator
- town package publisher
- TEKS opportunity index generator
- town package validator

## Non-Negotiable

The platform should scale by adding reviewed data, not by rewriting code.

If Wichita Falls, Waco, or San Antonio require code changes, the architecture has failed.
