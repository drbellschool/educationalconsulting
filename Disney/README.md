# Disney Vacation Deal Dashboard

This folder contains a lightweight family Disney World deal tracker.

## What it does

- Keeps your family trip criteria in `config/family-criteria.json`.
- Runs small deal-checking agents from `src/dealAgents.js`.
- Generates a static webpage at `public/index.html`.
- Saves the latest recommendations to `data/deals.json`.
- Can be refreshed by GitHub Actions with `.github/workflows/disney-deals.yml`.

## Important note

This is not a magic paid-travel-agent replacement. It is a structured watcher. It checks configured sources, scores deals against your family criteria, and gives you a clean webpage to review with Alissa.

The safest sources are official or semi-official pages that allow public access. Avoid scraping sites that block bots or violate terms.

## Quick start

From this repository:

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

## GitHub Pages option

If GitHub Pages is enabled for this repository, point it to the `Disney/public` folder or copy the generated `public/index.html` into the Pages path you use.

## Default deal sources

The starter configuration watches:

- Walt Disney World special offers
- Disney World tickets/special offers
- Undercover Tourist Disney World tickets
- Google Flights search link placeholder
- Southwest search link placeholder

The script creates recommendations, but it will not purchase anything or enter personal data.

## Customize your family criteria

Edit:

```text
Disney/config/family-criteria.json
```

Suggested fields:

- familySize
- childrenAges
- departureCity
- targetMonths
- maxTotalBudget
- preferredResortTypes
- mustHave
- niceToHave

## Automation

The included workflow is designed to run daily and update `Disney/data/deals.json` and `Disney/public/index.html`.

You may need to enable Actions permissions in GitHub so the workflow can commit updates back to the repository.
