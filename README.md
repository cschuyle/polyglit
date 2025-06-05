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
2. Login to Namecheap, change to Custom DNS for the domain, enter the DNS servers that Cloudflare told you to.
3. In Github, Settings / Pages, add new domain. It'll tell you to add a TXT record to your DNS. So go to Cloudflare, add the TXT record.
4. Wait for propagation. Shouldn't be more than 1/2 hour or so.

### Deploy to github pages
```
cd frontend
npm run deploy
```