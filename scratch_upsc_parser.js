process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testParseUPSC() {
  const url = 'https://upsc.gov.in/whats-new';
  console.log('Fetching UPSC:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  const html = await res.text();
  console.log('HTTP Status:', res.status);

  // Extract all table rows or list items
  const items = [];
  const regex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const trContent = match[1];
    const linkMatch = trContent.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (linkMatch) {
      const href = linkMatch[1].startsWith('http') ? linkMatch[1] : 'https://upsc.gov.in' + linkMatch[1];
      const title = linkMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (title.length > 15) {
        items.push({ title, href });
      }
    }
  }

  console.log(`Extracted ${items.length} UPSC items:`);
  items.slice(0, 10).forEach((it, i) => console.log(`[${i+1}] ${it.title} -> ${it.href}`));
}

testParseUPSC().catch(console.error);
