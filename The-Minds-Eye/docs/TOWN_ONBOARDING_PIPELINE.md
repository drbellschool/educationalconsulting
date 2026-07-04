# Town Onboarding Pipeline

## Purpose

The Mind's Eye must be repeatable for other towns.

Texarkana is the prototype, not the only destination.

Every town should move through a structured onboarding pipeline before teachers and students use it.

## Pipeline Overview

```text
Town Request
  ↓
Source Discovery
  ↓
Sanborn Sheet Retrieval
  ↓
Map Feature Extraction
  ↓
City Database Draft
  ↓
Community Review
  ↓
Map Package Approval
  ↓
Visual Map Generation
  ↓
Instructional Scenario Generation
  ↓
Teacher Approval
  ↓
Student Simulation
```

## Step 1: Town Request

A district, teacher, museum, historical society, or community partner requests a town.

Required:

- town name
- state
- county
- target years
- desired grade levels
- available local reviewers

## Step 2: Source Discovery

The system searches for available sources.

Initial sources:

- Portal to Texas History
- Sanborn maps
- newspapers
- photographs
- city directories
- historical maps
- census records
- local histories

## Step 3: Sanborn Sheet Retrieval

The system retrieves every available Sanborn sheet for the selected year/date range.

It must identify:

- index sheet
- detail sheets
- sheet numbers
- publication year
- revision year
- source URL
- sheet relationship

## Step 4: Map Feature Extraction

AI proposes:

- streets
- intersections
- blocks
- lots
- building footprints
- building labels
- construction materials
- stories
- business/institution types
- railroads
- depots
- water/fire infrastructure
- hazards

## Step 5: City Database Draft

The system creates a draft city model.

Every feature receives:

- stable ID
- source citation
- AI confidence
- review status
- provenance status

## Step 6: Community Review

Reviewers inspect the AI proposals.

They approve, correct, reject, or mark uncertain:

- sheet stitching
- street names
- building labels
- building types
- institution names
- sensitive content
- local notes

## Step 7: Automated Consistency Checks

Before final approval, the system checks for:

- missing street labels
- duplicate building IDs
- disconnected street graph
- impossible sheet alignment
- unlabeled approved buildings
- unreviewed high-impact locations
- missing citations
- unsupported claims labeled as fact

## Step 8: Map Package Approval

A town/year map package becomes student-eligible only after approval.

Approval means:

- stitched sheet layout is accepted
- buildings have stable IDs
- streets are readable
- known labels are reviewed
- unknown buildings are marked honestly
- provenance is attached

## Step 9: Visual Map Generation

The system generates the top-down playable map from approved data.

The visual map must preserve:

- street labels
- building IDs
- approved functional labels
- railroads
- civic/institutional landmarks
- unknown structures as unknown

## Step 10: Instructional Scenario Generation

Only after the town package exists should the system generate lessons and quests.

The lesson generator uses:

- approved map data
- source packet
- TEKS selection
- teacher settings
- mastery requirements

## Step 11: Continuous Improvement

Towns improve over time.

New sources can trigger:

- updated building labels
- new institutions
- new events
- corrected map features
- additional quest hooks
- revised confidence scores

## Non-Negotiable

No new town should go straight from AI extraction to student use.

Every town needs source discovery, map construction, review, approval, and provenance.
