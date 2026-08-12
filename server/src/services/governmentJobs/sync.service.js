const GovernmentOpportunity = require("../../models/GovernmentOpportunity");
const upscProvider = require("./providers/upsc.provider");
const sscProvider = require("./providers/ssc.provider");
const rrbProvider = require("./providers/rrb.provider");
const ibpsProvider = require("./providers/ibps.provider");
const ntaProvider = require("./providers/nta.provider");

class GovernmentJobSyncService {
  constructor() {
    this.providers = [
      upscProvider,
      sscProvider,
      rrbProvider,
      ibpsProvider,
      ntaProvider,
    ];
  }

  async sync() {
    console.log("\n========================================");
    console.log("Government Job Synchronization Started");
    console.log("========================================\n");

    const report = {
      startTime: new Date(),
      sources: {},
      totalFetched: 0,
      totalValid: 0,
      totalNew: 0,
      totalUpdated: 0,
      totalFailed: 0,
    };

    for (const provider of this.providers) {
      report.sources[provider.name] = {
        fetched: 0,
        parsed: 0,
        valid: 0,
        new: 0,
        updated: 0,
        skipped: 0,
        error: null,
      };

      try {
        console.log(`[Provider: ${provider.name}] Starting fetch & parse...`);
        const { fetched, parsed, validJobs } = await provider.getJobs();
        
        report.sources[provider.name].fetched = fetched;
        report.sources[provider.name].parsed = parsed;
        report.sources[provider.name].valid = validJobs.length;

        report.totalFetched += fetched;
        report.totalValid += validJobs.length;

        let providerNew = 0;
        let providerUpdated = 0;

        for (const job of validJobs) {
          const result = await GovernmentOpportunity.updateOne(
            { source: job.source, sourceId: job.sourceId },
            { $set: job },
            { upsert: true }
          );

          if (result.upsertedCount > 0) {
            providerNew++;
            report.totalNew++;
          } else if (result.modifiedCount > 0) {
            providerUpdated++;
            report.totalUpdated++;
          } else {
            report.sources[provider.name].skipped++;
          }
        }

        report.sources[provider.name].new = providerNew;
        report.sources[provider.name].updated = providerUpdated;

        console.log(`[Provider: ${provider.name}] Completed. Fetched: ${fetched}, Valid: ${validJobs.length}, New: ${providerNew}, Updated: ${providerUpdated}`);
      } catch (err) {
        console.error(`[Provider: ${provider.name}] Error/Unavailable: ${err.message}`);
        report.sources[provider.name].error = err.message;
        report.totalFailed++;
      }
    }

    report.endTime = new Date();

    console.log("\n========================================");
    console.log("Synchronization Summary");
    console.log(`Total Fetched: ${report.totalFetched}`);
    console.log(`Total Valid:   ${report.totalValid}`);
    console.log(`New Inserted:  ${report.totalNew}`);
    console.log(`Updated:       ${report.totalUpdated}`);
    console.log("========================================\n");
    
    // Recalculate statuses for existing jobs
    const allJobs = await GovernmentOpportunity.find({ status: { $ne: "CLOSED" } });
    for (const job of allJobs) {
      await job.save();
    }

    return report;
  }
}

module.exports = new GovernmentJobSyncService();

