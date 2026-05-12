// api/thomann.js — Récupère og:image + existence d'une fiche Thomann
// Appelé par le Rabah Market côté client
const https = require('https');

function fetchHTML(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (!redirects) return reject(new Error('Too many redirects'));
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Accept-Encoding': 'identity',
      }
    }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const loc = res.headers.location;
        if (!loc) return reject(new Error('Redirect without location'));
        const next = loc.startsWith('http') ? loc : 'https://www.thomann.fr' + loc;
        return fetchHTML(next, redirects - 1).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, html: Buffer.concat(chunks).toString('utf8') }));
    });
    req.setTimeout(9000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Cache CDN 24h
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');

  const { url } = req.query;
  if (!url || !url.includes('thomann')) {
    return res.status(400).json({ ok: false, error: 'url invalide' });
  }

  try {
    const { status, html } = await fetchHTML(url);

    // Produit introuvable si Thomann renvoie une page d'erreur / redirection recherche
    const notFound =
      status !== 200 ||
      html.includes('class="no-result"') ||
      html.includes('id="no-result"') ||
      html.includes('Aucun résultat') ||
      html.includes('page-not-found') ||
      html.includes('search?') ||        // redirigé vers la recherche
      html.length < 5000;                // page trop courte = erreur

    // og:image
    const imgMatch = html.match(/property="og:image"\s+content="([^"]+)"/) ||
                     html.match(/content="([^"]+)"\s+property="og:image"/);
    const imageUrl = imgMatch ? imgMatch[1].replace(/&amp;/g, '&') : null;

    // og:title pour vérification
    const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/) ||
                       html.match(/content="([^"]+)"\s+property="og:title"/);
    const title = titleMatch ? titleMatch[1] : null;

    // Prix (si présent dans la page pour debug)
    const priceMatch = html.match(/"price":"?([0-9]+\.?[0-9]*)"?/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : null;

    res.json({ ok: !notFound, imageUrl, title, price, status });
  } catch (e) {
    res.json({ ok: false, imageUrl: null, error: e.message });
  }
};
