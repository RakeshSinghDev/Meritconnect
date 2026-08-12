class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Fetches raw jobs from the official source.
   * Should throw an error if the source is unavailable or protected.
   * @returns {Promise<any>} Raw payload
   */
  async fetch() {
    throw new Error(`fetch() not implemented for provider ${this.name}`);
  }

  /**
   * Parses raw HTML/XML/JSON into an intermediate format if necessary.
   * @param {any} rawData 
   * @returns {Array} Parsed objects
   */
  parse(rawData) {
    return rawData;
  }

  /**
   * Normalizes parsed data into the GovernmentOpportunity schema format.
   * @param {Object} parsedJob 
   * @returns {Object} Normalized job object
   */
  normalize(parsedJob) {
    throw new Error(`normalize() not implemented for provider ${this.name}`);
  }

  /**
   * Validates a normalized job object before saving.
   * @param {Object} normalizedJob 
   * @returns {boolean} True if valid
   */
  validate(normalizedJob) {
    if (!normalizedJob.title) return false;
    if (!normalizedJob.organization) return false;
    if (!normalizedJob.source || !normalizedJob.sourceId) return false;
    
    // Ensure at least one URL exists
    if (!normalizedJob.notificationUrl && !normalizedJob.applicationUrl) return false;
    
    return true;
  }

  /**
   * Executes the full pipeline for this provider.
   * @returns {Promise<Object>} Object containing counts and valid jobs
   */
  async getJobs() {
    const rawData = await this.fetch();
    const parsedJobs = this.parse(rawData);
    
    const validJobs = [];
    const parsedArray = Array.isArray(parsedJobs) ? parsedJobs : [];

    for (const job of parsedArray) {
      try {
        const normalized = this.normalize(job);
        if (this.validate(normalized)) {
          validJobs.push(normalized);
        }
      } catch (err) {
        console.error(`[${this.name}] Error normalizing job:`, err.message);
      }
    }
    
    return {
      fetched: parsedArray.length,
      parsed: parsedArray.length,
      validJobs
    };
  }
}

module.exports = BaseProvider;

