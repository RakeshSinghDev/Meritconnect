const mongoose = require("mongoose");

const governmentOpportunitySchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
    },
    sourceId: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    postName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    qualification: {
      type: String,
    },
    degree: {
      type: [String],
      default: [],
    },
    discipline: {
      type: [String],
      default: [],
    },
    ageLimit: {
      type: String,
    },
    vacancies: {
      type: Number,
    },
    category: {
      type: String,
    },
    state: {
      type: String,
    },
    location: {
      type: String,
    },
    applicationStartDate: {
      type: Date,
    },
    applicationLastDate: {
      type: Date,
    },
    examDate: {
      type: Date,
    },
    fee: {
      type: String,
    },
    status: {
      type: String,
      enum: ["NEW", "APPLICATION_OPEN", "CLOSING_SOON", "CLOSED", "UPCOMING"],
      default: "NEW",
    },
    notificationUrl: {
      type: String,
    },
    applicationUrl: {
      type: String,
    },
    publishedAt: {
      type: Date,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    eligibility: {
      type: String,
    },
    externalId: {
      type: String,
      trim: true,
    },
    rawSourceData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate status dynamically
governmentOpportunitySchema.pre("save", function () {
  this.lastUpdatedAt = new Date();
  
  const now = new Date();
  if (this.applicationLastDate && this.applicationLastDate < now) {
    this.status = "CLOSED";
  } else if (this.applicationLastDate && (this.applicationLastDate.getTime() - now.getTime()) <= 7 * 24 * 60 * 60 * 1000) {
    this.status = "CLOSING_SOON";
  } else if (this.applicationStartDate && this.applicationStartDate > now) {
    this.status = "UPCOMING";
  } else if (this.applicationStartDate && this.applicationStartDate <= now && (!this.applicationLastDate || this.applicationLastDate >= now)) {
    this.status = "APPLICATION_OPEN";
  } else if (!this.status) {
    this.status = "NEW";
  }
});

// Indexes for searching and filtering
governmentOpportunitySchema.index({ status: 1, applicationLastDate: 1 });
governmentOpportunitySchema.index({ 
  organization: "text", 
  title: "text", 
  postName: "text", 
  qualification: "text", 
  discipline: "text", 
  location: "text", 
  category: "text" 
});
governmentOpportunitySchema.index({ source: 1, sourceId: 1 }, { unique: true });

const GovernmentOpportunity = mongoose.model(
  "GovernmentOpportunity",
  governmentOpportunitySchema
);

module.exports = GovernmentOpportunity;
