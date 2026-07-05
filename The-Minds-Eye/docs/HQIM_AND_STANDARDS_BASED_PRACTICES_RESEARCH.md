# HQIM and Standards-Based Practices Research Architecture

## Purpose

This document records the instructional-quality research direction that must govern The Mind's Eye as it moves from concept to build. The platform should be viral because it works instructionally, not only because it is engaging.

The product must satisfy two adoption realities at the same time:

1. Districts increasingly evaluate materials through HQIM expectations: alignment, coherence, usability, accessibility, assessment quality, and evidence.
2. Teachers still need practical standards-based gradebook outputs that fit conventional reporting systems.

## Research-Aligned Design Claims

### 1. HQIM is an evidence system, not a marketing label

The platform must be able to prove quality through exportable evidence, not simply claim that lessons are standards-aligned.

Each town unit and lesson package must export an HQIM evidence binder that includes:

- standards alignment map
- instructional sequence
- source packet and provenance report
- cognitive demand evidence
- student-facing materials
- teacher facilitation guide
- accessibility and language supports
- assessment artifacts and rubrics
- mastery evidence model
- data privacy and AI-use statement
- teacher review and override history

### 2. Dynamic AI generation must be constrained by curriculum guardrails

AI may generate scenarios, dialogue, telegram responses, writing prompts, NPC interactions, and lesson variations, but generation must occur inside a bounded instructional frame.

Required guardrails:

- selected TEKS or approved standard set
- approved town database
- approved source/provenance graph
- task purpose and artifact type
- rubric or proficiency scale
- teacher review requirement before major instructional deployment
- historical/creative classification for every claim

### 3. Standards-based grading must be mastery-centered, not point-accumulation-centered

Student progress should be recorded by standard on a 1-4 proficiency scale, with multiple opportunities to demonstrate mastery.

The system should emphasize:

- latest and best evidence
- trend over time
- independence level
- teacher-confirmed evidence
- number of demonstrations
- misconception tracking
- intervention history

The gradebook conversion exists for district reporting, but the core learning record remains standards-based.

### 4. Assessment must be authentic but still measurable

The platform should avoid worksheet-like play. However, every academic performance must generate observable evidence.

Examples:

- newspaper editorial: claim, evidence, organization, grammar, audience awareness
- court statement: accuracy, cited evidence, reasoning, civic vocabulary
- telegram: concise communication, purpose, appropriateness, cost calculation
- science report: procedure, data table, conclusion, explanation from evidence
- town council proposal: argument, tradeoffs, source use, oral defense

### 5. Practice should raise mastery only when evidence improves

Students may practice often, but the score should rise because their evidence improves, not because they spent time in the game.

The Adaptive Mission Engine should assign targeted opportunities when students need more practice, but the Standards-Based Gradebook Engine should update mastery only from validated evidence.

### 6. Accessibility and EB supports must be built into task design

Supports are not afterthoughts. Every lesson package should know how to produce:

- translated directions when teacher-enabled
- vocabulary coaching
- sentence frames
- read-aloud friendly text
- alternate response modes
- chunked writing tasks
- scaffolded source packets
- 504/SPED accommodation flags
- teacher-visible support history

### 7. AI scoring must be advisory unless district policy allows otherwise

AI may provide feedback, scoring recommendations, rubric evidence highlights, and revision suggestions. The teacher must remain the final authority for grades unless a district explicitly approves another workflow.

The system should always preserve:

- AI recommendation
- evidence excerpt
- rubric criterion
- confidence level
- teacher final score
- override reason
- timestamp

## HQIM Quality Gates

Every generated lesson or mission must pass these gates before being used as an HQIM-ready instructional material.

### Gate 1: Standards Fit

- At least one selected standard is directly practiced.
- No more than five standards are assessed in one mission unless a teacher explicitly expands the scope.
- The task requires the student to perform the skill, not merely hear about it.

### Gate 2: Content Validity

- Historical claims come from approved sources or are explicitly labeled.
- The map locations used by the mission exist in the approved town package.
- Creative elements do not contradict known evidence.

### Gate 3: Cognitive Demand

- The mission requires reasoning, evidence use, explanation, analysis, argument, problem solving, or scientific investigation.
- Dice rolls may add uncertainty but may not replace academic reasoning.

### Gate 4: Assessment Validity

- The mission defines what artifact or observable action proves learning.
- The artifact has a rubric or proficiency scale.
- The teacher can review and override the score.

### Gate 5: Accessibility

- EB vocabulary supports are available.
- 504/SPED accommodations can be applied.
- Student directions can be chunked and clarified.
- Alternate response modes can be selected when appropriate.

### Gate 6: Teacher Usability

- The teacher can understand setup, time, materials, expected evidence, and scoring.
- The teacher can pause, intervene, moderate, or approve major events.

## Standards-Based Practice Model

Each standard should store the following:

```json
{
  "standard_id": "TEKS.ELA.7.x",
  "student_id": "internal_student_ref",
  "current_mastery": 3,
  "best_mastery": 4,
  "recent_trend": "improving",
  "demonstration_count": 4,
  "independence_level": "minimal_support",
  "last_validated_evidence_id": "artifact_123",
  "teacher_confirmed": true,
  "common_misconceptions": ["uses evidence but does not explain relevance"],
  "next_recommended_practice": "court_statement_with_evidence_scaffold"
}
```

## Grade Conversion Principle

The platform should convert 1-4 standards evidence to a 60-100 mission grade only after standards scoring is complete.

Default conversion rule:

```text
mission_mastery_average = average(validated 1-4 scores for mission TEKS)
mission_grade = convert mastery average into 60-100 scale
incomplete = no meaningful student evidence submitted
```

Suggested conversion can be configurable by district, but default behavior should protect developing learners from mathematically devastating early failures while still requiring evidence to earn credit.

## Build Implications

The product must add these systems early:

1. Standards registry
2. Proficiency-scale model
3. Assessment artifact system
4. Rubric system
5. Gradebook conversion engine
6. Teacher scoring and override workflow
7. HQIM evidence binder exporter
8. Adaptive intervention mission routing
9. Accessibility and language support generator
10. Audit trail for AI scoring and teacher decisions

## Non-Negotiable Product Rule

The Mind's Eye can be playful, immersive, and beautiful, but instructional quality must be inspectable.

If a district asks, "How do we know students learned?" the platform must answer with standards, evidence, rubrics, teacher validation, growth history, and exportable reports.
