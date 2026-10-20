# Threefold — Stage 1 Couple Experience

A complete *interactive design prototype* for the first four product pillars, independent of the currently inaccessible Supabase project.

## Four things you can try now

1. **Love Whispers:** Browse thoughtful prompts, save private answers, preview a deliberate share, and confirm it. The demo NEVER sends a text or notifies a partner.
2. **Date Adventures:** Choose a mood, budget and childcare needs; receive one of three curated date concepts, delegate the preparation checklist in person, and mark an adventure complete. It NEVER reserves or purchases anything. Includes "The First Braid" craft date.
3. **Deep Dives:** Play "Christmas Tug-of-War," eight visible chapters with six plausible options at the major decision moments (chapters 2, 4 and independent mastery test in chapter 7); realistic consequences, coaching and one bounded repair practice at earlier mistakes.
4. **Your Threefold:** Petals open through Whispers and dates; a braided cord grows with each story milestone. This is a *visual* model, not a relationship grade.

The demo uses browser \`localStorage\` under \`threefold_stage1_demo_v1\`. Only fake or nonsensitive demonstration text should be entered. Use **Reset demo** to erase its state on the device. Nothing syncs between devices or accounts and there is no live authentication.

## Run locally

Open \`threefold/app/index.html\` in a modern browser, or serve a local static server, for example:

\`\`\`bash
cd threefold/app
python3 -m http.server 8080
# visit http://localhost:8080
\`\`\`

Run checks from the repository root:

\`\`\`bash
node --test threefold/app/tests/smoke.test.mjs
\`\`\`

## Vercel preview deployment (when connected)

Connect \`drbellschool/educationalconsulting\` to Vercel and configure **Root Directory** to \`threefold/app\`. Use framework **Other** (static). Leave the build and output directory blank or follow Vercel's no-build static deployment defaults. Each pull request can produce a separate Vercel preview URL once Git/Vercel deployment integration is connected.

This site doesn't require Supabase yet. When the brand domain is selected, the app can later be attached to \`app.<domain>\`, with the existing landing page remaining at the original \`lonestarteacher.com/threefold/\` during transition.

## Live launch work still required

This prototype is NOT a sellable deployed customer experience.

- Authenticate each partner and obtain independent adult/SMS consent, then link two accounts securely.
- Add Supabase SQL migrations for date-planning assignments, consented partner-share events, Deep Dive *per-user* decisions and mastery and threefold progress. The existing core SQL PR includes base participants, couples, whispers, adventures and progress schemas but not full API wiring.
- Replace local demo state with secure authorized server APIs and real persistent records. Do not let the browser choose other users' IDs or set arbitrary completion states.
- Build the actual AI date-night planning and follow-up messages around opt-in and explicit delegation; no real bookings without authorization.
- Add a story engine with bounded repair, user-specific history, progress synchronization and safeguards for distress/abuse.
- Add real SMS delivery monitoring, Telnyx webhook testing, provider STOP reconciliation, OpenAI spending limits, data retention/deletion, payments and onboarding before first paying couple.
- Design and complete a provider-appropriate privacy/security review.

**Important:** This demo purposely has no real Supabase credentials, OpenAI key, Telnyx key or API requests. Do not add secrets to static JS, Vercel build outputs or source control.


## Secure admin console and provider APIs

The Stage 1 preview now has a **private admin studio** at the **Vercel** website's \`/admin/\` route (for example, \`https://threefold-preview.vercel.app/admin/\`). This is NOT the same as the static GitHub Pages copy; only Vercel hosts the \`/api/admin\` server function.

**Admin controls:** Password-protected short-lived, HMAC-signed HttpOnly cookie, SameSite=Strict, Secure; same-origin request enforcement, JSON-only POSTs, no-cache responses, strict admin-page Content Security Policy. The password is never stored in browser local storage. This is a **single-administrator pilot gate**, not a multiuser customer authentication solution. Use Vercel Deployment Protection and WAF/rate limiting as additional protections. Replace the temporary password login with real Supabase Auth + MFA when database access is restored.

### Set these Vercel Environment Variables

Go to **Vercel > threefold-preview > Settings > Environment Variables**. Store values there; do **not** paste API keys or admin passwords into GitHub files, chat, or the public browser.

| Variable | Purpose | Required to enable |
| --- | --- | --- |
| \`THREEFOLD_ADMIN_PASSWORD\` | Your own strong, unique passphrase (at least 16 characters). Stored as an encrypted/sensitive Vercel environment variable; do not reuse another service's password. | Admin login |
| \`THREEFOLD_SESSION_SECRET\` | Independently generated random secret of 32+ characters. Treat as sensitive, keep server-side. | Admin login |
| \`OPENAI_API_KEY\` | OpenAI API Platform secret. The ChatGPT subscription does not pay the API bill. | AI connection checks and rehearsal |
| \`OPENAI_MODEL\` | Model ID, default \`gpt-4.1-mini\`. | Optional |
| \`TELNYX_API_KEY\` | Telnyx API v2 Bearer key. | Telnyx read-only messaging profile check |
| \`TELNYX_FROM_NUMBER\` | Sender in E.164 format (pilot \`+19036090465\`). | Optional status indicator |

Scope these variables to the right Vercel environments (Production; Preview too if testing preview URLs). **Redeploy after changing secrets**: already-built deployments do not automatically acquire new variables. Vercel will not reveal secret values to the browser; the dashboard only indicates whether each key is present. Limit admin access to trusted administrators.

### Admin features

- **OpenAI Verify**: A small, authenticated test call to the Responses API (\`store:false\`, limited output). This may incur API usage costs.
- **OpenAI Voice Rehearsal**: An explicit sample prompt to the Responses API, with server-controlled instructions and output bounds. Use fictional examples, never real couple details while the database is not ready.
- **Telnyx Verify**: Authenticated, read-only request to \`GET /v2/messaging_profiles\`; shows the accessible profile names and IDs but sends no SMS. A successful test does not prove the 10DLC campaign is approved or that the number has deliverability.
- **Launch control**: Honest blocked/ready indicators for services. There are **no customer messages, payment charges, or persistent participant records** from the admin console.

### Endpoint contract

| Path | Method | Access | Behavior |
| --- | --- | --- | --- |
| \`/api/admin\` | GET | Anonymous gets login status only; admin gets configuration flags | No secrets returned |
| \`/api/admin\` | POST \`login\` | Valid configured passphrase + same origin | Issues HttpOnly, signed, 2-hour admin session |
| \`/api/admin\` | POST \`logout\` | Authenticated | Expires browser cookie |
| \`/api/admin\` | POST \`status\` | Authenticated | Provider connection flags, not real-customer statistics |
| \`/api/admin\` | POST \`check-openai\` | Authenticated | One minimal Responses API call |
| \`/api/admin\` | POST \`try-openai\` | Authenticated | One fictional 3–500 character prompt |
| \`/api/admin\` | POST \`check-telnyx\` | Authenticated | Read-only Telnyx messaging profile GET |

All POSTs require JSON, the matching request Origin and \`X-Threefold-Admin: 1\`. Provider keys are retrieved in the Vercel function only. The endpoint does not include any SMS send action, public chat API or webhook activation.

This is **not yet** the live Telnyx SMS backend from the separate, unmerged Supabase draft. Never repoint Telnyx production webhooks to this admin function.


## One-number Telnyx SMS test (not customer sending)

The authenticated Threefold Studio now includes **Send one test text**. This is a temporary, deliberately restricted connectivity check before the full SQL-backed SMS system is live. There is no general-purpose "send to anyone" endpoint: the server constructs a fixed welcome message and sends it only to one predetermined, allowlisted phone number.

**Telnyx prerequisite:** U.S. local 10DLC application messaging must be attached to an approved campaign with the sending number assigned. The Vercel \`THREEFOLD_10DLC_APPROVED\` flag is **your own explicit attestation**, not a carrier API verification. Never enable it until the campaign status is approved and number assignment has been confirmed inside Telnyx.

### Configure the locked test

Open Vercel > \`threefold-preview\` > Settings > Environment Variables and set:

| Name | Value | Target |
| --- | --- | --- |
| \`THREEFOLD_TEST_SMS_TO\` | **Your own mobile number** in E.164, e.g. \`+1XXXXXXXXXX\`. Not the sending number. Mark **Secret/Sensitive**. | Production |
| \`THREEFOLD_10DLC_APPROVED\` | Exactly \`true\` **only after independently verifying** approved campaign + number assignment. Otherwise leave unset/false. | Production |
| \`THREEFOLD_TEST_SMS_ENABLED\` | Exactly \`true\` to open the temporary restricted send gate; leave unset/false until you are ready to test. | Production |

\`TELNYX_FROM_NUMBER\` (\`+19036090465\`) and \`TELNYX_API_KEY\` were already configured. Add all three of the new settings privately; **do not paste personal phone numbers or keys into GitHub or chat**. Redeploy Production after changing variables to make them available to the server.

Sign in at \`https://threefold-preview.vercel.app/admin/\`. The test panel will show the **last four digits** of the allowlisted recipient if configured. Review the fixed message, affirm that the number is your own, explicitly consent to this one SMS, confirm verified 10DLC approval, and type \`SEND ONE TEST\`. The client presents a final confirmation dialogue and calls the protected server endpoint once. Each new click is a new potentially billable request, so **do not resend if delivery is uncertain**.

An accepted/queued result from \`POST https://api.telnyx.com/v2/messages\` is not proof of handset delivery. Check the receiving phone and Telnyx's message delivery status. If the request times out, treat the outcome as uncertain and investigate in Telnyx before attempting any more messages.

When finished, turn \`THREEFOLD_TEST_SMS_ENABLED\` back off (or remove the variable) and redeploy. There is no durable SQL audit, cross-instance rate limit, inbound message handling, recurring sending or automatic retry for this temporary check. Do not use it for customer traffic.

### Safety properties
- Fixed, non-editable SMS body includes STOP instructions. The browser cannot supply text or override the allowlisted recipient.
- The server checks authenticated admin session, same-origin POST, predefined acknowledgment string, three explicit affirmations, valid U.S. E.164 sender/recipient, different sender/recipient, carrier-attested flag and explicit enabled flag.
- The browser and API return masked destination last four digits only; keys and destination number remain in Vercel.
- No sends occur merely by loading the page, logging in, checking Telnyx credentials, or running OpenAI.
- The endpoint does **not** query actual 10DLC status; that's a manual prerequisite.
- This pilot test cannot establish delivery without reading provider delivery events or inspecting the phone.
