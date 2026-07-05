# Standards-Based Gradebook Engine

## Purpose

The Standards-Based Gradebook Engine converts authentic gameplay evidence into teacher-usable standards-based grades without reducing the product to worksheets or point chasing.

The platform should record learning by standard first, then translate that evidence into the numeric grade formats teachers need for district gradebooks.

## Core Rule

The platform does not primarily grade missions. It grades evidence against standards.

A mission may cover 1-5 TEKS or other selected standards. The mission grade is calculated from the student's validated standard scores for that mission.

## Mastery Scale

Default scale:

| Score | Label | Meaning |
|---:|---|---|
| 1 | Beginning | Student attempted the skill but needs substantial support. |
| 2 | Developing | Student shows partial understanding with errors or support. |
| 3 | Proficient | Student demonstrates the standard accurately and independently enough for grade-level expectation. |
| 4 | Advanced | Student demonstrates the standard with depth, transfer, precision, or leadership. |

Teachers and districts may rename labels, but the internal model should remain 1-4.

## Mission Grade Conversion

Default conversion:

| Average 1-4 Mastery | Numeric Mission Grade |
|---:|---:|
| 4.00 | 100 |
| 3.75 | 98 |
| 3.50 | 95 |
| 3.25 | 92 |
| 3.00 | 90 |
| 2.75 | 87 |
| 2.50 | 84 |
| 2.25 | 80 |
| 2.00 | 75 |
| 1.75 | 70 |
| 1.50 | 65 |
| 1.25 | 60 |
| meaningful attempt below 1.25 | 60 |
| no meaningful evidence | Incomplete |

This conversion should be district-configurable.

## Time Duration and Assignment Window

Every teacher-created mission gradebook entry must include:

- mission title
- class section
- teacher owner
- start date/time
- due date/time
- estimated classroom duration
- optional extended campaign duration
- assessed standards
- artifact requirements
- grading policy
- late/incomplete policy

## Evidence Model

Each score must trace to evidence.

Evidence types:

- written artifact
- oral response transcript
- teacher observation
- map-based action log
- lab report
- telegram/message task
- court statement
- newspaper article
- debate participation
- group product with individual role evidence
- AI interaction excerpt approved by teacher

Each evidence item stores:

- student
- standard(s)
- artifact type
- rubric criterion
- AI suggested score
- teacher final score
- support level
- timestamp
- source context
- privacy status

## Growth Model

A student's standard record should show:

- current mastery
- best validated mastery
- recent trend
- number of attempts
- number of successful demonstrations
- support level required
- last evidence date
- recommended next mission

Early struggles should not permanently cap a student. Later strong evidence should update the current mastery trend.

## Support-Level Tracking

Mastery is stronger when less support is needed.

Support levels:

1. full teacher support
2. AI scaffold plus teacher prompt
3. AI scaffold only
4. peer collaboration
5. independent
6. independent with transfer

The teacher dashboard should show whether a 3 or 4 was achieved independently or with support.

## Character Progression Connection

Game ability increases should come from demonstrated academic mastery.

Examples:

- ELAR mastery strengthens persuasion, investigation, interview, editorial, and legal statement abilities.
- Math mastery strengthens surveying, commerce, accounting, freight, construction, and navigation abilities.
- Science mastery strengthens laboratory analysis, environmental investigation, agriculture, health, and engineering abilities.
- Social Studies mastery strengthens civic influence, historical interpretation, community trust, and leadership roles.

Students should not level up simply for time spent in the platform.

## Progression Titles

The system may award historically themed credentials tied to standards mastery:

- Apprentice Surveyor
- Assistant Editor
- Court Reporter
- Deputy Clerk
- Railroad Inspector
- Telegraph Operator
- Town Naturalist
- Merchant Accountant
- Agricultural Specialist
- Civic Investigator

Each title must map to standards and validated evidence.

## Teacher Controls

Teachers must be able to:

- select standards
- set mission duration
- choose graded or ungraded mode
- upload or build rubrics
- review AI scoring suggestions
- override scores
- mark incomplete
- request more evidence
- exclude practice attempts from grade calculation
- export grades
- view audit trail

## Group Missions

For group missions, the gradebook must distinguish:

- shared product score
- individual contribution evidence
- individual standard mastery
- group completion status

A student should not automatically receive mastery because the group succeeded. The system must capture individual evidence whenever possible.

## Intervention Loop

When a student's standard trend remains at 1 or 2, the Adaptive Mission Engine should request small in-world tasks that practice the same standard in a meaningful way.

The intervention must feel like contribution:

- town editor asks for source verification
- judge asks for a clearer statement
- depot manager asks for a recalculation
- doctor asks for another data reading
- gardener asks for a better comparison

The gradebook records these as additional opportunities, not punishment.

## Data Export Targets

Future integrations should support:

- CSV export
- LMS gradebook export
- standards mastery report
- parent progress report
- HQIM evidence binder
- teacher conference report

## Non-Negotiable

Grades must remain explainable.

Every score must answer:

1. Which standard was assessed?
2. What did the student do?
3. What evidence supports the score?
4. What rubric or scale was used?
5. Did AI recommend the score or did the teacher finalize it?
6. What should the student do next?
