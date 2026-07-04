# System Architecture

## Purpose

The Mind's Eye should become a repeatable historical quest engine.

It should not depend on one ChatGPT conversation. The repository is the source of truth. Codex can build against this folder, make changes, run tests, and preserve the system over time.

## Core Pipeline

```text
Teacher Request
  ↓
Place + Year + Subject + Standard
  ↓
Source Retrieval
  ↓
Fact Extraction
  ↓
Map/Location Indexing
  ↓
Mission Generation
  ↓
Teacher Source Notes
  ↓
Student Play Materials
```

## Data Sources

### Primary

- Portal to Texas History API
- Sanborn Fire Insurance maps
- OCR newspaper text
- historical photographs
- city directories
- census records

### Future

- Library of Congress
- Chronicling America
- local archives
- county records
- school district archives

## Main Components

### 1. Source Retriever

Pulls records from historical APIs and archives.

Responsibilities:

- Search by place, year, source type, and keyword
- Save metadata
- Save source URLs
- Pull OCR text when available
- Track source reliability

### 2. Fact Extractor

Turns source material into structured facts.

Example:

```json
{
  "date": "1885-07-11",
  "place": "Texarkana",
  "claim": "A bridge over Nix Creek to College Hill was nearing completion.",
  "source_url": "...",
  "source_type": "newspaper reference",
  "confidence": "medium"
}
```

### 3. Map Indexer

Turns Sanborn maps into playable game locations.

Each building/location should have a stable ID:

```json
{
  "location_id": "TXK-1885-B042",
  "map_year": 1885,
  "street": "Fifth Street",
  "label": "Livery Stable",
  "building_material": "wood",
  "stories": 1,
  "source_map": "1885 Sanborn Texarkana"
}
```

### 4. Mission Generator

Creates a playable classroom mission from verified facts and map locations.

The generator must separate:

- verified facts
- source-based inferences
- invented gameplay fiction

### 5. Teacher Notes Generator

Creates educator-facing notes:

- source citations
- standards alignment
- discussion questions
- historical explanation
- extension activities

### 6. Student Materials Generator

Creates student-facing materials:

- newspaper hook
- map handout
- mission objective
- character roles
- clues
- reflection questions

## First Prototype Boundary

Do not build the whole platform first.

Build one clean proof of concept:

**Texarkana, 1885, one real source event, one map-linked mission.**
