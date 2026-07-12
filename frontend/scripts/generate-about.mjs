import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {marked} from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(frontendRoot, '..');

function deployVersion() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  let sha = 'unknown';
  try {
    sha = execSync('git rev-parse --short=7 HEAD', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    // Local tree without git history.
  }
  return `${yyyy}-${mm}-${dd}.${sha}`;
}

/** Split README into site title, tagline (header), and remaining body markdown. */
function splitReadme(readme) {
  const lines = readme.split('\n');
  let i = 0;
  if (lines[i]?.startsWith('# ')) {
    const title = lines[i].slice(2).trim();
    i += 1;
    while (i < lines.length && lines[i].trim() === '') i += 1;
    const taglineLines = [];
    while (i < lines.length && lines[i].trim() !== '') {
      taglineLines.push(lines[i]);
      i += 1;
    }
    while (i < lines.length && lines[i].trim() === '') i += 1;
    let headerNote = '';
    if (lines[i]?.startsWith('### ')) {
      headerNote = lines[i].slice(4).trim();
      i += 1;
      while (i < lines.length && lines[i].trim() === '') i += 1;
    }
    return {title, tagline: taglineLines.join('\n'), headerNote, body: lines.slice(i).join('\n')};
  }
  return {title: 'About', tagline: '', headerNote: '', body: readme};
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Pull the leading Copyright and license lines out of the body for the page footer. */
function peelCopyright(body) {
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i += 1;
  let copyright = '';
  let license = '';
  if (lines[i]?.trim().toLowerCase().startsWith('copyright')) {
    copyright = lines[i].trim();
    i += 1;
    while (i < lines.length && lines[i].trim() === '') i += 1;
    if (lines[i]?.trim().toLowerCase().startsWith('licensed')) {
      license = lines[i].trim();
      i += 1;
    }
    while (i < lines.length && lines[i].trim() === '') i += 1;
  }
  return {copyright, license, body: lines.slice(i).join('\n')};
}

const readmePath = path.join(repoRoot, 'README.md');
const readme = fs.readFileSync(readmePath, 'utf8');
const {title, tagline, headerNote, body: rawBody} = splitReadme(readme);
const {copyright, license, body} = peelCopyright(rawBody);
const version = deployVersion();
const bodyHtml = marked.parse(body);
const licenseHtml = license ? marked.parseInline(license) : '';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>About ${escapeHtml(title)}</title>
  <style>
    body {
      box-sizing: border-box;
      margin: 0;
      color: #373737;
      background: #f2f2f2;
      font-size: 16px;
      font-family: 'Myriad Pro', Calibri, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .outer { width: 100%; }
    #header_wrap {
      position: relative;
      background: #212121;
      background: linear-gradient(to top, #373737, #212121);
    }
    #header_wrap .inner {
      position: relative;
      max-width: 640px;
      margin: 0 auto;
      padding: 20px 10px 14px;
    }
    #header_wrap h1,
    #header_wrap h2,
    #header_wrap h3 {
      margin: 10px 0;
      border: 0;
      font-family: 'Lucida Grande', Calibri, Helvetica, Arial, sans-serif;
      letter-spacing: -1px;
    }
    #header_wrap h1,
    #header_wrap h2 {
      padding: 0;
    }
    #header_wrap h2 {
      padding-bottom: 10px;
    }
    #project_title {
      margin: 0 0 2px;
      color: #fff;
      font-size: 34px;
      font-weight: 700;
      text-shadow: #111 0 0 10px;
    }
    #project_tagline {
      margin: 0 0 1px;
      color: #fff;
      font-size: 20px;
      font-weight: 300;
      background: none;
      text-shadow: #111 0 0 10px;
    }
    #header_wrap #project_tagline2 {
      margin: 0;
      padding: 0 0 0 1.5em;
      color: #ddd;
      font-size: 16px;
      font-weight: 200;
      background: none;
      text-shadow: #111 0 0 10px;
    }
    @media screen and (max-width: 480px) {
      body { font-size: 14px; }
      #header_wrap .inner { min-width: 320px; max-width: 480px; }
      #project_title { font-size: 32px; }
    }
    @media screen and (max-width: 320px) {
      #header_wrap .inner { min-width: 240px; max-width: 320px; }
      #project_title { font-size: 28px; }
    }
    .content-inner {
      max-width: 640px;
      margin: 0 auto;
      padding: 20px 10px 32px;
    }
    .content {
      background: #fff;
      padding: 24px 20px 32px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.06);
    }
    .content h2, .content h3 {
      font-family: 'Lucida Grande', Calibri, Helvetica, Arial, sans-serif;
      color: #222;
      letter-spacing: -0.5px;
    }
    .content h2 {
      font-size: 24px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ddd;
      margin-top: 0;
    }
    .content h3 { font-size: 20px; }
    .content a { color: #0f79d0; }
    .content table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    .content th, .content td {
      border: 1px solid #373737;
      padding: 8px 10px;
      text-align: left;
    }
    .content th { background: #373737; color: #fff; }
    .content pre, .content code {
      font-family: Monaco, "Bitstream Vera Sans Mono", "Lucida Console", monospace;
      font-size: 14px;
    }
    .content pre {
      background: #f8f8f8;
      padding: 12px;
      overflow: auto;
      border-radius: 4px;
    }
    .content code {
      background: #f8f8f8;
      padding: 2px 4px;
      border-radius: 2px;
    }
    .content ul, .content ol { padding-left: 24px; }
    .content li { margin: 6px 0; }
    .footer-meta {
      margin: 3em 0 0;
      padding-top: 1.5em;
      border-top: 1px solid #e0e0e0;
      font-size: 13px;
      font-style: italic;
      color: #777;
    }
    .footer-meta p {
      margin: 0.5em 0 0;
    }
    .footer-meta p:first-child {
      margin-top: 0;
    }
  </style>
</head>
<body>
  <div id="header_wrap" class="outer">
    <header class="inner">
      <h1 id="project_title">${escapeHtml(title)}</h1>
      ${tagline ? `<h2 id="project_tagline">${escapeHtml(tagline)}</h2>` : ''}
      ${headerNote ? `<h3 id="project_tagline2">${escapeHtml(headerNote)}</h3>` : ''}
    </header>
  </div>
  <div class="content-inner">
    <main class="content">
${bodyHtml}
      <div class="footer-meta">
        ${copyright ? `<p>${escapeHtml(copyright)}</p>` : ''}
        ${license ? `<p>${licenseHtml}</p>` : ''}
        <p>Version: ${escapeHtml(version)}</p>
      </div>
    </main>
  </div>
</body>
</html>
`;

const outPath = path.join(frontendRoot, 'public', 'about.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (version ${version})`);
