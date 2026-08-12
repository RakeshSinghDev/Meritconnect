const governmentOpportunityService = require("../services/governmentOpportunity.service");
const asyncHandler = require("../middleware/asyncHandler");

exports.getAllOpportunities = asyncHandler(async (req, res) => {
  const result = await governmentOpportunityService.getAllOpportunities(req.query);

  res.status(200).json({
    success: true,
    data: {
      jobs: result.opportunities,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      }
    }
  });
});

exports.getOpportunityById = asyncHandler(async (req, res) => {
  const opportunity = await governmentOpportunityService.getOpportunityById(req.params.id);

  res.status(200).json({
    success: true,
    data: opportunity,
  });
});

exports.getLatest = asyncHandler(async (req, res) => {
  const opportunities = await governmentOpportunityService.getLatest();
  res.status(200).json({
    success: true,
    data: opportunities,
  });
});

exports.getClosingSoon = asyncHandler(async (req, res) => {
  const opportunities = await governmentOpportunityService.getClosingSoon();
  res.status(200).json({
    success: true,
    data: opportunities,
  });
});

exports.getRecommended = asyncHandler(async (req, res) => {
  // Pass the user's profile to the recommendation engine
  // Assuming req.user is populated by the auth middleware
  const opportunities = await governmentOpportunityService.getRecommended(req.user ? req.user.profile : null);
  res.status(200).json({
    success: true,
    data: opportunities,
  });
});

exports.syncGovernmentJobs = asyncHandler(async (req, res) => {
  const result = await governmentOpportunityService.syncGovernmentJobs();
  res.status(200).json({
    success: true,
    data: result,
  });
});

// Admin-only creation endpoint for testing and manual population
exports.createOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await governmentOpportunityService.createOpportunity(req.body);

  res.status(201).json({
    success: true,
    data: opportunity,
  });
});
