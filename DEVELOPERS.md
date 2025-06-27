# Polyglit

Showcase for foreign language book collections

```
cd frontend
npm install
npm start
```

### Data store

See `moocho` repo

### Config

Github pages URL is in `frontend/package.json`, 
the value of the `homepage` field.
It's the default github pages URL (`https://USERNAME.github.io/PROJECT`), 
as opposed to any vanity URL that it might be redirected to.

### Prepare a domain

Currently using Cloudflare for DNS. Assuming the domain is registered at Namecheap.
1. Login to Cloudflare, add domain.
2. Add `A` records to the DNS settings for the new domain, as explained here: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
   
   In summary, add A records for the following IPs to map to root (in CloudFlare DNS settings):
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
2. Login to Namecheap, change to Custom DNS for the domain, enter the DNS servers that Cloudflare told you to. Note that the previous step is Cloudflare DNS, whereas this step is Namecheap DNS servers.
3. In Github, Settings / Pages, add new domain. It'll tell you to add a `TXT` record to your DNS. So go to Cloudflare, add the TXT record.
4. Wait for propagation. Shouldn't be more than 1/2 hour or so.
5. Login to AWS. On the S3 buckets, make sure that CORS policy is set to allow GETs from the new domain.
6. Make sure your new domain ins configured in Github Pages settings for this repo.

### Deploy to github pages
Make sure everything you want is committed, then:
```
cd frontend
npm run deploy
```

What this actually does is push the current to the `gh_pages` branch. That's because the Github Pages config is as follows:
```
Build and deployment
Source: Deploy for a branch
Branch: gh_pages
Folder: Root
```


