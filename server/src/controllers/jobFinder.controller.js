const asyncHandler = require("../middleware/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const JobSearchPreference = require("../models/JobSearchPreference");
const JobRecommendation = require("../models/JobRecommendation");
const JobSearchRun = require("../models/JobSearchRun");
const User = require("../models/User");
const pipelineService = require("../services/jobFinder/pipeline.service");
const applicationKitService = require("../services/jobFinder/applicationKit.service");
const matcherService = require("../services/jobFinder/matcher.service");

exports.getPreferences = asyncHandler(async (req, res) => {
    let preferences = await JobSearchPreference.findOne({ candidate: req.user._id });
    
    if (!preferences) {
        preferences = {
            candidate: req.user._id,
            targetTitles: [],
            locations: [],
            allowRemote: true,
            employmentTypes: [],
            experienceMin: 0,
            experienceMax: 0,
            excludedTitles: [],
            enabled: true
        };
    }
    
    res.status(200).json(new ApiResponse(200, "Preferences fetched successfully", preferences));
});

exports.updatePreferences = asyncHandler(async (req, res) => {
    const { targetTitles, locations } = req.body;
    
    if (!targetTitles && !locations) {
        throw new ApiError(400, "At least targetTitles or locations must be provided");
    }

    const preferences = await JobSearchPreference.findOneAndUpdate(
        { candidate: req.user._id },
        { $set: req.body },
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(new ApiResponse(200, "Preferences updated successfully", preferences));
});

exports.runSearch = asyncHandler(async (req, res) => {
    const result = await pipelineService.runJobSearchPipeline(req.user._id);
    res.status(200).json(new ApiResponse(200, "Search completed successfully", result));
});

exports.getRecommendations = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { 
        candidate: req.user._id, 
        status: { $ne: 'DISMISSED' } 
    };

    const recommendations = await JobRecommendation.find(query)
        .populate('externalJob')
        .sort({ matchScore: -1 })
        .skip(skip)
        .limit(limit);

    const total = await JobRecommendation.countDocuments(query);

    res.status(200).json(new ApiResponse(200, "Recommendations fetched successfully", {
        recommendations,
        total,
        page,
        limit
    }));
});

exports.getRecommendationById = asyncHandler(async (req, res) => {
    const recommendation = await JobRecommendation.findOne({
        _id: req.params.id,
        candidate: req.user._id
    }).populate('externalJob');

    if (!recommendation) {
        throw new ApiError(404, "Recommendation not found");
    }

    res.status(200).json(new ApiResponse(200, "Recommendation fetched successfully", recommendation));
});

exports.generateApplicationKit = asyncHandler(async (req, res) => {
    const recommendation = await JobRecommendation.findOne({
        _id: req.params.id,
        candidate: req.user._id
    }).populate('externalJob');

    if (!recommendation) {
        throw new ApiError(404, "Recommendation not found");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const candidateProfile = await matcherService.buildCandidateProfile(user);
    
    const matchResult = {
        score: recommendation.matchScore,
        matchingSkills: recommendation.matchingSkills,
        missingSkills: recommendation.missingSkills,
        reasons: recommendation.reasons
    };

    const kitData = await applicationKitService.generateApplicationKit(
        recommendation.externalJob, 
        candidateProfile, 
        matchResult
    );

    recommendation.aiSummary = kitData.whyFits || recommendation.aiSummary;
    recommendation.evidence = kitData.resumeEmphasis || recommendation.evidence;
    recommendation.concerns = kitData.potentialGaps || recommendation.concerns;
    recommendation.coverLetter = kitData.coverNote || "";
    recommendation.applicationAnswers = kitData.applicationAnswers || [];
    recommendation.kitGeneratedAt = new Date();
    
    await recommendation.save();

    res.status(200).json(new ApiResponse(200, "Application kit generated successfully", recommendation));
});

exports.updateRecommendationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    const validStatuses = ['NEW', 'VIEWED', 'SAVED', 'APPLYING', 'APPLIED', 'DISMISSED'];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const recommendation = await JobRecommendation.findOneAndUpdate(
        { _id: req.params.id, candidate: req.user._id },
        { status },
        { new: true }
    );

    if (!recommendation) {
        throw new ApiError(404, "Recommendation not found");
    }

    res.status(200).json(new ApiResponse(200, "Status updated successfully", recommendation));
});

exports.getSearchHistory = asyncHandler(async (req, res) => {
    const history = await JobSearchRun.find({ candidate: req.user._id })
        .sort({ startedAt: -1 })
        .limit(20);

    res.status(200).json(new ApiResponse(200, "Search history fetched successfully", history));
});

exports.resetSeenJobs = asyncHandler(async (req, res) => {
    const candidateId = req.user._id;

    // Delete this candidate's recommendations (which track "seen" jobs)
    const { deletedCount: recCount } = await JobRecommendation.deleteMany({ candidate: candidateId });
    
    // Delete this candidate's search run history
    const { deletedCount: runCount } = await JobSearchRun.deleteMany({ candidate: candidateId });

    console.log(`[JobFinder] Reset seen jobs for candidate ${candidateId}: ${recCount} recommendations, ${runCount} runs deleted`);

    res.status(200).json(new ApiResponse(200, "Seen jobs reset successfully", {
        recommendationsDeleted: recCount,
        runsDeleted: runCount
    }));
});
