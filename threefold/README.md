# Threefold — PostgreSQL-backed pilot

**Stage:** GitHub draft implementation. **No live Supabase project is connected yet; no SQL migration has run, and no SMS or AI services have been deployed.**

Threefold is the SMS + AI relationship-adventure companion to The Marriage Project. It retains the existing public website at [lonestarteacher.com/threefold/](https://www.lonestarteacher.com/threefold/) and adds a Google-free admin application at /threefold/admin/.

## System design

- **GitHub Pages:** The public website and private-*login* admin UI (admin source is public, as expected for static hosting).
- **Supabase PostgreSQL:** Real relational SQL tables and indexes for participants, couples, consent, messages, Whispers, reminders, adventures, milestones, queued SMS and operational audits.
- **Supabase Auth + Row Level Security:** Admins sign in with authorized email accounts. The browser gets a publishable key and can read approved operational aggregates only; private message bodies, Love Whispers and linking codes are not exposed through admin browser permissions.
- **Supabase Edge Functions:** A webhook verifies **Telnyx Ed25519 signatures** before inserting provider events, and a separately protected background function processes those events, writes to PostgreSQL, sends Telnyx messages and calls OpenAI's Responses API. No separate Cloudflare Worker or Google Apps Script is required.
- **Supabase Cron:** Runs one-minute queue jobs using a secret token stored in **Supabase Vault**. Delivery schedules are approximate; exact times are not guaranteed.
- **Telnyx:** SMS number +1 903-609-0465, pending carrier campaign registration. Do not invite outside participants until the carrier approval and production checks are complete.
- **OpenAI:** Server-side only; no API key ever appears in GitHub Pages code, repository, or database rows.

## SQL files

| File | Purpose |
| --- | --- |
| \`supabase/migrations/202610180001_threefold_init.sql\` | SQL schema, constraints, indexes, RLS and atomic queue-claim procedures |
| \`supabase/functions/telnyx-webhook/index.ts\` | Signed inbound Telnyx messages to idempotent event inbox |
| \`supabase/functions/process-queue/index.ts\` | Independent opt-ins, link approval, Whisper sharing, date prompt, reminders, AI, outbound SMS |
| \`supabase/config.toml\` | Two function endpoints with JWT gateway check disabled (each uses its own authentication) |
| \`admin/index.html\` | Supabase Auth admin dashboard showing counts and non-content audit activity |

## Database tables

- \`threefold_participants\`: Phone/consent state and private interaction pointers
- \`threefold_couples\`: Mutual partnership relationship
- \`threefold_link_codes\`: Time-limited code plus approval
- \`threefold_messages\`: Private per-user messages (never queried directly by public dashboard)
- \`threefold_whispers\`: Love Whisper prompts, private responses and sharing status
- \`threefold_reminders\`: Scheduled one-time messages with timezone-aware UTC due dates
- \`threefold_inbound_events\`: Webhook event inbox, provider event ID uniqueness, error review state
- \`threefold_outbox\`: Outgoing SMS with delivery review state
- \`threefold_adventures\`: Date, challenge, Deep Dive, gift and Whisper catalog schema
- \`threefold_progress\`: Couple adventure/petal/milestone progress schema
- \`threefold_audit\`: Consent, linking and share events without conversation bodies
- \`threefold_admins\`: Explicit allowlist for Auth users who may view the admin dashboard

## Set up Supabase

1. Create a project at [supabase.com](https://supabase.com/). Choose a safe database password and a region close to the pilot. Use a project dedicated to Threefold.
2. Apply \`supabase/migrations/202610180001_threefold_init.sql\` with **Supabase > SQL Editor**, or apply it as an ordered migration using the Supabase CLI. **Never apply production SQL blindly; review it in staging first.**
3. Open **Authentication > Users**. Create/invite the administrator account you will use. In SQL Editor, change the email in the statement below to the authorized email and run it:
   \`\`\`sql
   insert into public.threefold_admins(user_id)
   select id from auth.users where email = 'YOUR-ADMIN-EMAIL@EXAMPLE.COM';
   \`\`\`
   Do not add couple participants as administrators. Configure Auth email sender/SMTP as needed, and add \`https://www.lonestarteacher.com/threefold/admin/\` to allowed **Authentication > URL Configuration** redirect URLs.
4. In **Project Settings > API Keys**, copy the **Project URL** and the \`sb_publishable_...\` publishable key. These are specifically designed for browser use with RLS. Never use a secret/service role API key in browser code.
5. After the branch is merged into \`main\`, visit \`https://www.lonestarteacher.com/threefold/admin/\`. Enter the public project URL and publishable key and save them locally in your browser; then sign in with your allowed email address. The dashboard reads SQL-backed participant and queue counts.

## Deploy server functions

Run from your checkout (replace PROJECT_REF with your Supabase project reference):

\`\`\`bash
npx supabase login
npx supabase link --project-ref PROJECT_REF --workdir threefold/supabase
npx supabase functions deploy telnyx-webhook --workdir threefold/supabase
npx supabase functions deploy process-queue --workdir threefold/supabase
\`\`\`

Consult your installed CLI's \`--help\` if a different working-directory syntax is required. Function-specific \`verify_jwt = false\` is explicit in \`supabase/config.toml\`; **this does not make the endpoints unauthenticated:** one verifies Telnyx signatures, while the queue requires a server-side \`x-threefold-job-secret\` request header.

In **Supabase Edge Functions > Secrets**, set these values (never put them in GitHub or the public admin page):

| Name | Value |
| --- | --- |
| \`TELNYX_PUBLIC_KEY\` | Telnyx 32-byte Ed25519 webhook public key as 64 hex characters |
| \`TELNYX_API_KEY\` | Telnyx v2 API token |
| \`TELNYX_FROM_NUMBER\` | \`+19036090465\` |
| \`OPENAI_API_KEY\` | OpenAI API key from API Platform |
| \`OPENAI_MODEL\` | \`gpt-4.1-mini\` by default; choose a model actually available to your account |
| \`THREEFOLD_JOB_SECRET\` | Random 32-byte or longer secret; use the same value in Supabase Vault |

The platform supplies the server-side \`SUPABASE_URL\` and default \`SUPABASE_SECRET_KEYS\`. Never pass them to the public website. For local function runs, copy \`supabase/functions/.env.example\` to \`supabase/functions/.env\`, fill it privately and keep it out of source control.

Your Telnyx inbound webhook will be:

\`\`\`text
https://PROJECT_REF.supabase.co/functions/v1/telnyx-webhook
\`\`\`

Assign it to your Telnyx messaging profile only after carrier setup and controlled verification. It rejects unsigned or expired packets, persists signed events uniquely, and responds HTTP 200 only on successful event persistence. It does not send SMS synchronously.

## Configure scheduled queue processing

Supabase provides Cron (\`pg_cron\`) and \`pg_net\`. Enable both plus Supabase Vault. In **SQL Editor**, store the project URL and the same random job token using \`vault.create_secret\`:

\`\`\`sql
select vault.create_secret('https://PROJECT_REF.supabase.co','threefold_project_url');
select vault.create_secret('SAME_RANDOM_JOB_SECRET_FROM_EDGE_FUNCTION','threefold_job_secret');
\`\`\`

Then schedule the queue (execute once per project):

\`\`\`sql
select cron.schedule(
  'threefold-process-queue',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='threefold_project_url') || '/functions/v1/process-queue',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-threefold-job-secret',(select decrypted_secret from vault.decrypted_secrets where name='threefold_job_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
\`\`\`

**Operational caveats:** Worker attempts that fail after claiming an event or outbound message may leave a \`PROCESSING\` row for manual review. Explicitly resolve such states in the SQL console only after checking Telnyx history; never blindly replay uncertain sends. Set up alerts and an incident procedure before broad use.

## SMS behavior implemented in code

- \`JOIN\` / \`START\` → adult and consent confirmation → \`YES\` → \`OPTED_IN\`. Each phone is independent; couple linking never opts in the other phone.
- \`STOP\`, \`STOPALL\`, \`UNSUBSCRIBE\`, \`END\`, \`CANCEL\` or \`QUIT\` → opt out, suppress queued outbound and cancel pending reminders. \`HELP\` replies with support.
- \`LINK\` → share a short-lived code with your independently enrolled partner. Partner replies \`LINK ABC123\` and creator replies \`APPROVE ABC123\`.
- \`WHISPER\` → a private answer saved to SQL. \`SHARE\` gives a preview; \`CONFIRM SHARE\` explicitly sends only the chosen Whisper to the linked participant.
- \`DATE\` → one shared novelty experience.
- \`REMIND 2026-11-02T19:00:00-06:00 | Ask about date night\` → one-time personal reminder. Explicit timezone offset is required to avoid daylight-saving ambiguity. Friendly natural language/date-picker reminders come in a later phase.
- Other texts from opted-in participants → OpenAI responses using the **individual's** recent private AI conversation only, with \`store:false\` and no partner history.

## Deliberately still pending

- The full 8-story-milestone Deep Dive engine, petals and visual cord growth.
- Personal invitation pages, natural-language reminder intake, recurring anniversary date-night workflows, budget/babysitter delegation, reminder escalation, petal awards.
- Authentication and account controls for participant-facing website login (SMS participation works without web logins).
- Privacy export/deletion tooling, provider-level opt-out reconciliation, rate/cost abuse safeguards, retention policy implementation, deep integration tests and formal security review.
- Production setup and live testing: **nothing connects to your accounts until you create the Supabase project, configure its secrets, and deploy.**

## Safety and privacy

- SMS and database operators can read content; do not promise end-to-end encryption. The privacy guarantee is **between spouses by default**, not invisibility to the operator, Telnyx, Supabase or OpenAI.
- Enforce independent affirmative adult consent and record opt-in; never send surprise messages to a spouse who has not enrolled.
- Carrier-level STOP suppression and Telnyx messaging restrictions must be honored in addition to the database. Never force delivery after provider opt-out.
- An admin can edit records from the Supabase console; the public dashboard intentionally shows **no conversation body**.
- This is an adventure/relationship education product, not psychotherapy, clinical counseling or an emergency response system.

## Verification checklist before merging and going live

- [ ] Review the RLS policies and test that an anonymous visitor cannot query any participant, message or Whisper row
- [ ] Test an authenticated non-admin and authorized admin against the same dashboard
- [ ] Verify unsigned Telnyx webhook requests return 401 and never create inbox events
- [ ] Verify signed event ID replay results in one SQL event
- [ ] Execute JOIN/YES from two consenting test phones; LINK/APPROVE; private WHISPER; SHARE/CONFIRM SHARE; STOP
- [ ] Test OpenAI context includes messages only for the current participant
- [ ] Verify reminders across DST offset changes and carrier-approved sending windows
- [ ] Verify no automatic SMS resend on timeout or uncertain Telnyx result
- [ ] Create operational runbooks, retention/erasure policy and provider STOP reconciliation
- [ ] Confirm 10DLC approval and Telnyx messaging profile configuration
