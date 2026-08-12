process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testUrl(name, url) {
  console.log(`\n-----------------------------------------`);
  console.log(`Testing ${name}: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    console.log(`Status: ${res.status} | Content-Type: ${res.headers.get('content-type')}`);
    const body = await res.text();
    console.log(`Length: ${body.length}`);
    
    // Check if body has table / list / items
    const links = [];
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = linkRegex.exec(body)) !== null) {
      const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const href = m[1];
      if (text.length > 10 && !text.includes('Read More') && !text.includes('Skip to') && !text.includes('JavaScript')) {
        links.push({ text, href });
      }
    }
    console.log(`Extracted ${links.length} links.`);
    if (links.length > 0) {
      console.log('Sample 3:', links.slice(0, 3));
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function run() {
  await testUrl('UPSC Online', 'https://upsconline.nic.in/');
  await testUrl('RRB Chandigarh', 'https://www.rrbcdg.gov.in/');
  await testUrl('IBPS Home', 'https://www.ibps.in/');
  await testUrl('SSC Govt', 'https://ssc.gov.in/');
  await testUrl('NCS Portal', 'https://www.ncs.gov.in/');
}

run();
