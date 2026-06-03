# Screenshot Guide

This guide describes how the owner can manually capture README and portfolio screenshots for SingFlow AI.

The repository currently does not include screenshot images. README placeholders should remain text-only until the owner captures and adds real project screenshots.

## Screenshot Goals

- Show the polished frontend prototype without claiming backend integration.
- Highlight the AI music workflow, not a generic admin dashboard.
- Demonstrate Studio, planning, playlist, group fusion, Agent observability, and dashboard surfaces.
- Keep every screenshot copyright-safe.

## Recommended Pages

| Screenshot | Route | Purpose |
| --- | --- | --- |
| Studio Home | `/` | Main portfolio cover and product entry |
| AI Session Planner | `/planner` | Natural-language scene planning and constraints |
| Playlist Timeline | `/timeline` | Ordered playlist workflow and recommendation reasons |
| Group Taste Mixer | `/mixer` | Multi-person preference fusion |
| Agent Console Preview | `/agent-runs/demo` | Tool-call timeline and safe summaries |
| Dashboard / Feedback Memory | `/dashboard` | Metrics, feedback, and memory surfaces |

## Recommended Viewports

Capture at least:

- Desktop: `1440 x 1000`
- Laptop: `1280 x 900`
- Mobile: `390 x 844`

For README, desktop screenshots should be prioritized. Mobile screenshots can be used later in a small responsive section.

## File Names

Save screenshots under:

```text
docs/assets/screenshots/
```

Recommended file names:

```text
studio-home.png
planner.png
timeline.png
mixer.png
agent-console.png
dashboard.png
```

## Safety Rules

- Do not use real music covers.
- Do not use brand logos.
- Do not use copyrighted photos or media assets.
- Do not show real song lyrics.
- Do not show audio, MV, or streaming links.
- Keep all song titles and artist names fictional or demo-safe.

## README Update Rule

Do not embed screenshot image paths in README until the files actually exist.

After manual capture, update README with Markdown image syntax that points to files that already exist, such as a `Studio Home` image using `docs/assets/screenshots/studio-home.png`.

Only add image references after the files are present in the repository.
