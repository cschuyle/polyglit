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

The production bundle is built with **`env-cmd` and `frontend/.env.deploy`**, not your shell-only variables. Edit `.env.deploy` to set `REACT_APP_*` values for GitHub Pages (for example `REACT_APP_GROUP_BY_FLAG`). To try that build locally without publishing:

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

Examples:

```bash
# use local fixtures + show Group by dropdown
REACT_APP_USE_FIXTURES_FLAG=true REACT_APP_GROUP_BY_FLAG=true npm run start

# show Group by dropdown
REACT_APP_GROUP_BY_FLAG=true npm run start

# hide Group by dropdown (default behavior)
REACT_APP_GROUP_BY_FLAG=false npm run start
```