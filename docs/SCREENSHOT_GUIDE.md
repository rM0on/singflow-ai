# Screenshot Guide

This guide describes how the owner can manually capture README and portfolio screenshots for SingFlow AI.

The repository includes a refreshed Phase 4B screenshot set under `docs/assets/screenshots/`. The core portfolio visuals now match the latest Planner, Mixer, Dashboard, and runtime-status surfaces while staying local, mock-only, and copyright-safe.

## Screenshot Goals

- Show the polished frontend prototype and local mock/backend workflow surfaces without overstating the integration scope.
- Highlight the AI music workflow, not a generic admin dashboard.
- Demonstrate Studio, planning, playlist, group fusion, Agent observability, and dashboard surfaces.
- Keep every screenshot copyright-safe.
- Keep mock-only / metadata-only wording visible where it appears in the UI.

## Recommended Pages

| Screenshot | Route | Purpose |
| --- | --- | --- |
| Studio Home | `/` | Main portfolio cover and product entry |
| AI Session Planner | `/planner` | Natural-language scene planning and constraints |
| Playlist Timeline | `/timeline` | Ordered playlist workflow and recommendation reasons |
| Group Taste Mixer | `/mixer` | Multi-person preference fusion |
| Agent Console Preview | `/agent-runs/demo` | Tool-call timeline and safe summaries |
| Dashboard / Feedback Memory | `/dashboard` | Metrics, feedback, and memory surfaces |

## Phase 4B Refreshed Core Set

The Phase 4B refresh overwrote the existing core files:

```text
studio-home.png
planner.png
timeline.png
mixer.png
agent-console.png
dashboard.png
```

Optional future additional captures:

```text
planner-generated.png
mixer-fusion.png
dashboard-feedback.png
```

Current refreshed screenshot states:

- Planner after a deterministic mock generation result is visible.
- Mixer after local mock taste fusion is visible.
- Dashboard after a metadata-only feedback memory signal is visible.
- Timeline with backend session metadata visible while phase/song cards remain mock-safe.
- Agent Console showing persisted run and step summaries.

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

README may reference screenshot paths that already exist. If optional new captures are added, update README only after those files are present in the repository.
