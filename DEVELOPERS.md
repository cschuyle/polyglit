See envrc-template:
- Env var to use local data rather than in-cloud

## Running

```
npm install # once
# Data used depends on values of REACT_APP_USE_FIXTURES_FLAG
npm run start
```

Languages are maintained in the moocho/languages trove.

## Deploying

This is Github Pages, and a deploy is done like this from your local machine (from the `frontend/` directory).

```
npm run deploy
```

The production bundle is built with **`env-cmd` and `frontend/.env.deploy`**, not your shell-only variables. Edit `.env.deploy` to set `REACT_APP_*` values for GitHub Pages (for example `REACT_APP_GROUP_BY_FLAG` and `REACT_APP_SORT_NAV_FLAG`). To try that build locally without publishing:

```
npm run build:deploy
```

Plain `npm run build` still uses only `.env.production` (if present) and your environment, as usual for Create React App.

### Custom Domain and Github Pages configuration

Plain old domain is https://cschuyle.github.io/polyglit

Custom domain is https://lepetitprince.international

GH Pages redirectos to custom from plain if custom domain is configured correctly:
```
Build and deployment
Source: Deploy from a branch
Branch: gh_pages  /root
```

### Deploy issues

Several times I've resorted to removing and putting back the custom domain at the Github site.


## Environment Variables

### `REACT_APP_USE_FIXTURES_FLAG`

Controls whether trove data is loaded from local fixtures instead of S3.

- `true` (case-insensitive): use `/fixtures/public/...`
- Any other value (including unset): use S3 URLs

### `REACT_APP_GROUP_BY_FLAG` (feature flag)

Controls whether the `Group by` dropdown is shown in the UI.

- The dropdown is visible only when this value is exactly `true` (case-insensitive).
- Any other value (including unset) hides the dropdown.

For **`npm run deploy`**, set this in **`frontend/.env.deploy`** (see the Deploying section above). That keeps deploy settings separate from `envrc-template` / your interactive shell.

### `REACT_APP_SORT_NAV_FLAG` (feature flag)

Controls whether the right-hand navigator is shown when **not** grouping (that is, `Group by = none`).

- `true` (case-insensitive): show right-hand navigator in sort-only gallery mode.
- Any other value (including unset): hide right-hand navigator in sort-only gallery mode.
- This flag does **not** affect grouped mode: when grouping is active, the right-hand navigator still appears.

For **`npm run deploy`**, set this in **`frontend/.env.deploy`** as needed.

Examples:

```bash
# use local fixtures + show Group by dropdown + show sort-only right nav
REACT_APP_USE_FIXTURES_FLAG=true REACT_APP_GROUP_BY_FLAG=true REACT_APP_SORT_NAV_FLAG=true npm run start

# show Group by dropdown
REACT_APP_GROUP_BY_FLAG=true npm run start

# show right nav in sort-only mode (Group by = none)
REACT_APP_SORT_NAV_FLAG=true npm run start

# hide Group by dropdown (default behavior)
REACT_APP_GROUP_BY_FLAG=false npm run start

# hide sort-only right nav (default behavior)
REACT_APP_SORT_NAV_FLAG=false npm run start
```

### `REACT_APP_TROVE_DATA`

A JSON array (as a literal string) describing the troves available in the app. Each entry drives the header display and determines which data file is loaded.

**Shape of each entry:**

| Field | Required | Description |
|-------|----------|-------------|
| `troveId` | yes | Identifier; also used as the URL path segment and as `${troveId}.json` to locate the data file |
| `shortName` | yes | Label shown on the trove-selector tab button |
| `h1` | yes | Main header title (plain text) |
| `h2` | yes | Subtitle — supports inline Markdown (`*italic*`, `**bold**`) |
| `h3` | no | Optional tagline — supports inline Markdown |

If unset or empty, the app renders no header content and loads no trove.

For **`npm run deploy`**, set this in **`frontend/.env.deploy`**.

**Single-trove example:**

```bash
REACT_APP_TROVE_DATA='[{"troveId":"hobbit","shortName":"The Hobbit","h1":"The Hobbit","h2":"or, *There and Back Again*, by J.R.R. Tolkien","h3":"... in Lots of Languages"}]' npm run start
```

**Multi-trove example** (combine with `REACT_APP_MULTI_TROVES_FLAG=true` for selector tabs):

```bash
REACT_APP_TROVE_DATA='[{"troveId":"little-prince","shortName":"Le Petit Prince","h1":"Le Petit Prince","h2":"or, *The Little Prince*, by Antoine de Saint-Exup\u00e9ry","h3":"... in Lots of Languages"},{"troveId":"hobbit","shortName":"The Hobbit","h1":"The Hobbit","h2":"or, *There and Back Again*, by J.R.R. Tolkien","h3":"... in Lots of Languages"},{"troveId":"books","shortName":"Books","h1":"A sundry collection of books in many languages,","h2":"or translated from one"}]' REACT_APP_MULTI_TROVES_FLAG=true npm run start
```

### `REACT_APP_MULTI_TROVES_FLAG`

Controls whether trove-selector tabs appear in the header. Defaults to `false`.

- Must be `true` for the tabs to render.
- Also requires `REACT_APP_TROVE_DATA` to contain more than one entry — both conditions must be met.