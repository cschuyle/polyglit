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

### `REACT_APP_TROVE_IDS`

Controls which trove the root route (`/`) loads and which exact trove-ID paths are available.

- A single valid ID: load that trove on `/`
- `hobbit`: load The Hobbit
- `alice-in-wonderland`: load Alice in Wonderland
- `books`: load the opportunistically-acquired titles collection
- A comma-delimited list such as `little-prince,hobbit,books`: show header tabs on `/`; the first valid ID becomes the default selected tab.
- A route like `/hobbit` only shows that trove when `hobbit` is present in `REACT_APP_TROVE_IDS`; any other route falls back to the default page.

If no valid IDs are configured, the app falls back to its first built-in trove config.

For **`npm run deploy`**, set this in **`frontend/.env.deploy`** if you want to ship a build rooted at a different trove.

```bash
# load hobbit at the root route
REACT_APP_TROVE_IDS=hobbit npm run start

# load alice at the root route
REACT_APP_TROVE_IDS=alice-in-wonderland npm run start
# show tabs for Little Prince, Hobbit, and Books on the root route
REACT_APP_TROVE_IDS=little-prince,hobbit,books npm run start
```