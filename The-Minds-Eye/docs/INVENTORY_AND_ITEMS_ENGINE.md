# Inventory and Items Engine

## Purpose

The Inventory and Items Engine gives students meaningful tools, documents, evidence, supplies, and objects to use during the simulation.

Items should support investigation, travel, commerce, communication, civic action, and mastery evidence.

## Item Categories

- evidence items
- documents
- letters
- maps
- tickets
- receipts
- tools
- keys
- permits
- money
- trade goods
- food/supplies
- medical supplies
- school supplies
- church/community supplies
- railroad freight items
- personal items
- quest-specific objects

## Item Record

Each item should include:

- item ID
- name
- description
- category
- source status
- source citation if available
- historical use
- current owner
- location found
- condition
- quantity
- value/cost where appropriate
- allowed uses
- TEKS connections
- review status

## Provenance

Every item must show whether it is:

- verified_source
- source_based_inference
- simulation_element
- creative_license
- student_generated

## Examples

### Evidence Item

```json
{
  "item_id": "TXK-1885-EVID-001",
  "name": "torn freight receipt",
  "category": "document",
  "source_status": "simulation_element",
  "historical_use": "Receipts and freight paperwork were common in railroad commerce.",
  "allowed_uses": ["compare handwriting", "trace shipment", "present in court"],
  "teacher_visible_note": "Created for gameplay; not a verified artifact."
}
```

### Verified Item

```json
{
  "item_id": "TXK-1885-MAP-001",
  "name": "1885 Sanborn map sheet",
  "category": "map",
  "source_status": "verified_source",
  "source_citation": "Portal to Texas History Sanborn map record",
  "allowed_uses": ["navigate", "identify buildings", "compare streets"]
}
```

## Student Inventory

Inventory can be tracked at:

- individual student level
- team level
- class level
- teacher-controlled evidence locker

## Inventory Uses

Items can:

- unlock dialogue
- prove claims
- support arguments
- repair damage
- enable travel
- satisfy civic or church/community needs
- resolve court hearings
- trigger new quests
- connect to standards

## Teacher Controls

Teachers can:

- add/remove items
- transfer items between teams
- approve item use
- mark an item as evidence
- require written explanation before item use
- disable complex inventory for younger or shorter lessons

## Non-Negotiable

Items must not become random rewards. They should connect to evidence, historical plausibility, student agency, or standards mastery.
