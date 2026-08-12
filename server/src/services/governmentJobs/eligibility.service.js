class GovernmentEligibilityService {
  /**
   * Deterministically evaluate eligibility for a given candidate profile and job.
   * @param {Object} candidateProfile User profile object
   * @param {Object} job GovernmentOpportunity document
   * @returns {Object} Match details { isMatch: boolean, label: string, matchPercentage: number }
   */
  evaluateEligibility(candidateProfile, job) {
    if (!candidateProfile) {
      return { isMatch: false, label: "Login to check eligibility", matchPercentage: 0 };
    }

    let score = 0;
    let maxScore = 0;
    let reasons = [];

    // Qualification Match
    if (job.qualification) {
      maxScore += 40;
      const jobQual = job.qualification.toLowerCase();
      
      // Basic heuristic for degree vs 10th/12th
      if (candidateProfile.education && candidateProfile.education.length > 0) {
        const userQuals = candidateProfile.education.map(e => (e.degree || "").toLowerCase()).join(" ");
        if (jobQual.includes("degree") || jobQual.includes("graduation") || jobQual.includes("bachelor")) {
          if (userQuals.includes("b.tech") || userQuals.includes("b.e") || userQuals.includes("bsc") || userQuals.includes("ba") || userQuals.includes("bachelor")) {
            score += 40;
            reasons.push("Education requirement matches");
          }
        } else if (jobQual.includes("12th") || jobQual.includes("10+2")) {
          score += 40;
          reasons.push("Basic education matched");
        } else if (jobQual.includes("10th") || jobQual.includes("matriculation")) {
          score += 40;
          reasons.push("Basic education matched");
        }
      }
    }

    // Degree / Discipline Match
    if (job.degree && job.degree.length > 0) {
      maxScore += 40;
      if (candidateProfile.education && candidateProfile.education.length > 0) {
        const userDegrees = candidateProfile.education.map(e => (e.degree || "").toLowerCase());
        const userFields = candidateProfile.education.map(e => (e.fieldOfStudy || "").toLowerCase());
        
        let degreeMatched = false;
        for (const reqDegree of job.degree) {
          if (userDegrees.some(d => d.includes(reqDegree.toLowerCase()))) {
            degreeMatched = true;
            break;
          }
        }

        let disciplineMatched = false;
        if (job.discipline && job.discipline.length > 0) {
          for (const reqDisc of job.discipline) {
            if (userFields.some(f => f.includes(reqDisc.toLowerCase()))) {
              disciplineMatched = true;
              break;
            }
          }
        } else {
          disciplineMatched = true; // No specific discipline required
        }

        if (degreeMatched && disciplineMatched) {
          score += 40;
          reasons.push("Specific degree/discipline matched");
        } else if (degreeMatched) {
          score += 20;
        }
      }
    }

    // Location / State Match
    if (job.state) {
      maxScore += 20;
      if (candidateProfile.location && candidateProfile.location.toLowerCase().includes(job.state.toLowerCase())) {
        score += 20;
        reasons.push("Location matched");
      }
    }

    // If maxScore is 0 (job has no strict criteria parsed), we assume a generic "Review eligibility"
    if (maxScore === 0) {
      return { isMatch: null, label: "Check official notification", matchPercentage: null };
    }

    const matchPercentage = Math.round((score / maxScore) * 100);

    let label = "Review eligibility";
    if (matchPercentage >= 80) label = "Likely eligible";
    else if (matchPercentage >= 50) label = "Possible match";
    else label = "May not be eligible";

    return {
      isMatch: matchPercentage >= 50,
      label,
      matchPercentage,
      reasons
    };
  }
}

module.exports = new GovernmentEligibilityService();
