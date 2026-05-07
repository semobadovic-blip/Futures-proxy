const express = require('express');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 8080;
app.use((req, res, next) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Cache-Control', 'public, max-age=300');
next();
});
function fetchJSON(url) {
return new Promise((resolve, reject) => {
https.get(url, {headers: {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36','Accept': 'application/json','Referer': 'https://www.forexfactory.com/'}}, (res) => {
let data = '';
res.on('data', chunk => data += chunk);
res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); }});
}).on('error', reject);
});
}
app.get('/calendar', async (req, res) => {
try {
const [a, b] = await Promise.allSettled([fetchJSON('https://nfs.faireconomy.media/ff_calendar_thisweek.json'),fetchJSON('https://nfs.faireconomy.media/ff_calendar_nextweek.json')]);
const data = [...(a.status==='fulfilled'?a.value:[]), ...(b.status==='fulfilled'?b.value:[])];
if (!data.length) return res.status(502).json({error:'Keine Daten'});
res.json(data);
} catch(err) { res.status(502).json({error: err.message}); }
});
app.get('/', (req, res) => res.json({status:'ok'}));
app.listen(PORT, '0.0.0.0', () => console.log('Port: ' + PORT));
