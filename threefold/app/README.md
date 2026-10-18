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
