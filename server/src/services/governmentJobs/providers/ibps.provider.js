const BaseProvider = require("./base.provider");
const crypto = require("crypto");

class IbpsProvider extends BaseProvider {
  constructor() {
    super("IBPS");
    this.baseUrl = "https://www.ibps.in/";
  }

  async fetch() {
    const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    try {
      const res = await fetch(this.baseUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} when fetching IBPS home page`);
      }

      const html = await res.text();
      return html;
    } finally {
      if (prevTls !== undefined) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls;
      } else {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      }
    }
  }

  parse(html) {
    if (!html) return [];
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    const rawItems = [];
    const seenUrls = new Set();

    while ((m = linkRegex.exec(html)) !== null) {
      const href = m[1].trim();
      let text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      if (!text || text.length < 15) continue;
      if (
        text.includes("Copyright") ||
        text.includes("HOME RECRUITMENT EXAMS") ||
        text.includes("Organisational Structure")
      ) {
        continue;
      }
      if (seenUrls.has(href)) continue;
      seenUrls.add(href);

      const lowerText = text.toLowerCase();
      if (
        lowerText.includes("recruitment") ||
        lowerText.includes("registration") ||
        lowerText.includes("crp") ||
        href.includes("ibpsreg.ibps.in") ||
        href.includes(".pdf")
      ) {
        rawItems.push({ text, href });
      }
    }

    return rawItems;
  }

  normalize(parsedJob) {
    const title = parsedJob.text;
    const url = parsedJob.href;

    let organization = "Institute of Banking Personnel Selection (IBPS)";
    if (title.includes("AAI")) organization = "Airports Authority of India (AAI)";
    else if (title.includes("AIIMS"))
      organization = "All India Institute of Medical Sciences (AIIMS)";
    else if (title.includes("IOB")) organization = "Indian Overseas Bank (IOB)";
    else if (title.includes("SBI")) organization = "State Bank of India (SBI)";
    else if (title.includes("PNB")) organization = "Punjab National Bank (PNB)";
    else if (title.includes("RCF"))
      organization = "Rashtriya Chemicals and Fertilizers (RCF)";
    else if (title.includes("RRVUN"))
      organization = "Rajasthan Rajya Vidyut Utpadan Nigam (RRVUN)";
    else if (title.includes("BPCL"))
      organization = "Bharat Petroleum Corporation Limited (BPCL)";
    else if (title.includes("GPCB"))
      organization = "Gujarat Pollution Control Board (GPCB)";

    let postName = "Various Posts";
    if (title.includes("Manager")) postName = "Managers & Executives";
    else if (
      title.includes("Clerk") ||
      title.includes("Clerical") ||
      title.includes("CSA")
    )
      postName = "Clerk / Customer Service Associate";
    else if (title.includes("PO") || title.includes("Management Trainees"))
      postName = "Probationary Officer / Management Trainee";
    else if (title.includes("Local Bank Officer"))
      postName = "Local Bank Officer";
    else if (title.includes("Junior Associates"))
      postName = "Junior Associates (Customer Support & Sales)";
    else if (title.includes("Specialist Officers"))
      postName = "Specialist Officer (SO)";

    let appStartDate = new Date();
    const dateMatch = title.match(/From\s+(\d{1,2}-[A-Za-z]{3}-\d{4})/i);
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        appStartDate = parsedDate;
      }
    }

    const appLastDate = new Date(
      appStartDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const sourceId =
      "ibps-" +
      crypto
        .createHash("md5")
        .update(title + url)
        .digest("hex")
        .slice(0, 12);

    const isPdf = url.endsWith(".pdf");

    return {
      source: "IBPS",
      sourceId,
      externalId: sourceId,
      organization,
      title,
      postName,
      description: `Official Central Govt / PSU recruitment notification published by IBPS for ${organization}. Post: ${postName}.`,
      qualification:
        title.includes("Officer") ||
        title.includes("PO") ||
        title.includes("Manager")
          ? "Graduate / Bachelor Degree in relevant field"
          : "Graduate / 10+2 / Diploma depending on post",
      vacancies: 100,
      category: "Central Government / PSU / Banking",
      state: "All India",
      applicationStartDate: appStartDate,
      applicationLastDate: appLastDate,
      status: "APPLICATION_OPEN",
      notificationUrl: isPdf
        ? url
        : "https://www.ibps.in/wp-content/uploads/Notification_CRP_CSA_XVI-Final.pdf",
      applicationUrl: !isPdf ? url : "https://www.ibps.in/",
      publishedAt: appStartDate,
      rawSourceData: parsedJob,
    };
  }
}

module.exports = new IbpsProvider();

