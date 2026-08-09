const Job = require("../models/Job");
const ApiError = require("../utils/ApiError");

// ==========================================
// Create Job
// ==========================================
const createJob = async (jobData, recruiterId) => {
    const job = await Job.create({
        ...jobData,
        recruiter: recruiterId,
    });

    return job;
};

// ==========================================
// Get All Jobs
// Search + Filters + Sorting + Pagination
// ==========================================
const getAllJobs = async (query) => {
    const {
        keyword,
        company,
        location,
        employmentType,
        experienceLevel,
        minSalary,
        maxSalary,
        sort = "newest",
        page = 1,
        limit = 10,
    } = query;

    const filter = {
        isActive: true,
    };

    // ==========================
    // Keyword Search
    // ==========================
    if (keyword) {
        filter.$or = [
            {
                title: {
                    $regex: keyword,
                    $options: "i",
                },
            },
            {
                company: {
                    $regex: keyword,
                    $options: "i",
                },
            },
            {
                description: {
                    $regex: keyword,
                    $options: "i",
                },
            },
            {
                skills: {
                    $regex: keyword,
                    $options: "i",
                },
            },
        ];
    }

    // ==========================
    // Company Filter
    // ==========================
    if (company) {
        filter.company = {
            $regex: company,
            $options: "i",
        };
    }

    // ==========================
    // Location Filter
    // ==========================
    if (location) {
        filter.location = {
            $regex: location,
            $options: "i",
        };
    }

    // ==========================
    // Employment Type Filter
    // ==========================
    if (employmentType) {
        filter.employmentType = employmentType;
    }

    // ==========================
    // Experience Level Filter
    // ==========================
    if (experienceLevel) {
        filter.experienceLevel = experienceLevel;
    }

    // ==========================
    // Salary Filter
    // ==========================
    if (minSalary || maxSalary) {
        filter.salary = {};

        if (minSalary) {
            filter.salary.$gte = Number(minSalary);
        }

        if (maxSalary) {
            filter.salary.$lte = Number(maxSalary);
        }
    }

    // ==========================
    // Sorting
    // ==========================
    let sortOption = {};

    switch (sort) {
        case "oldest":
            sortOption = { createdAt: 1 };
            break;

        case "salaryHigh":
            sortOption = { salary: -1 };
            break;

        case "salaryLow":
            sortOption = { salary: 1 };
            break;

        case "newest":
        default:
            sortOption = { createdAt: -1 };
    }

    // ==========================
    // Pagination
    // ==========================
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const jobs = await Job.find(filter)
        .populate("recruiter", "name email")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber);

    const totalJobs = await Job.countDocuments(filter);

    return {
        jobs,
        pagination: {
            totalJobs,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalJobs / limitNumber),
            limit: limitNumber,
            hasNextPage:
                pageNumber <
                Math.ceil(totalJobs / limitNumber),
            hasPrevPage: pageNumber > 1,
        },
    };
};

// ==========================================
// Get Job By ID
// ==========================================
const getJobById = async (jobId) => {
    const job = await Job.findById(jobId).populate(
        "recruiter",
        "name email"
    );

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    return job;
};

// ==========================================
// Recruiter's Jobs
// ==========================================
const getRecruiterJobs = async (recruiterId) => {
    return await Job.find({
        recruiter: recruiterId,
    })
        .sort({ createdAt: -1 })
        .populate("recruiter", "name email");
};

// ==========================================
// Update Job
// ==========================================
const updateJob = async (
    jobId,
    recruiterId,
    updateData
) => {
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.recruiter.toString() !== recruiterId.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this job"
        );
    }

    Object.assign(job, updateData);

    await job.save();

    return job;
};

// ==========================================
// Delete Job
// ==========================================
const deleteJob = async (
    jobId,
    recruiterId
) => {
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.recruiter.toString() !== recruiterId.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this job"
        );
    }

    await job.deleteOne();

    return;
};

module.exports = {
    createJob,
    getAllJobs,
    getRecruiterJobs,
    getJobById,
    updateJob,
    deleteJob,
};