# Threefold — SMS relationship adventure pilot

**Status: foundation implementation on a development branch; NOT deployed or live.**

Threefold is the opt-in messaging companion for The Marriage Project. The existing public website at [lonestarteacher.com/threefold/](https://www.lonestarteacher.com/threefold/) remains hosted on GitHub Pages. The new path [threefold/admin/](../admin/) is a public **launcher**, not a database or authentication boundary.

## Architecture

\`\`\`text
GitHub Pages (/threefold, /threefold/admin)
  Public information + local link to privately shared admin Sheet
                   |
                   | (administration via Google sign-in)
                   v
PRIVATE Google Sheet + bound Google Apps Script
  Participants / Couples / LinkCodes / Events / Messages
  Outbox / Reminders / Whispers / Audit
  * Google Sheets sidebar dashboard
  * Time-driven one-minute processing trigger
  * Server-side OpenAI Responses API
  * Server-side Telnyx Messages API
                   ^
                   | HMAC signed payload
            Cloudflare Worker
                   ^
                   | Ed25519 signed webhook
                 Telnyx
                   ^
                   | SMS
         Two independently opted-in adults
\`\`\`

**Why the Worker?** Telnyx sends signature and timestamp in HTTP headers. Apps Script web-app doPost event objects do not supply arbitrary HTTP headers. Direct Telnyx -> Apps Script without an edge proxy cannot authenticate Telnyx correctly. The Worker verifies Telnyx Ed25519 signatures using the public key, checks freshness, then signs a forwarded packet with a shared HMAC secret. Apps Script verifies the HMAC and timestamp before storing the event.

No Telnyx or OpenAI keys belong in the GitHub repository, in GitHub Pages HTML, or in Google Sheet cells.

## Implemented pilot functions

- SMS JOIN -> explicit adult/consent YES -> opted-in enrollment; STOP overrides other flows and suppresses queued texts; HELP works when not enrolled.
- Individual (per-number) conversation histories; only a person's own previous AI dialogue is sent as OpenAI context. OpenAI calls request \`store:false\`.
- LINK code -> another independently opted-in user requests linking -> code creator must APPROVE. Neither spouse gets access to the other's private texts.
- WHISPER -> private response -> SHARE previews one response -> CONFIRM SHARE sends **only that answer** to the linked, opted-in partner.
- DATE sends one curated low-cost shared novelty suggestion.
- \`REMIND YYYY-MM-DD HH:MM | Message\` sets a one-time personal reminder in America/Chicago time. This pilot does not support per-user time zones yet.
- Incoming message events are deduplicated by provider event ID; outbox entries marked REVIEW before sending to avoid automatic duplicate retransmission on uncertain outcomes.
- Google Sheet admin sidebar shows aggregate counts, integration configuration presence, waiting/review queues and non-content audit entries.

**Not yet implemented:** 8-milestone Deep Dives; petal visualization and milestones; date-night delegation/babysitters/budgets; birthdays and anniversaries; couple onboarding web forms; scheduling personalized proactive Whisper campaigns; administrator tooling for opt-out reconciliation, privacy exports/deletion, and retry investigations. These are planned follow-on modules, not live claims.

## Set up the private spreadsheet and Apps Script

1. Create a **new private Google Sheet** with a name such as \`Threefold Pilot Data\`. Do not publish it to the web or give access to pilot participants.
2. Open **Extensions > Apps Script** inside that Sheet (a *bound* script).
3. Replace the default \`Code.gs\` with \`backend/Code.gs\`. Add a new HTML file named \`Admin\` with the contents of \`backend/Admin.html\`. Set the script manifest to \`backend/appsscript.json\` (in Project Settings, show manifest file).
4. In Apps Script **Project Settings > Script properties** set:

   | Property | Value |
   | --- | --- |
   | \`WEBHOOK_SHARED_SECRET\` | Cryptographically random 32+ byte secret; **same value as Worker secret** |
   | \`TELNYX_API_KEY\` | Your Telnyx API v2 secret |
   | \`TELNYX_FROM_NUMBER\` | \`+19036090465\` |
   | \`OPENAI_API_KEY\` | Your OpenAI API secret |
   | \`OPENAI_MODEL\` | \`gpt-4.1-mini\` by default (change to a model enabled for your API project) |

   You can omit Telnyx/OpenAI keys initially. Without the Telnyx key, no outgoing messages are sent. Without the OpenAI key, conversational messages receive a limited pilot response instead.
5. Select function \`setupThreefold\`, click **Run**, approve authorization. It creates exactly the nine schema tabs, saves \`SHEET_ID\` in script properties, and installs one trigger to run \`runThreefoldQueue\` every minute.
6. Reload the Google Sheet. Select **Threefold > Open private dashboard** to see the real internal dashboard. The spreadsheet's own Google access controls protect it; the public landing page does not.

### Webhook deployment

1. In Apps Script choose **Deploy > New deployment > Web app**. Use **Execute as me** (the Sheet owner), **Who has access: Anyone**. This publicly callable URL is for signed webhook packet ingestion **only**. Do not use it as an admin endpoint. Copy the \`/exec\` URL.
2. Install [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) locally, authenticate with Cloudflare, and create a Worker using \`edge/worker.js\`. For example, from the repository root use \`npx wrangler deploy threefold/edge/worker.js --name threefold-ingress\` (create/select your Cloudflare Workers account as needed).
3. Add **Worker encrypted secrets** using Wrangler, all to the \`threefold-ingress\` Worker:
   - \`TELNYX_PUBLIC_KEY\` — 64-character hex Ed25519 webhook public key from Telnyx Mission Control > Keys & Credentials.
   - \`WEBHOOK_SHARED_SECRET\` — **exact same** secret as Script properties.
   - \`APPS_SCRIPT_URL\` — the full published Google \`/exec\` URL.
4. Re-deploy if needed, and configure Telnyx's inbound messaging webhook URL to \`https://<worker-hostname>/telnyx\` for the correct messaging profile. \`GET /health\` verifies the Worker can respond, but does not prove credentials or the backend are set up.
5. Validate with an authorized test number and actual Telnyx signed delivery. The Worker returns HTTP 200 **only after the Google backend acknowledges queueing or deduplication**; otherwise it returns a retryable HTTP 503. Telnyx may retry failed webhook deliveries. Verify that exactly one event row is created. Also send a forged unsigned request and verify HTTP 401 with no event row.
6. Confirm API billing, number registration/campaign approval, messaging profile assignment, test consent and STOP behavior before allowing external participants. There is no need to connect the incoming webhook while the 10DLC campaign is pending.

**Generating a strong shared secret:** if Node is installed, run \`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"\` locally. Copy it only into private script/Worker secret stores; never into GitHub or the chat.

### Public admin entry page

Once the branch is merged/deployed, visit \`https://www.lonestarteacher.com/threefold/admin/\`. Paste the link to your *private* Sheet once, then click **Open private Google Sheet**. The launcher stores the URL in that browser's local storage and nothing else; it cannot browse or publish the spreadsheet. Authenticate normally with Google, then select **Threefold > Open private dashboard**.

## Sheets schema

| Tab | Purpose |
| --- | --- |
| \`Participants\` | Individual phone, consent, adult attestation, pair ID, private state |
| \`Couples\` | Pair membership after both members have opted in and approved linking |
| \`LinkCodes\` | Expiring, approval-based couple invitations |
| \`Events\` | Signed provider events and queue status; source payload for troubleshooting |
| \`Messages\` | Per-person inbound/outbound records, visibility marking |
| \`Outbox\` | SMS queue, delivery attempts and uncertain sends requiring review |
| \`Reminders\` | Participant-created future notices |
| \`Whispers\` | Private answers and separate explicit share status |
| \`Audit\` | Consent, pairing, sharing and exception metadata |

## Important safety and operating limits

- Consent is **per number, not per couple**. Linking never opts a partner in. Both adults participate voluntarily.
- A **Google Sheet owner can access raw data** and provider consoles may process/store message content. "Private" means private **from the other spouse**, not encrypted from Threefold's operator or providers. Avoid making stronger promises.
- SMS is not end-to-end encrypted. Do not use this service for emergency, safety-critical, medical, or confidential therapy conversations. For indications of abuse or coercive control, do not encourage unsafe partner disclosure.
- Google Sheet tabs may contain content and phone numbers. Restrict sharing; never publish the Sheet, expose its contents through a public endpoint, or log full texts in edge logs.
- Telnyx can manage carrier-level opt-out independently of your database. Before scaling beyond controlled testing, implement provider suppression reconciliation and a human review workflow. Never override a carrier-level STOP.
- Outbound statuses marked \`REVIEW\` are intentionally **not auto-retried**: check the Telnyx message history and carrier state before considering a resend. Events marked \`REVIEW\` also need manual investigation.
- Default reminder parsing only supports Central time; do not promise other time zones or exact-to-the-second delivery. One-minute Apps Script triggers and service quotas create delivery variance.
- This pilot has no full retention/deletion/export workflow or throttling/cost controls yet. Document and test those before launching to the public or inviting a broad cohort.
- DO NOT test with an unsuspecting partner or send unsolicited invitations. 10DLC approval, test consent, carrier rules, and independent age assertions must be reviewed before production.
- Secret presence in admin is not a connection test. The project has not been deployed, run against a real Sheet, or given real API credentials automatically.

## Smoke test checklist

- [ ] Run \`setupThreefold\` and confirm all nine tabs and a single trigger
- [ ] Verify public site contains zero secret values
- [ ] Worker health returns 200; unsigned POST returns 401
- [ ] Signed JOIN webhook produces \`PENDING_ADULT\`, adult YES -> \`OPTED_IN\`
- [ ] STOP suppresses pending outbound for the number; non-opted-in phone receives no proactive messaging
- [ ] Redeliver a webhook event ID and confirm there is only one Events row
- [ ] Two independently opted-in phones link through LINK, request, APPROVE
- [ ] Private Whisper remains private and partner sees nothing until CONFIRM SHARE
- [ ] OpenAI receives **only this user's** conversation context
- [ ] Create a reminder, confirm queueing only for opted-in recipient
- [ ] Test Telnyx failure: outbox goes to REVIEW, not blind auto-retry
- [ ] Test dashboard via an authorized Google account, and access denial for nonowners

## Documentation referenced

- [Google Apps Script web apps and request events](https://developers.google.com/apps-script/guides/web)
- [Apps Script trigger and quotas](https://developers.google.com/apps-script/guides/triggers/installable)
- [Telnyx webhook signing](https://support.telnyx.com/en/articles/4334722-how-to-leverage-webhooks)
- [Cloudflare Web Crypto Ed25519 support](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
- [OpenAI Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create)
