# AI Engineering Review — The Mind's Eye

Date: 2026-07-05

## Review Purpose

This review prepares **The Mind's Eye** for AI-agent-assisted development. It is not a general product brainstorm. It is a handoff gate for Codex, ChatGPT agents, and human contributors before implementation accelerates.

## Verified Repository Inventory

The following files were directly inspected or verified through repository history and current file fetches:

```text
The-Minds-Eye/
  README.md
  PROJECT_GOAL.md
  AGENTS.md
  docs/
    ARCHITECTURE.md
    CODEX_READINESS_CHECKLIST.md
    PRODUCT_DESIGN_REPORT.md
    SYSTEM_ARCHITECTURE.md
    chat-context-2026-07-05.md
```

Current verified state:

- `README.md` defines the project as a historically grounded classroom RPG engine and names the Texarkana 1885 Quest Engine as the first build.
- `PROJECT_GOAL.md` defines the non-negotiable separation of verified facts, source-based inferences, and fictional gameplay additions.
- `docs/SYSTEM_ARCHITECTURE.md` provides an earlier pipeline: teacher request → source retrieval → fact extraction → map/location indexing → mission generation → teacher/student outputs.
- `docs/PRODUCT_DESIGN_REPORT.md` strengthens the school-safe identity: simulation, investigation, evidence, mastery, and teacher authority rather than a direct D&D clone.
- `docs/ARCHITECTURE.md` is now the authoritative architecture contract.
- `AGENTS.md` gives AI-agent operating rules.
- `docs/CODEX_READINESS_CHECKLIST.md` identifies what remains before autonomous acceleration.

No source code, tests, schemas, CI, or real town-package data were found in the verified inventory at the time of this review.

## Main Finding

The project is conceptually strong but was previously **foundational, not fully AI-ready**.

The core vision is coherent:

> Build the Texarkana 1885 prototype as the first town package in a repeatable historical simulation engine.

The main risk is not the idea. The main risk is allowing AI agents to start writing features before the repository has enough contracts to constrain them.

## Duplicates and Tensions Found

### 1. RPG vs Simulation Language

- `README.md` and `PROJECT_GOAL.md` use RPG / D&D-like language.
- `PRODUCT_DESIGN_REPORT.md` warns against becoming a direct D&D clone and recommends school-safe simulation language.

Resolution:

Use **historical classroom simulation** as the product category. Tabletop/RPG mechanics may inspire the interaction model, but public-facing language should favor simulation, investigation, mission, inquiry, evidence, reconstruction, and classroom role-play.

### 2. One-Town MVP vs Multi-Town Architecture

Some review language could be interpreted as delaying repeatable town architecture until later.

Resolution:

Do not delay it. The repository should define a repeatable town-package contract now while building only Texarkana 1885 first.

Approved rule:

> Design for many towns. Build only Texarkana 1885 first.

### 3. Multiple Architecture Documents

The repo contains more than one architecture-oriented document.

Resolution:

`docs/ARCHITECTURE.md` is the authoritative architecture file. Earlier files may remain as historical/supporting documents but should not override it.

### 4. Historical Claims Need Machine Enforcement

The project documents repeatedly require fact/inference/fiction separation, but the repository did not yet have schemas or tests to enforce that rule.

Resolution:

Add JSON schemas and validation tests before any gameplay or generation logic.

## Missing AI-Readiness Components

The repository needs these components before autonomous acceleration:

1. One authoritative architecture file.
2. One authoritative roadmap.
3. Machine-checkable schemas.
4. Acceptance tests tied to each module.
5. Prompt contracts.
6. Coding conventions.
7. CI that rejects unsafe or incomplete changes.
8. Contributor/IP boundary.
9. Privacy/student-data posture.
10. Source-rights posture for historical materials.

## Files Added by This Readiness Pass

This readiness pass adds:

```text
The-Minds-Eye/
  docs/
    ROADMAP.md
    PROMPT_CONTRACTS.md
    CONTRIBUTOR_IP_BOUNDARY.md
    AI_ENGINEERING_REVIEW.md
  data/
    schemas/
      town-package.schema.json
      source.schema.json
      claim.schema.json
      mission-seed.schema.json
    towns/
      texarkana/
        metadata.json
        sources.json
        locations.json
        claims.json
        mission_seed.json
  scripts/
    validate_mindseye.py
  .github/
    workflows/
      mindseye-ci.yml
```

## Readiness Decision

After these additions, the project should be considered ready for **agent-assisted specification-first implementation**.

It should still not be considered ready for unsupervised feature expansion.

Approved next Codex work:

1. Validate and refine schemas.
2. Add tests around town package loading.
3. Add tests around provenance labels.
4. Build minimal town-agnostic loaders.
5. Build one mission-generation path from sample data.

Rejected next Codex work:

- full multiplayer;
- production student login;
- district deployment;
- broad automated source scraping;
- unrestricted AI generation;
- or second-town buildout before the Texarkana pattern works.

## Final Handoff Rule

Every AI agent should be forced through this question before coding:

> Does this change help prove the Texarkana 1885 town package as the first slice of a repeatable historical simulation engine while preserving provenance, teacher authority, and fact/inference/fiction boundaries?

If the answer is no, the agent should stop or ask for human review.
