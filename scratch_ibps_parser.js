process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const crypto = require('crypto');

async function testParseIBPS() {
  const url = 'https://www.ibps.in/';
  console.log('Fetching IBPS:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  const html = await res.text();
  console.log('HTTP Status:', res.status);

  // Match all links
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  const rawItems = [];
  const seenUrls = new Set();

  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1].trim();
    let text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Filter out generic navigation links
    if (!text || text.length < 15) continue;
    if (text.includes('Copyright') || text.includes('HOME RECRUITMENT EXAMS') || text.includes('Organisational Structure')) continue;
    if (seenUrls.has(href)) continue;
    seenUrls.add(href);

    if (text.toLowerCase().includes('recruitment') || text.toLowerCase().includes('registration') || text.toLowerCase().includes('crp') || href.includes('ibpsreg.ibps.in') || href.includes('.pdf')) {
      rawItems.push({ text, href });
    }
  }

  console.log(`Extracted ${rawItems.length} raw IBPS recruitment links.`);

  const normalizedJobs = [];
  for (const item of rawItems) {
    const title = item.text;
    const url = item.href;

    // Detect Organization
    let organization = 'Institute of Banking Personnel Selection (IBPS)';
    if (title.includes('AAI')) organization = 'Airports Authority of India (AAI)';
    else if (title.includes('AIIMS')) organization = 'All India Institute of Medical Sciences (AIIMS)';
    else if (title.includes('IOB')) organization = 'Indian Overseas Bank (IOB)';
    else if (title.includes('SBI')) organization = 'State Bank of India (SBI)';
    else if (title.includes('PNB')) organization = 'Punjab National Bank (PNB)';
    else if (title.includes('RCF')) organization = 'Rashtriya Chemicals and Fertilizers (RCF)';
    else if (title.includes('RRVUN')) organization = 'Rajasthan Rajya Vidyut Utpadan Nigam (RRVUN)';
    else if (title.includes('BPCL')) organization = 'Bharat Petroleum Corporation Limited (BPCL)';
    else if (title.includes('GPCB')) organization = 'Gujarat Pollution Control Board (GPCB)';

    // Extract Post Name
    let postName = 'Various Posts';
    if (title.includes('Manager')) postName = 'Managers & Executives';
    else if (title.includes('Clerk') || title.includes('Clerical') || title.includes('CSA')) postName = 'Clerk / Customer Service Associate';
    else if (title.includes('PO') || title.includes('Management Trainees')) postName = 'Probationary Officer / Management Trainee';
    else if (title.includes('Local Bank Officer')) postName = 'Local Bank Officer';
    else if (title.includes('Junior Associates')) postName = 'Junior Associates (Customer Support & Sales)';
    else if (title.includes('Specialist Officers')) postName = 'Specialist Officer (SO)';

    // Extract Date if present in title
    let appStartDate = new Date();
    const dateMatch = title.match(/From\s+(\d{1,2}-[A-Za-z]{3}-\d{4})/i);
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        appStartDate = parsedDate;
      }
    }

    // Set Application Last Date default (30 days from start date)
    const appLastDate = new Date(appStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create unique sourceId
    const sourceId = 'ibps-' + crypto.createHash('md5').update(title + url).digest('hex').slice(0, 12);

    const isPdf = url.endsWith('.pdf');
    const job = {
      source: 'IBPS',
      sourceId,
      organization,
      title,
      postName,
      description: `Official Central Govt / PSU recruitment notification published by IBPS for ${organization}. Post: ${postName}.`,
      qualification: title.includes('Officer') || title.includes('PO') || title.includes('Manager') ? 'Graduate / Bachelor Degree in relevant field' : 'Graduate / 10+2 / Diploma depending on post',
      vacancies: 100, // standard placeholder for open drive
      category: 'Central Government / PSU / Banking',
      state: 'All India',
      applicationStartDate: appStartDate,
      applicationLastDate: appLastDate,
      status: 'APPLICATION_OPEN',
      notificationUrl: isPdf ? url : 'https://www.ibps.in/wp-content/uploads/Notification_CRP_CSA_XVI-Final.pdf',
      applicationUrl: !isPdf ? url : 'https://www.ibps.in/',
      publishedAt: appStartDate,
      rawSourceData: item
    };

    normalizedJobs.push(job);
  }

  console.log(`\nNormalized ${normalizedJobs.length} IBPS jobs. Sample Job 1:`);
  console.log(JSON.stringify(normalizedJobs[0], null, 2));
}

testParseIBPS().catch(console.error);
