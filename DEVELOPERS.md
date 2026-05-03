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

This is Github Pages, and a deploy is done like this from your local machine.

```
npm run deploy
```

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

Examples:

```bash
# use local fixtures + show Group by dropdown
REACT_APP_USE_FIXTURES_FLAG=true REACT_APP_GROUP_BY_FLAG=true npm run start

# show Group by dropdown
REACT_APP_GROUP_BY_FLAG=true npm run start

# hide Group by dropdown (default behavior)
REACT_APP_GROUP_BY_FLAG=false npm run start
```