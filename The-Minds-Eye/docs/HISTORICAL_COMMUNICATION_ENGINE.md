# Historical Communication Engine

## Purpose

The Historical Communication Engine manages in-world messages such as telegrams, letters, public notices, newspaper submissions, and pony express / courier-style deliveries where historically appropriate.

Communication should be a gameplay mechanic, a literacy tool, and a source of authentic writing evidence.

## Core Principle

Messages should move the world.

Students should send and receive communications that affect missions, town events, reputation, commerce, justice, and mastery evidence.

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

## Telegram Mechanics

Telegrams can require students to:

- summarize clearly
- write concisely
- choose precise words
- calculate cost by word count if enabled
- decide what information matters
- interpret a received message
- compare message with other sources

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
- recipient_id
- communication_type
- origin_location_id
- destination_location_id
- text
- cost
- delivery_method
- delivery_status
- source/provenance status
- related mission_id
- related artifact_id
- teacher_review_required
- created_at
- delivered_at

## Delivery Statuses

- draft
- awaiting_teacher_review
- sent
- in_transit
- delayed
- delivered
- lost
- rejected
- archived

## Teacher Controls

Teachers can:

- approve messages before sending
- require a rubric
- enable/disable word-cost mechanics
- delay delivery for realism
- make messages public or private
- attach a message to mastery evidence
- use messages to trigger new missions

## Multi-Class Communication

When multiple classes use the same town, teachers may allow controlled communication between sessions.

Examples:

- Period 1 sends a newspaper report that Period 2 reads
- Science class sends water test data to Social Studies class
- ELAR class writes public notices for another class's town event

Teacher approval is required before cross-class messages are delivered.

## Non-Negotiable

Historical communication should create authentic literacy work, not just chat.

Every consequential message must be reviewable, source-aware, and teacher-controlled.
