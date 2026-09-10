const fs = require('fs');
const content = fs.readFileSync('C:/Users/This PC/.gemini/antigravity-cli/brain/bb1503fc-239b-48f1-b1c4-66a29f2ee681/.system_generated/steps/457/content.md', 'utf8');

// Parse HTML table rows <tr>...</tr>
const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
const rows = [];
let trMatch;
while ((trMatch = trRegex.exec(content)) !== null) {
  const rowHtml = trMatch[1];
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const cells = [];
  let tdMatch;
  while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
    const cellHtml = tdMatch[1];
    // Find link if present
    const linkMatch = /href=["']([^"']+)["'][^>]*>(.*?)<\/a>/i.exec(cellHtml);
    const linkUrl = linkMatch ? decodeURIComponent(linkMatch[1].replace(/&amp;/g, '&')).replace(/^https:\/\/www\.google\.com\/url\?q=/, '').split('&sa=')[0] : null;
    const cleanText = cellHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    cells.push({ text: cleanText, link: linkUrl });
  }
  if (cells.length > 3) {
    rows.push(cells);
  }
}

console.log('Total parsed rows:', rows.length);

// Map rows to clubs
const clubBackdrops = [];
rows.forEach((r, idx) => {
  // Look for club prefixes
  const textRow = r.map(c => c.text).join(' | ');
  // Check if cell has backdrop link
  r.forEach(c => {
    if (c.link && (c.text.toLowerCase().includes('backdrop') || c.link.includes('drive.google.com'))) {
      clubBackdrops.push({ rowIdx: idx, text: c.text, link: c.link, rowSample: textRow.slice(0, 100) });
    }
  });
});

console.log('Found backdrop rows:', clubBackdrops.length);
fs.writeFileSync('scripts/mapped_club_backdrops.json', JSON.stringify(clubBackdrops, null, 2));
console.log(JSON.stringify(clubBackdrops.slice(0, 10), null, 2));
