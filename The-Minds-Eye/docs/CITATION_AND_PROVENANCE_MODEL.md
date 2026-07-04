# Citation and Provenance Model

## Purpose

The Mind's Eye must make historical truth visible.

Almost every object in the system should show whether it comes from a source, an inference, a simulation rule, or creative licensing.

## Required Provenance Labels

- verified_source
- source_based_inference
- simulation_element
- creative_license
- student_generated
- teacher_approved
- community_approved
- uncertain
- rejected

## Applies To

Provenance metadata should apply to:

- historical facts
- people
- buildings
- map labels
- map stitching decisions
- streets
- businesses
- train arrivals
- commerce prices
- inventory items
- church/community concerns
- court/sheriff scenarios
- NPC dialogue
- mission hooks
- student-created branches
- generated images
- assessments

## Provenance Fields

Each object should include:

```json
{
  "provenance_status": "verified_source",
  "source_ids": ["SRC-001"],
  "citation_text": "...",
  "source_url": "...",
  "confidence": "high",
  "review_status": "community_approved",
  "teacher_visible_note": "Directly supported by source.",
  "student_visible_note": "This detail comes from a historical source."
}
```

## Creative License Fields

For creative additions:

```json
{
  "provenance_status": "creative_license",
  "source_ids": [],
  "confidence": "not_applicable",
  "reason": "Created for gameplay and classroom engagement.",
  "teacher_visible_note": "This is invented. It should not be taught as historical fact.",
  "student_visible_note": "This part was added for the simulation."
}
```

## Source Integrity Table

Every lesson should include a source integrity table.

| Element | Classification | Source | Student Visible? | Teacher Note |
|---|---|---|---|---|
| Depot location | verified_source | Sanborn map | yes | Map-supported location. |
| Circus train arrival | creative_license | none | yes | Teacher-approved special event. |
| Freight shortage | simulation_element | period commerce inference | yes | Plausible but not source-specific. |

## Review Workflow

1. AI proposes object.
2. System assigns initial provenance.
3. Community reviewer verifies/corrects map and local history details.
4. Teacher approves lesson-specific use.
5. Student sees simplified provenance indicators.

## Student-Friendly Labels

Possible student labels:

- From a real source
- Based on evidence
- Added for the simulation
- Created by your class
- Needs more evidence

## Non-Negotiable

If something is invented, the system must say so.

Accuracy is not optional. Trust is the product.
