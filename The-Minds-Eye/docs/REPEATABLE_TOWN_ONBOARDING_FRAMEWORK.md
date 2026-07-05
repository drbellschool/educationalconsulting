# Repeatable Town Onboarding Framework

## Purpose

The Mind's Eye must be able to add new towns without changing core code.

Texarkana, Wichita Falls, Waco, San Antonio, and future towns should all use the same onboarding pipeline, data model, review workflow, and simulation engines.

## Core Principle

A town is configuration plus approved data, not custom code.

Each new town should be created through:

1. town configuration
2. source discovery
3. time-window selection
4. map ingestion
5. content coverage scoring
6. AI extraction
7. human review
8. approved town package publication
9. scenario generation from the approved town universe

## Town Universe Window

A town should not be limited to one Sanborn map year.

Each town package should support a historical window, usually around 10 years.

Example:

```text
Town: Waco
Core map year: 1905
Universe window: 1900-1910
```

The Sanborn map gives the built environment anchor. The broader window provides newspapers, directories, photographs, court records, church/community notices, census context, railroad records, and other content that can make the world richer.

## Core Map Year vs Universe Window

### Core Map Year

The map year anchors:

- streets
- buildings
- rail lines
- depots
- bridges
- building labels
- businesses visible on the map
- institutions visible on the map

### Universe Window

The broader window supplies:

- news events
- advertisements
- people
- prices
- public concerns
- weather events
- court notices
- church/community activity
- school activity
- railroad activity
- photographs
- directories
- civic issues

## Time-Window Rules

The system should support:

- exact year mode
- plus/minus 5-year mode
- custom date window
- source-specific windows
- teacher-visible date warnings

Example warning:

> This quest uses a 1905 Sanborn map and a 1908 newspaper article. The system treats this as a 1900-1910 town universe, not a single-day reconstruction.

## Content Coverage Score

Each town package should show how much usable historical content has been found.

Coverage categories:

- Sanborn map sheets
- index sheet availability
- newspaper OCR
- city directories
- photographs
- census records
- railroad sources
- church/community sources
- court/legal sources
- school sources
- local histories
- oral histories
- business advertisements

## Coverage Levels

Suggested levels:

- sparse
- limited
- usable
- strong
- rich

A town with only maps may still be usable for geography and map-based lessons.

A town with maps plus newspapers and directories can support richer missions, NPCs, commerce, writing tasks, and civic scenarios.

## Coverage Dashboard

The town onboarding dashboard should show:

- source category
- number of records found
- date range covered
- OCR quality
- review status
- confidence
- instructional usefulness
- gaps
- recommended next source search

Example:

| Source Type | Coverage | Notes |
|---|---|---|
| Sanborn maps | strong | 8 sheets + index sheet found |
| Newspapers | sparse | No 1885 issues found; try 1894+ |
| City directories | limited | One directory found within window |
| Photographs | usable | Depot and street scenes found |

## Scenario Readiness Score

The system should estimate what kinds of learning scenarios a town can support.

Examples:

- Map navigation readiness
- Railroad readiness
- Commerce readiness
- Civic/court readiness
- Newspaper/writing readiness
- Science/environment readiness
- Church/community readiness
- NPC/person readiness
- Multi-day campaign readiness

## Town Package Statuses

- requested
- source_discovery_started
- source_discovery_complete
- map_ingested
- extraction_in_progress
- review_needed
- review_in_progress
- approved_limited
- approved_standard
- approved_rich
- published
- retired

## No-Code Town Expansion

Adding a town should require no code changes.

The system should support a town configuration file or database record with:

- town_id
- town name
- state
- county/counties
- target years
- core map year
- universe window
- source providers
- reviewer group
- school/district availability
- default grade bands
- sensitive-content settings

## Town Configuration Example

```json
{
  "town_id": "waco_tx_1905",
  "display_name": "Waco, Texas",
  "core_map_year": 1905,
  "universe_window": {
    "start_year": 1900,
    "end_year": 1910
  },
  "state": "Texas",
  "source_providers": ["Portal to Texas History", "Library of Congress"],
  "review_status": "requested"
}
```

## Repeatable Pipeline

The same pipeline should work for every town:

```text
Create town config
  ↓
Discover sources
  ↓
Calculate content coverage
  ↓
Select strongest map/year window
  ↓
Ingest Sanborn sheets
  ↓
Extract city database
  ↓
Review and approve
  ↓
Publish town package
  ↓
Generate TEKS-aligned scenarios
```

## Non-Negotiable

The platform must not require new application logic for each new town.

New towns should become possible through data, source coverage, review, and configuration.
