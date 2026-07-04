# Sanborn Map Builder

## Core Principle

The Sanborn map builder is a major part of The Mind's Eye, not a minor supporting feature.

The map is the playable world. The quality of the map inventory determines the quality of the simulation.

## Goal

When a new town is added, the system should help build a reviewed, approved, stitched, labeled, playable city map from Sanborn Fire Insurance map sheets.

The final product should support:

- historically accurate navigation
- labeled buildings
- numbered playable locations
- street-based movement
- sheet-to-sheet travel
- TEKS-aligned scenario generation
- community review and approval

## Sanborn Sheet Workflow

A town may have multiple sheets plus an index sheet showing how the sheets fit together.

Example:

```text
Town: Exampleville
Year: 1895
Sheets: 8 detail sheets + 1 index sheet
```

The system should:

1. retrieve all available sheets
2. identify the index sheet
3. identify each detail sheet
4. OCR/read sheet labels where possible
5. detect streets, blocks, buildings, symbols, colors, and notes
6. propose sheet stitching
7. propose building/location IDs
8. create an inventory of map features
9. send all extracted data to community review
10. finalize only after approval

## Map Inventory

The system should build a structured inventory of what the map offers.

### Inventory Categories

- streets
- intersections
- building footprints
- building labels
- building numbers
- business types
- residences
- churches
- schools
- civic buildings
- industrial sites
- railroad features
- depots
- stables/liveries
- hotels/boarding houses
- saloons
- newspapers/printers
- doctors/druggists
- blacksmiths
- water/fire infrastructure
- hazards
- creeks/bridges
- vacant lots
- map notes

## Location IDs

Every playable location should receive a stable ID.

Example:

```text
TXK-1885-S03-B042
```

Meaning:

- TXK = town code
- 1885 = map year
- S03 = sheet 3
- B042 = building/location 42

## Map Review States

Each map element should have a review status.

- AI extracted
- needs review
- approved
- approved with correction
- rejected
- uncertain
- needs human transcription
- finalized

## Community Dashboard Role

The community dashboard should be the main review interface for map construction.

Community reviewers should be able to:

- view each Sanborn sheet
- inspect AI-extracted labels
- correct building labels
- confirm street names
- confirm sheet stitching
- approve building IDs
- tag businesses and civic locations
- flag uncertain OCR
- attach historical notes
- approve finalized map inventory

## Stitching Requirements

The system should not finalize a stitched map automatically.

AI may propose stitching, but humans approve it.

The reviewer should see:

- index sheet
- proposed sheet placement
- overlapping streets
- street continuation lines
- alignment confidence
- possible errors
- approval controls

## Finalization Rule

A map is not ready for student use until:

1. sheets are matched
2. streets are reviewed
3. building labels are reviewed
4. location IDs are generated
5. uncertain elements are marked
6. community/district reviewer approves the map package

## Map Package Output

A finalized map package should include:

- source sheet metadata
- stitched sheet layout
- street graph
- location inventory
- building/location IDs
- labels
- confidence scores
- reviewer notes
- approved scenario tags
- known uncertain areas

## Scenario Generation Connection

The lesson generator should use the map inventory to create historically grounded scenarios.

Example:

If the map contains:

- livery
- blacksmith
- depot
- newspaper office
- bridge

Then the system can build scenarios around:

- transportation
- commerce
- communication
- civic infrastructure
- cause and effect
- local economy

## Non-Negotiable

Do not allow unreviewed AI map extraction to become final classroom content.

AI proposes. Community verifies. Teacher approves. Students explore.
