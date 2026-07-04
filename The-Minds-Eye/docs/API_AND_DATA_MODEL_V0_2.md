# API and Data Model v0.2

## Purpose

This document defines the major data objects the Version 0.2 architecture needs.

## Core Objects

### Town

- town_id
- name
- state
- county
- years_supported
- source_collections
- map_packages
- community_review_status

### MapPackage

- map_package_id
- town_id
- year
- source_sheet_ids
- index_sheet_id
- stitched_layout
- location_ids
- review_status
- finalized_at

### Location

- location_id
- map_package_id
- sheet_id
- label
- street
- building_type
- material
- stories
- coordinates
- source_ids
- provenance_status
- review_status

### Source

- source_id
- provider
- title
- date
- url
- type
- ocr_text
- citation_text
- confidence

### Person

- person_id
- name
- role
- institution_id
- source_ids
- provenance_status
- sensitivity_flags
- review_status

### Institution

- institution_id
- name
- type
- location_id
- active_years
- source_ids
- community_notes
- review_status

### TrainEvent

- train_event_id
- date_time
- town_id
- railroad_company
- train_type
- cars
- cargo
- passengers
- quest_hooks
- source_ids
- provenance_status
- review_status

### BusinessInventory

- inventory_id
- location_id
- business_type
- items
- price_table
- source_ids
- provenance_status
- review_status

### Item

- item_id
- name
- category
- description
- owner_type
- owner_id
- location_id
- allowed_uses
- source_ids
- provenance_status
- review_status

### Quest

- quest_id
- town_id
- title
- source_basis
- locations
- institutions
- npc_ids
- items
- TEKS
- dice_moments
- consequence_branches
- provenance_status
- teacher_approval_status

### WorldLedgerEntry

- ledger_id
- session_id
- timestamp
- actor_type
- actor_id
- action
- location_id
- result
- dice_result
- evidence_created
- consequence_triggered
- teacher_override

### MasteryEvidence

- evidence_id
- student_id
- session_id
- TEKS
- prompt
- response
- AI_recommendation
- teacher_score
- status
- artifact_url

## API Groups

### Source API

- search sources
- retrieve OCR
- create source packet
- classify source confidence

### Map API

- create map package
- list sheets
- propose stitching
- propose locations
- review location
- finalize map package

### World API

- create session world
- get world state
- add ledger entry
- trigger branch
- resolve consequence

### Railroad API

- list train events
- create simulated train event
- approve train event
- attach train event to quest

### Commerce API

- list business inventory
- create/update price table
- approve commerce data
- generate commerce quest

### Inventory API

- create item
- assign item to team/student/location
- use item
- mark item as evidence

### Teacher API

- select TEKS
- request lesson
- approve lesson
- launch session
- pause session
- score mastery evidence

### Student API

- get role
- get mission state
- submit evidence
- request action
- use item
- roll dice

### Community API

- review source
- review map element
- review institution
- flag sensitive content
- approve town package

## Non-Negotiable

No API should return student-facing historical content without provenance metadata.
