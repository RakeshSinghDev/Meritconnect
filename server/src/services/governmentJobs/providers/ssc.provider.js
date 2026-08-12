const BaseProvider = require("./base.provider");

class Provider extends BaseProvider {
  constructor() {
    super("SSC");
  }

  async fetch() {
    throw new Error("No public API available for SSC. Future implementation required.");
  }
}

module.exports = new Provider();
