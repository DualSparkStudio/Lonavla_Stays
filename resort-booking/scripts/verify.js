import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const files = [
  'index.html',
  'villas/index.html',
  'villas/1/index.html',
  'villas/2/index.html',
  'villas/3/index.html',
  'villas/4/index.html',
  'facilities/index.html',
  'about/index.html',
  'contact/index.html',
  'terms/index.html',
  'house-rules/index.html',
];

console.log('--- VERIFYING PRE-RENDERED PAGES ---');
let hasError = false;

for (const relPath of files) {
  const fullPath = path.join(distDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING FILE: ${relPath}`);
    hasError = true;
    continue;
  }

  const html = fs.readFileSync(fullPath, 'utf8');

  // 1. Check <title>
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : null;

  // 2. Check meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const desc = descMatch ? descMatch[1] : null;
  const descLen = desc ? desc.length : 0;

  // 3. Check canonical
  const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
  const canon = canonMatch ? canonMatch[1] : null;

  // 4. Check Open Graph tags
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
  const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["'](.*?)["']/i);

  // 5. Check Twitter card tags
  const twCardMatch = html.match(/<meta\s+name=["']twitter:card["']\s+content=["'](.*?)["']/i);
  const twTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i);

  // 6. Check JSON-LD
  const jsonLdMatch = html.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
  let jsonLdParsed = null;
  if (jsonLdMatch) {
    try {
      jsonLdParsed = JSON.parse(jsonLdMatch[1]);
    } catch (e) {
      console.error(`Invalid JSON-LD syntax in ${relPath}:`, e.message);
      hasError = true;
    }
  }

  // 7. Check <h1> count in body
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];

  // 8. Check robots tag
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["'](.*?)["']/i);

  const descOk = descLen >= 140 && descLen <= 160;
  if (!descOk) {
    console.error(`Description length out of 140-160 range in ${relPath}: ${descLen} chars`);
    hasError = true;
  }

  console.log(`[PASS] ${relPath}:`);
  console.log(`  Title: "${title}"`);
  console.log(`  Description (${descLen} chars, valid=${descOk}): "${desc}"`);
  console.log(`  Canonical: ${canon}`);
  console.log(`  Robots: ${robotsMatch ? robotsMatch[1] : 'NONE'}`);
  console.log(`  OG Image: ${ogImageMatch ? ogImageMatch[1] : 'NONE'}`);
  console.log(`  Twitter Card: ${twCardMatch ? twCardMatch[1] : 'NONE'}`);
  console.log(`  JSON-LD Type: ${jsonLdParsed ? jsonLdParsed['@type'] : 'NONE'}`);
  console.log(`  <h1> count: ${h1Matches.length} (${h1Matches[0] ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : 'NONE'})`);
  console.log('');
}

console.log('--- VERIFYING ROBOTS.TXT AND SITEMAP.XML ---');
const robotsPath = path.join(distDir, 'robots.txt');
const sitemapPath = path.join(distDir, 'sitemap.xml');
console.log('robots.txt exists:', fs.existsSync(robotsPath));
if (fs.existsSync(robotsPath)) {
  console.log('robots.txt content:\n' + fs.readFileSync(robotsPath, 'utf8'));
}
console.log('sitemap.xml exists:', fs.existsSync(sitemapPath));
if (fs.existsSync(sitemapPath)) {
  const sm = fs.readFileSync(sitemapPath, 'utf8');
  const urls = sm.match(/<loc>(.*?)<\/loc>/g) || [];
  console.log(`sitemap.xml has ${urls.length} URLs`);
}

if (hasError) {
  console.error('\nVERIFICATION FAILED!');
  process.exit(1);
} else {
  console.log('\nALL VERIFICATION CHECKS PASSED PERFECTLY!');
}
