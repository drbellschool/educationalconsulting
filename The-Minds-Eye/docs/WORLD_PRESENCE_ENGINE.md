# World Presence Engine

## Purpose

The World Presence Engine answers:

> What does the town look like right now, and where is everyone?

It manages student locations, teacher visibility, class sessions, NPCs, animals, vehicles, ambient activity, and controlled randomness.

## Core Principle

The town should feel alive without becoming chaotic.

Students should be able to traverse the town, and classmates should be able to see where others are when the teacher allows it.

## Student Presence

Every student or team can have a live presence marker.

Presence data may include:

- student_id
- display name or class-safe alias
- class_id
- session_id
- team_id
- current location_id
- current mission_id
- status
- last active time
- visibility setting

Example statuses:

- traveling
- investigating
- writing
- interviewing
- collecting evidence
- waiting for team
- needs teacher
- submitted artifact
- in event

## Class Visibility

Students may see:

- their own location
- teammate locations
- classmate locations if teacher enables it
- mission-relevant NPCs
- public events
- known town locations

Teachers can see:

- every student
- every team
- all active missions
- idle students
- crowded locations
- students needing help
- triggered events
- pending consequences

## Multi-Class and Multi-Teacher Support

The same town can support multiple simultaneous classes.

Each class session has its own session_id and world state unless intentionally linked.

Use cases:

- one teacher running one class
- multiple periods using the same town package
- multiple teachers using the same town for different subjects
- interdisciplinary shared campaign
- district-wide town event

## Session Isolation Modes

### Private Class Session

One teacher and class have their own version of the town state.

### Shared Teacher Team Session

Multiple teachers coordinate one shared town event across subjects.

Example:

- ELAR writes editorials
- Science reports water test data
- Social Studies holds a town council meeting
- Math calculates supply routes

### Persistent Campaign Session

A class or grade level carries world state over time.

### Public Town Package

The approved town data is shared, but student actions do not change the public source data.

## Living Town Population

The presence engine can populate the town with historically appropriate entities.

Examples:

- shopkeepers
- railroad workers
- sheriff and deputies
- judge and clerks
- church members
- teachers/students
- farmers
- travelers
- newspaper staff
- delivery drivers
- horses
- dogs
- chickens
- livestock
- wagons
- trains
- boats where appropriate

## Controlled Randomness

The system should not spawn everything at once.

Ambient activity should be based on:

- time of day
- location type
- weather
- season
- active missions
- railroad schedule
- class size
- teacher settings
- historical plausibility

## Presence Events

Examples:

- student.arrived_at_location
- student.left_location
- student.joined_team
- team.entered_building
- npc.entered_location
- train.arrived
- horse.loose
- dog.wandering
- wagon.blocked_street
- crowd.gathered
- teacher.paused_session

## Fog of Discovery

Students should not automatically know everything.

Student view should be limited by:

- location
- team communication
- public notices
- newspapers
- messages received
- teacher settings

Teacher view should provide full awareness.

## Teacher Controls

Teachers can:

- enable or disable live student map visibility
- show only teams instead of individual students
- pause travel
- move a student/team if needed
- summon all students to a location
- hide sensitive NPCs or events
- control random event frequency
- reset or replay a session state

## Non-Negotiable

Live presence exists to support collaboration, classroom management, and immersion. It should not become surveillance theater or public embarrassment.
