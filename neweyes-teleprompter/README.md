# NewEyes TikTok Recording Teleprompter

This folder contains a standalone TikTok recording teleprompter for the NewEyes Studio pipeline.

## File

- `index.html` — phone-friendly recorder + teleprompter page

## What it does

- Loads episodes from the NewEyes Studio Google Sheet pipeline through Apps Script JSONP
- Shows ready-to-record episodes
- Opens a camera-based teleprompter
- Records locally in the browser when supported
- Lets Adam preview and download the take

## Required Google Apps Script backend

The Apps Script `/exec` endpoint must support JSONP GET actions:

- `action=listEpisodes`
- `action=getEpisodeScript&episode_id=NY-000001`

The current endpoint is hardcoded in `index.html`:

```text
https://script.google.com/macros/s/AKfycbxX0J_yqJaJedD0gixgKiPLBIMXS9frc3hP7UI9EKNedaCGg7ZJIgUa1SZv3-zKs3cG/exec
```

## Expected URL once GitHub Pages is active

Because `educationalconsulting` is public, GitHub Pages can serve this folder if the repo Pages source allows it.

Likely URL:

```text
https://drbellschool.github.io/educationalconsulting/neweyes-teleprompter/
```

## Workflow

```text
NewEyes GPT → Send to Pipeline → Google Sheet/Drive → Teleprompter page → Record → Download Take
```

Next feature: upload the accepted take back into the episode Drive folder.
