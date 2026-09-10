const https = require('https');

// Test if public API or web endpoint lists files for folder
const folderId = '1ydgQ_sD2t9l9WBZ92mrnoKJUCK51nI3u';
const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('embeddedfolderview status:', res.statusCode, 'len:', data.length);
    const idMatches = [...data.matchAll(/id="entry-([^"]+)"/g)].map(m => m[1]);
    console.log('Entries found in embedded view:', idMatches);
    const titleMatches = [...data.matchAll(/class="flip-entry-title">([^<]+)<\/div>/g)].map(m => m[1]);
    console.log('Titles found:', titleMatches);
    // Any drive file links:
    const driveLinks = [...data.matchAll(/href="https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view"/g)].map(m => m[1]);
    console.log('Drive file links:', driveLinks);
  });
});
