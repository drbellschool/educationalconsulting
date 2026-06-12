# Disney Vacation Bot

This folder is a separate Disney bot for the Bell family. It does not touch the existing homepage or the `goat` folder.

## Current trip target

- Family: Adam, beautiful wife, and four kids
- Kids: ages 3, 6, 14, and 16
- Destination: Walt Disney World, Orlando, Florida
- Travel style: Drive
- Trip length: About 4 days
- Budget target: $2,000 to $3,000

That budget means the bot should favor realistic options: off-site hotel, Good Neighbor hotel, limited park days, low-crowd windows, free breakfast, and deals that reduce tickets or lodging.

## What it does

- Stores family criteria in `config/family-criteria.json`.
- Stores watched sources in `config/sources.json`.
- Scores possible deals with `src/scoring.js`.
- Uses `src/openaiPlanner.js` to connect to the OpenAI API when `OPENAI_API_KEY` is configured.
- Generates `data/deals.json`.
- Generates a simple webpage at `public/index.html`.

## Quick start

```bash
cd Disney
npm install
npm run refresh
npm run serve
```

Then open:

```text
http://localhost:8787
```

## OpenAI agent setup

Add this as an environment variable locally or as a GitHub Actions secret:

```text
OPENAI_API_KEY=your_key_here
```

Optional:

```text
OPENAI_MODEL=gpt-4.1-mini
```

## Automation

I placed a workflow example here:

```text
Disney/workflows/disney-deals.example.yml
```

To make it run automatically in GitHub Actions, copy that file to:

```text
.github/workflows/disney-deals.yml
```

I did not create that top-level workflow automatically because you asked for this to live in its own Disney folder and not disturb the rest of the repository.

## Important note

This bot watches and scores public deal sources. It does not buy anything, enter personal information, or scrape protected/private pages. Prices still need to be verified before booking.
