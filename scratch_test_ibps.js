process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testIBPS() {
  const url = 'https://www.ibps.in/';
  console.log('Fetching IBPS:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  console.log('Status:', res.status, 'HTML length:', html.length);
  
  // Find all marquee or ticker or notice links
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  const notices = [];
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.toLowerCase().includes('crp') || text.toLowerCase().includes('recruitment') || text.toLowerCase().includes('apply') || text.toLowerCase().includes('officer') || text.toLowerCase().includes('clerk') || text.toLowerCase().includes('notification') || text.toLowerCase().includes('online application') || text.toLowerCase().includes('click here')) {
      notices.push({ text, href });
    }
  }
  console.log(`Found ${notices.length} relevant IBPS links:`);
  notices.forEach((n, i) => console.log(`[${i+1}] ${n.text} -> ${n.href}`));
}

testIBPS().catch(console.error);
