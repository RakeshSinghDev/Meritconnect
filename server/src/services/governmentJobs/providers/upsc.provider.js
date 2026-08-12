const BaseProvider = require("./base.provider");

class UpscProvider extends BaseProvider {
  constructor() {
    super("UPSC");
  }

  async fetch() {
    // Cannot safely scrape without bot protection violations right now.
    // Future: Use RSS feed or official API.
    throw new Error("No public API available for UPSC. Future implementation required.");
  }
}

module.exports = new UpscProvider();
