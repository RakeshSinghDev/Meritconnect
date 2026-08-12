const BaseProvider = require("./base.provider");

class Provider extends BaseProvider {
  constructor() {
    super("RRB");
  }

  async fetch() {
    throw new Error("No public API available for RRB. Future implementation required.");
  }
}

module.exports = new Provider();
