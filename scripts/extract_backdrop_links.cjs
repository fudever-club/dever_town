const fs = require('fs');
const content = fs.readFileSync('C:/Users/This PC/.gemini/antigravity-cli/brain/bb1503fc-239b-48f1-b1c4-66a29f2ee681/.system_generated/steps/457/content.md', 'utf8');
const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
let m;
const links = [];
while ((m = regex.exec(content)) !== null) {
  const text = m[2].replace(/<[^>]*>/g, '').trim();
  const href = m[1];
  if (text.toLowerCase().includes('backdrop') || text.toLowerCase().includes('check')) {
    links.push({ text, href });
  }
}
console.log('Total backdrop/checkin links:', links.length);
fs.writeFileSync('scripts/backdrop_links.json', JSON.stringify(links, null, 2));
console.log(JSON.stringify(links.slice(0, 15), null, 2));
