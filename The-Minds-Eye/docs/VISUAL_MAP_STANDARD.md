# Visual Map Standard

## Purpose

The playable city map should feel like a richly detailed top-down tabletop town map while remaining historically grounded.

The visual target is a zoomable, top-down, building-by-building town map where students can naturally say:

> I go down Fifth Street past the livery.

or

> I enter Building 42 and ask the owner what happened.

## Visual Requirements

The map should include:

- clearly labeled streets
- visible building footprints
- roof shapes where known
- interiors where approved or intentionally generalized
- building numbers or labels
- map district/sheet boundaries where useful
- railroads, depots, bridges, creeks, and major infrastructure
- zoomable details
- selectable buildings
- student-safe visual clarity

## Zoom Levels

### Level 1: Town View

Shows:

- entire town
- major roads
- railroads
- creeks/rivers
- districts
- major institutions
- map sheet grid

### Level 2: Neighborhood/Sheet View

Shows:

- streets
- blocks
- lots
- building labels
- businesses
- churches
- schools
- depots
- civic buildings

### Level 3: Building View

Shows:

- roof shape
- porches
- outbuildings
- fences
- hitching posts
- wells
- loading docks
- signage where approved

### Level 4: Interior View

Shows interior only when supported, reviewed, or clearly labeled as simulation.

Possible interior types:

- hotel lobby
- livery stable
- newspaper office
- courtroom
- sheriff office
- church hall
- schoolroom
- general store
- depot waiting room

## Approval First Rule

The system must not generate the final top-down visual map until the underlying map data has been reviewed.

Workflow:

1. retrieve Sanborn sheets
2. identify sheets and index sheet
3. extract buildings, streets, labels, and features
4. create draft city database
5. send to community review
6. correct/approve labels and stitching
7. finalize data package
8. generate top-down visual map from approved data

## Labeling Requirements

Every visible building should have one of these labels:

- approved historical label
- approved functional label
- stable building ID with unknown status

Examples:

- Livery Stable
- Post Office
- Building 17: Unidentified
- Residence 24
- Blacksmith Shop

## Unknown Areas

If the source does not identify a detail, keep the map honest.

Do not create false certainty.

Use:

- generic roof
- empty interior
- unidentified building label
- uncertain marker
- teacher-visible note

## Street Requirements

Streets must be clear enough for student navigation.

Each street should include:

- street name
- direction/continuation
- intersections
- adjacent building IDs
- connection to sheet boundaries

## Generated Visual Style

The visual style should be:

- top-down
- richly detailed
- warm historical color palette
- readable at classroom screen size
- zoomable for individual student devices
- visually engaging without sacrificing accuracy

## Non-Negotiable

The map must be a visualization of approved data, not a hallucinated illustration.

If the data is uncertain, the visual must show uncertainty.
