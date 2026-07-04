# Roadmap v0.2

## Strategic Shift

The Mind's Eye is now a historical world engine, not just a lesson generator.

## Build Order

### 1. Provenance First

Build the citation/provenance model before advanced generation.

Deliverables:

- source schema
- provenance schema
- source integrity table generator
- creative licensing labels

### 2. Sanborn Map Builder

Build the map package system.

Deliverables:

- sheet ingestion
- sheet metadata
- index sheet detection
- proposed stitching
- location extraction
- community review workflow
- finalized map package

### 3. TEKS Picker

Build selectable 7-12 Texas core TEKS.

Deliverables:

- TEKS data import
- subject/course selector
- student expectation selector
- searchable standards picker

### 4. Source Packet Builder

Build source retrieval from the Portal to Texas History and other archives.

Deliverables:

- API client
- metadata parser
- OCR handler
- source packet builder
- citation generator

### 5. World Engine MVP

Build a simple world state and ledger.

Deliverables:

- session world state
- ledger entries
- location visits
- item ownership
- simple reputation
- teacher override

### 6. Railroad and Commerce MVP

Add living-town mechanics.

Deliverables:

- train event table
- train arrival generator
- business inventory table
- item table
- commerce quest hooks

### 7. Teacher Dashboard MVP

Deliverables:

- lesson request form
- TEKS picker
- source approval screen
- map approval view
- launch session
- mastery tracker

### 8. Student Dashboard MVP

Deliverables:

- role card
- mission view
- map/location view
- evidence notebook
- item inventory
- dice/check panel
- vocabulary support

### 9. Community Dashboard MVP

Deliverables:

- town package review
- map element review
- source/fact review
- sensitive flagging
- approval workflow
- audit log

### 10. AI Generation Layer

Only after the above structure exists, add richer AI generation.

Deliverables:

- lesson generation
- NPC dialogue
- scene generation
- avatar generation
- quest branching
- teacher approval tools

## First Coding Sprint

Create schemas and a command-line prototype that can:

1. ingest a source record
2. label provenance
3. create a location
4. create an item
5. create a simple quest
6. output a source integrity table

## Product Warning

Do not let the beautiful idea outrun the data model.

The data model is what makes the magic trustworthy.
