# Platform Architecture Decision

## Decision

Build The Mind's Eye as a web-first, provenance-first, standards-first platform.

Recommended stack direction:

- Frontend: Next.js or equivalent React framework
- API: FastAPI or equivalent Python service for extraction/scoring workflows
- Database: PostgreSQL with PostGIS for geospatial town data
- Search: OpenSearch or equivalent for source/OCR/entity search
- Workflow orchestration: Temporal or equivalent durable workflow system
- Maps: MapLibre or equivalent vector-tile renderer
- Observability: OpenTelemetry-style traces, metrics, logs

## Why Not Start with a Game Engine

The Mind's Eye is not primarily a game engine project.

It is:

- source ingestion
- community review
- map construction
- standards alignment
- assessment artifact capture
- mastery evidence tracking
- teacher workflow
- student interaction

A conventional game engine can come later for richer visuals, but the first successful product needs a trusted web platform and data model.

## Architecture Pattern

Use modular services organized around bounded contexts:

1. Identity and Tenant Service
2. Source and Provenance Service
3. TEKS and HQIM Service
4. Assessment Artifact Service
5. Town Onboarding Service
6. Map Builder Service
7. Community Review Service
8. Historical Digital Twin Service
9. Simulation/Event Service
10. Teacher/Student Session Service
11. Experience Connector Service
12. Analytics and Observability Service

## Event-Driven Synchronization

Use events for important changes.

Examples:

- source.imported
- source.extracted
- map.feature.proposed
- review.task.created
- review.decision.approved
- town.package.published
- artifact.submitted
- score.finalized
- mastery.claim.updated
- world.event.recorded
- quest.branch.triggered

Why:

Events allow systems to stay synchronized without each feature inventing its own truth.

## Workflow Orchestration

Use durable workflows for long-running processes:

- source ingestion
- OCR processing
- Sanborn extraction
- community review routing
- map package approval
- visual render jobs
- AI feedback/scoring draft
- town publish pipeline

Why:

These jobs can fail, pause for human review, resume, and require audit trails.

## Data Storage Strategy

### PostgreSQL/PostGIS

Use for:

- towns
- streets
- buildings
- parcels
- map packages
- institutions
- sessions
- artifacts
- rubrics
- mastery claims
- world ledger

### Object Storage

Use for:

- source images
- Sanborn sheets
- generated map renders
- student file uploads
- exported evidence binders

### Search Index

Use for:

- OCR text
- newspaper text
- source metadata
- town entity search
- artifact search where allowed

## Security and Privacy

The platform must support:

- role-based access control
- district/school/class tenancy boundaries
- audit logs
- minimum necessary student data
- teacher-controlled AI feedback
- no public community access to student work
- export/delete workflows where required

## Accessibility

Accessibility must be designed early.

Map-heavy interfaces need:

- keyboard navigation
- alternative text views
- high contrast mode
- simplified map mode
- screen-reader-friendly location lists
- caption/read-aloud support
- reduced cognitive load views

## Non-Negotiable

Technical architecture must reinforce the product philosophy:

Source truth first. Instructional evidence second. Simulation third. Visual polish last.
