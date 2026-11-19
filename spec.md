# X-Matrix file format

An X-Matrix is one markdown file: a `# Title`, then 1–8 `## ` sections of `- slug: Title` items, then an
optional `## Intersections` section linking items in neighbouring sections.

## Minimal example

```markdown
# My plan

## Breakthrough objectives
- grow: Grow the business

## Annual objectives
- launch: Launch v1

## Intersections
- grow -> launch: strong
```

Two sections, so it is drawn as a table. That is a complete plan.

## Full example

```markdown
# My app plan

> Last updated 2026-11-19: onboarding

## Breakthrough objectives: 3–5 year
slug: vision
Where we want to be by 2029.

- grow: Grow paid users 3×

## Annual objectives
slug: goals
- launch: Launch v1 by March
- retain: Monthly churn under 3%

## Top-level priorities
slug: priorities
color: #C2410C
- onboarding: Self-serve onboarding
  Sign-up to first project in under five minutes.
- billing: Usage-based billing

## Targets to improve
slug: kpis
- signups: 500 sign-ups a month
- churn: Churn report every Friday

## Owners > Top-level priorities
slug: owners
- priya: Priya
- tom: Tom

## Intersections
- launch -> grow: strong
- retain -> grow: supporting
- onboarding -> launch: strong
- billing -> retain: supporting
- signups -> onboarding: strong
- churn -> billing: strong
- priya -> onboarding: leads
- tom -> billing: supports
```

[`examples/acme-plan/x-matrix.md`](examples/acme-plan/x-matrix.md) is a fuller plan.

## Sections

`# Title`, optionally followed by a `> Last updated YYYY-MM-DD: slug` line (written by **Save** and
**Download**; see the README's [Badge & summary images](README.md#badge--summary-images)), then 1–8 `## `
sections of `- slug: Title` items. A heading may add a subtitle after a colon
(`## Breakthrough objectives: 3–5 year`).

The sections go round a polygon from the bottom, clockwise, and each one intersects its neighbours:
1 section is a list, 2 a table, 3 a triangle, 4 the classic X, 5 or more a star.
`## Owners > Priorities` attaches a section to just one other section (here, Priorities), drawn beyond
the next section's rows.

Under a heading, before its items:

| Line | Meaning |
| --- | --- |
| `slug: short-name` | Names the section on badges and in card settings. Default: the slugified title, cut to 12 characters (e.g. `targets-to-i`). |
| `color: #RRGGBB` | The section's colour. Default: by position. |
| any other text | Describes the section. |

## Items

`- slug: Title`. Text under an item, indented so it renders as part of the list item, is that item's
detail. New items get a slug from their text (`Grow exports` → `grow-exports`), kept in step as you type
until you set one by hand. The colour, short name and description, and the selected item's slug and
detail, are also editable in the **Details** drawer (the tab on the right edge; `?details` keeps it open).

## Intersections

Under `## Intersections`, one link per line: `- from -> to: strong | supporting`, or `leads | supports`
for an attached section such as Owners. `from` and `to` are item slugs.

## Card settings

`hoshin-kanri card` and `hoshin-kanri badge` read an optional `<name>.card.json` beside the markdown
(`x-matrix.md` → `x-matrix.card.json`); its fields are in the README's
[Card designer and settings](README.md#card-designer-and-settings).
