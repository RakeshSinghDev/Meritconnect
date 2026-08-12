const BaseProvider = require("./base.provider");

class Provider extends BaseProvider {
  constructor() {
    super("NTA");
  }

  async fetch() {
    throw new Error("No public API available for NTA. Future implementation required.");
  }
}

module.exports = new Provider();
