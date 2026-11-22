const https = require('https');

https.get('https://nifas-silk-lafto-anti-corruption.onrender.com/api/reports', (res) => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(b);
      console.log('Total reports:', json.data.length);
      json.data.forEach((r, i) => {
        const issues = [];
        if (!r.id) issues.push('missing id');
        if (!r.office) issues.push('missing office: ' + r.office);
        if (!r.type) issues.push('missing type: ' + r.type);
        if (!r.description) issues.push('missing description');
        if (!r.location) issues.push('missing location');
        if (!r.createdAt) issues.push('missing createdAt');
        if (issues.length > 0) {
          console.log(`Report #${i} (${r.id}):`, issues.join(', '));
        }
      });
      console.log('Check complete.');
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
});
