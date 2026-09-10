const https = require('https');
const fs = require('fs');

const url = 'https://drive.google.com/drive/u/0/folders/1ydgQ_sD2t9l9WBZ92mrnoKJUCK51nI3u';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find substrings that match club names or image extensions
    const matches = data.match(/[^"\\\[\],]{3,40}\.(?:png|jpg|jpeg|svg|webp|pdf)/gi) || [];
    console.log('Matches with extension:', [...new Set(matches)]);
    
    // Also look for club codes like ITSC, SRC, RESUP, etc.
    const clubs = ['ITSC', 'SRC', 'DEVER', 'RESUP', 'FIC', 'TSS', 'MIRAI', 'FKC', 'FUCC', 'FCS', 'FUM', 'EVo', 'F2K', 'FENIOUS', 'FUFC', 'FHG', 'FUB', 'FDN', 'VCT', 'FVC', 'TIA', 'RHYTHM', 'MIC', 'DfP', 'Noise'];
    const foundClubs = {};
    for (const c of clubs) {
      const idx = data.indexOf(c);
      if (idx !== -1) {
        foundClubs[c] = data.substring(idx - 50, idx + 150);
      }
    }
    console.log('Found clubs snippets:', Object.keys(foundClubs));
    fs.writeFileSync('scripts/drive_sample.txt', data.slice(0, 100000));
  });
});
