const https = require('https');
const fs = require('fs');

const folderId = '1ydgQ_sD2t9l9WBZ92mrnoKJUCK51nI3u';
const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Parse each entry item block
    const entryRegex = /id="entry-([^"]+)"[\s\S]*?class="flip-entry-title">([^<]+)<\/div>/g;
    const logos = {};
    let m;
    while ((m = entryRegex.exec(data)) !== null) {
      const id = m[1];
      const title = m[2].trim();
      logos[title] = id;
    }
    console.log('Parsed Logos Map:', logos);
    fs.writeFileSync('scripts/drive_logos.json', JSON.stringify(logos, null, 2));
  });
});
