const GovernmentOpportunity = require("../models/GovernmentOpportunity");
const ApiError = require("../utils/apiError");
const eligibilityService = require("./governmentJobs/eligibility.service");

class GovernmentOpportunityService {
  /**
   * Get all government opportunities with optional filtering and pagination
   */
  async getAllOpportunities(query = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      organization,
      state,
      qualification
    } = query;

    const filter = {};
    if (status) filter.status = status;
    if (organization) filter.organization = new RegExp(organization, "i");
    if (state) filter.state = new RegExp(state, "i");
    if (qualification) filter.qualification = new RegExp(qualification, "i");

    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const opportunities = await GovernmentOpportunity.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GovernmentOpportunity.countDocuments(filter);

    return {
      opportunities,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single government opportunity by ID
   */
  async getOpportunityById(id) {
    const opportunity = await GovernmentOpportunity.findById(id);
    if (!opportunity) {
      throw new ApiError(404, "Government opportunity not found");
    }
    return opportunity;
  }
  
  /**
   * Get latest government opportunities
   */
  async getLatest() {
    return await GovernmentOpportunity.find({ status: { $in: ["NEW", "APPLICATION_OPEN", "UPCOMING"] } })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(10);
  }

  /**
   * Get opportunities closing soon
   */
  async getClosingSoon() {
    return await GovernmentOpportunity.find({
      status: "CLOSING_SOON"
    })
      .sort({ applicationLastDate: 1 })
      .limit(10);
  }

  /**
   * Get recommended jobs based on eligibility
   */
  async getRecommended(userProfile) {
    // Only search open or closing soon jobs
    const activeJobs = await GovernmentOpportunity.find({
      status: { $in: ["NEW", "APPLICATION_OPEN", "CLOSING_SOON"] }
    });

    const evaluatedJobs = activeJobs.map(job => {
      const eligibility = eligibilityService.evaluateEligibility(userProfile, job);
      return {
        ...job.toObject(),
        eligibilityLabel: eligibility.label,
        matchPercentage: eligibility.matchPercentage,
        isMatch: eligibility.isMatch,
        reasons: eligibility.reasons
      };
    });

    // Sort by match percentage (desc), then applicationLastDate (asc)
    evaluatedJobs.sort((a, b) => {
      const matchA = a.matchPercentage || 0;
      const matchB = b.matchPercentage || 0;
      if (matchA !== matchB) return matchB - matchA;
      
      const dateA = a.applicationLastDate ? new Date(a.applicationLastDate).getTime() : Infinity;
      const dateB = b.applicationLastDate ? new Date(b.applicationLastDate).getTime() : Infinity;
      return dateA - dateB;
    });

    // Return top 20 recommendations
    return evaluatedJobs.slice(0, 20);
  }

  /**
   * Trigger the synchronization engine
   */
  async syncGovernmentJobs() {
    const syncService = require("./governmentJobs/sync.service");
    return await syncService.sync();
  }
}

module.exports = new GovernmentOpportunityService();
