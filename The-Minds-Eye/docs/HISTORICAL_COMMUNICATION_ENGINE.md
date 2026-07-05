# Historical Communication Engine

## Purpose

The Historical Communication Engine manages in-world messages such as telegrams, letters, public notices, newspaper submissions, court statements, and pony express / courier-style deliveries where historically appropriate.

Communication should be a gameplay mechanic, a literacy tool, a safety-monitored interaction space, and a source of authentic writing evidence.

## Core Principle

Messages should move the world, but every student-created message must have an accountable teacher owner.

Students should send and receive communications that affect missions, town events, reputation, commerce, justice, and mastery evidence. However, no student-generated message should bypass teacher monitoring.

## Communication Types

- telegram
- letter
- public notice
- newspaper submission
- court statement
- sheriff notice
- railroad message
- church/community bulletin note
- business invoice/request
- courier delivery
- pony express-style delivery where historically appropriate
- international or out-of-town telegram

## Important Historical Accuracy Note

The system should not assume the Pony Express existed in every town or time period.

If the exact service is not historically supported, the system may use:

- courier
- rider
- mail carrier
- express messenger
- railroad mail
- telegraph office

Any unsupported or generalized use must be labeled as simulation_element or creative_license.

## Teacher Ownership Requirement

Every student-created communication must be assigned to a responsible teacher before it can be sent, delivered, published, or used to affect the world.

A student message must include:

- sending student or team
- assigned teacher owner
- originating class/session
- intended recipient
- communication type
- visibility level
- review requirement
- moderation status

If a student is in a shared multi-teacher town, the student must choose or be assigned the teacher responsible for that message.

The assigned teacher owns review, approval, rejection, escalation, and any instructional follow-up.

## Message Safety and Appropriateness

The system should monitor messages for:

- harassment
- threats
- sexual content
- profanity
- bullying
- discriminatory language
- attempts to misuse law/court mechanics
- false accusations against real or fictional people
- attempts to derail class activity
- unsafe personal information
- off-task or inappropriate content

Student messages that trigger safety concerns should enter a teacher review queue before delivery.

## Global Telegram Capability

Students may attempt to send a telegram to anyone in the world when the teacher enables global messaging.

Examples:

- another town
- a railroad office
- a state official
- a newspaper in another city
- a historical figure if the date and setting support it
- a business supplier
- a court or government office
- a family member or fictional contact

The system should intelligently determine:

- whether the recipient is historically plausible
- whether the destination is reachable
- what delivery method fits the era
- how much it costs
- how long it may take
- whether a response is likely
- whether teacher approval is required before sending or receiving

## AI Response Rules

AI may generate responses to telegrams and letters, but responses must be constrained by:

- historical date
- location
- known source facts
- recipient identity
- provenance classification
- teacher settings
- safety rules
- academic purpose

AI-generated responses must be labeled as simulation_element or creative_license unless directly based on a cited source.

If a student sends a telegram to a real historical person or institution, the response must not pretend to be a verified historical document. It should be framed as a simulation response unless the response text is source-supported.

## Telegram Cost Mechanics

The system may charge for telegram service using configurable rules.

Cost factors may include:

- word count
- distance
- urgency
- delivery method
- special routing
- international/out-of-region destination
- historical rate table if available
- simulation rate table if exact rates are unknown

If exact rates are not source-supported, the cost must be labeled as simulation_element.

Cost can create academic tasks:

- concise writing
- word choice
- budgeting
- multiplication
- rate comparison
- decision-making under constraints

## Telegram Mechanics

Telegrams can require students to:

- summarize clearly
- write concisely
- choose precise words
- calculate cost by word count if enabled
- decide what information matters
- interpret a received message
- compare message with other sources
- decide whether a response is trustworthy

## Courier / Pony Express-Style Mechanics

Courier delivery can involve:

- travel time
- route choice
- weather delay
- horse availability
- cost
- risk of message loss
- urgency
- proof of delivery

## Writing and Assessment Connection

Messages may count as artifacts.

Examples:

- concise telegram for ELAR summary skills
- sheriff statement for evidence writing
- railroad incident report for informational writing
- public notice for audience/purpose
- letter to editor for argument writing
- lab results delivered to town council for science explanation

## Message Record

Each message should include:

- message_id
- session_id
- sender_id
- teacher_owner_id
- recipient_id
- recipient_display_name
- recipient_type
- destination_place
- communication_type
- origin_location_id
- destination_location_id
- text
- cost
- cost_basis
- delivery_method
- delivery_status
- source/provenance status
- moderation_status
- teacher_review_required
- related mission_id
- related artifact_id
- created_at
- sent_at
- delivered_at
- response_generated_at

## Delivery Statuses

- draft
- awaiting_teacher_review
- blocked_by_moderation
- rejected_by_teacher
- sent
- in_transit
- delayed
- delivered
- response_pending
- response_received
- lost
- archived

## Teacher Controls

Teachers can:

- require approval before messages are sent
- require approval before AI responses are delivered
- disable global telegrams
- restrict recipients
- require a rubric
- enable/disable word-cost mechanics
- delay delivery for realism
- make messages public or private
- attach a message to mastery evidence
- use messages to trigger new missions
- receive alerts for inappropriate or risky messages
- review message history by student, team, class, or session

## Law and Court Safeguards

Messages involving law, warrants, sheriff activity, court statements, accusations, arrests, jail, or judges should receive elevated monitoring.

Teacher review should be required when students:

- accuse a person or group
- request a warrant
- send evidence to court
- contact a sheriff or judge
- attempt to manipulate legal consequences
- threaten, harass, or intimidate an NPC or student

## Multi-Class Communication

When multiple classes use the same town, teachers may allow controlled communication between sessions.

Examples:

- Period 1 sends a newspaper report that Period 2 reads
- Science class sends water test data to Social Studies class
- ELAR class writes public notices for another class's town event

Teacher approval is required before cross-class messages are delivered.

## Non-Negotiable

Historical communication should create authentic literacy work, not just chat.

Every consequential message must be reviewable, source-aware, teacher-owned, and teacher-controlled.

Global communication is allowed only with moderation, cost logic, provenance labels, and assigned teacher ownership.
