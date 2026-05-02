See envrc-template:
- Env var to use local data rather than in-cloud

## Running

```
npm install # once
npm run start-s3.   # Use data in S3
npm run start-local # Use local data in `fixtures`
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
