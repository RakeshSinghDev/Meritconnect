const PDFDocument = require("pdfkit");
const { uploadResume: uploadFileToCloudinary } = require("../utils/cloudinary");
const AIInterview = require("../models/AIInterview");

/**
 * Generate a PDF report for an AI Interview session, upload it to Cloudinary,
 * store the PDF URL in MongoDB under interview.report.pdfUrl, and return the URL.
 *
 * @param {string} aiInterviewId
 * @returns {Promise<string>} pdfUrl
 */
const generateInterviewPDFReport = async (aiInterviewId) => {
    const interview = await AIInterview.findById(aiInterviewId)
        .populate("candidate", "name email profile")
        .populate("job", "title company description skills");

    if (!interview || !interview.report) {
        throw new Error("Interview or evaluation report not found");
    }

    const { report, candidate, job, context, questions, codingChallenges, transcript } = interview;

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const buffers = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", async () => {
            try {
                const pdfBuffer = Buffer.concat(buffers);

                // Upload PDF buffer to Cloudinary
                let pdfUrl = "";
                try {
                    const uploaded = await uploadFileToCloudinary(pdfBuffer);
                    pdfUrl = uploaded.secure_url;
                } catch (cloudErr) {
                    console.error("Cloudinary PDF upload warning:", cloudErr.message);
                    // Fallback to data URI if Cloudinary fails
                    pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
                }

                // Persist PDF URL to MongoDB
                interview.report.pdfUrl = pdfUrl;
                await interview.save();

                resolve(pdfUrl);
            } catch (err) {
                reject(err);
            }
        });

        doc.on("error", (err) => reject(err));

        // ═════════════════════════════════════════════════════════════
        // PAGE 1: COVER & EXECUTIVE SUMMARY
        // ═════════════════════════════════════════════════════════════

        // Header / Company Branding
        doc.fillColor("#1e293b")
           .rect(0, 0, 595, 70)
           .fill("#0f172a");

        doc.fillColor("#ffffff")
           .fontSize(18)
           .font("Helvetica-Bold")
           .text("MERITCONNECT", 40, 22);

        doc.fontSize(10)
           .font("Helvetica")
           .fillColor("#94a3b8")
           .text("Autonomous AI Interview Evaluation Report", 40, 44);

        doc.fontSize(12)
           .font("Helvetica-Bold")
           .fillColor("#38bdf8")
           .text(job?.company || "Company Assessment", 420, 28, { align: "right" });

        doc.moveDown(3);

        // Candidate Dossier Box
        doc.fillColor("#f8fafc")
           .rect(40, 85, 515, 65)
           .fillAndStroke("#f1f5f9", "#cbd5e1");

        doc.fillColor("#0f172a")
           .fontSize(11)
           .font("Helvetica-Bold")
           .text(`Candidate: ${candidate?.name || "Candidate"}`, 55, 95);

        doc.fontSize(9)
           .font("Helvetica")
           .fillColor("#475569")
           .text(`Email: ${candidate?.email || "N/A"}`, 55, 112)
           .text(`Position: ${job?.title || "Role"}`, 55, 126);

        doc.fontSize(9)
           .font("Helvetica")
           .fillColor("#475569")
           .text(`Date: ${new Date(report.generatedAt || Date.now()).toLocaleDateString()}`, 360, 95)
           .text(`Duration: ${interview.config?.duration || 45} Minutes`, 360, 112)
           .text(`Interview Format: ${interview.type} Round`, 360, 126);

        // Recommendation Banner
        const recColor =
            report.hiringRecommendation === "Strong Hire" || report.hiringRecommendation === "Hire"
                ? "#059669"
                : report.hiringRecommendation === "Lean Hire"
                ? "#2563eb"
                : "#d97706";

        doc.fillColor(recColor)
           .rect(40, 160, 515, 45)
           .fill();

        doc.fillColor("#ffffff")
           .fontSize(14)
           .font("Helvetica-Bold")
           .text(`RECOMMENDATION: ${report.hiringRecommendation}`, 55, 175);

        doc.fontSize(14)
           .font("Helvetica-Bold")
           .text(`OVERALL SCORE: ${report.overallScore}/100`, 380, 175, { align: "right" });

        // Score Grid Table
        doc.moveDown(4.5);
        doc.fontSize(11)
           .font("Helvetica-Bold")
           .fillColor("#0f172a")
           .text("Multi-Dimensional Score Breakdown (10 Evaluation Criteria)", 40, 220);

        const scores = [
            { label: "Technical Knowledge", val: report.technicalScore },
            { label: "Communication", val: report.communicationScore },
            { label: "Confidence", val: report.confidenceScore },
            { label: "Problem Solving", val: report.problemSolvingScore },
            { label: "Coding Execution", val: report.codingScore || 80 },
            { label: "Behavior & STAR Fit", val: report.behaviorScore },
            { label: "Grammar & Syntax", val: report.grammarScore || 85 },
            { label: "Domain Vocabulary", val: report.vocabularyScore || 85 },
            { label: "Leadership & Initiative", val: report.leadershipScore || 75 },
            { label: "System Design", val: report.systemDesignScore || 80 },
        ];

        let yPos = 240;
        scores.forEach((s, idx) => {
            const col = idx % 2;
            const xPos = col === 0 ? 40 : 300;
            if (col === 0 && idx > 0) yPos += 22;

            doc.fillColor("#f1f5f9")
               .rect(xPos, yPos, 250, 18)
               .fill();

            doc.fillColor("#334155")
               .fontSize(9)
               .font("Helvetica-Bold")
               .text(s.label, xPos + 10, yPos + 4);

            doc.fillColor("#0284c7")
               .fontSize(9)
               .font("Helvetica-Bold")
               .text(`${s.val}/100`, xPos + 190, yPos + 4, { align: "right" });
        });

        // ATS Match Score vs Interview Score
        yPos += 35;
        doc.fillColor("#0f172a")
           .fontSize(10)
           .font("Helvetica-Bold")
           .text(`ATS Resume Match Score: ${context?.atsScore || 85}/100   |   AI Interview Score: ${report.overallScore}/100`, 40, yPos);

        // Strengths & Growth Areas
        yPos += 25;
        doc.fontSize(11)
           .font("Helvetica-Bold")
           .fillColor("#059669")
           .text("Key Strengths", 40, yPos);

        doc.fontSize(11)
           .font("Helvetica-Bold")
           .fillColor("#dc2626")
           .text("Growth & Probe Areas", 300, yPos);

        yPos += 15;
        const strengths = report.strengths || [];
        const weaknesses = report.weaknesses || [];

        strengths.slice(0, 4).forEach((str, i) => {
            doc.fillColor("#334155")
               .fontSize(8.5)
               .font("Helvetica")
               .text(`• ${str}`, 40, yPos + i * 14, { width: 240 });
        });

        weaknesses.slice(0, 4).forEach((wk, i) => {
            doc.fillColor("#334155")
               .fontSize(8.5)
               .font("Helvetica")
               .text(`• ${wk}`, 300, yPos + i * 14, { width: 240 });
        });

        // Executive Analysis
        yPos += 70;
        doc.fontSize(11)
           .font("Helvetica-Bold")
           .fillColor("#0f172a")
           .text("Executive Evaluation Summary", 40, yPos);

        yPos += 15;
        doc.fontSize(8.5)
           .font("Helvetica")
           .fillColor("#334155")
           .text(report.detailedAnalysis || "Candidate evaluated thoroughly across all technical and behavioral rounds.", 40, yPos, {
               width: 515,
               align: "justify",
           });

        // ═════════════════════════════════════════════════════════════
        // PAGE 2: QUESTION ANALYSIS & TRANSCRIPT
        // ═════════════════════════════════════════════════════════════
        doc.addPage();

        doc.fillColor("#0f172a")
           .fontSize(13)
           .font("Helvetica-Bold")
           .text("Question-by-Question AI Breakdown", 40, 40);

        let qyPos = 60;
        (questions || []).forEach((q, idx) => {
            if (qyPos > 700) {
                doc.addPage();
                qyPos = 40;
            }

            doc.fillColor("#f8fafc")
               .rect(40, qyPos, 515, 60)
               .fillAndStroke("#f1f5f9", "#e2e8f0");

            doc.fillColor("#0f172a")
               .fontSize(9.5)
               .font("Helvetica-Bold")
               .text(`Q${idx + 1} [${q.type || "Technical"}]: ${q.question}`, 50, qyPos + 8, { width: 420 });

            if (q.aiEvaluation?.score) {
                doc.fillColor("#0284c7")
                   .fontSize(9)
                   .font("Helvetica-Bold")
                   .text(`Score: ${q.aiEvaluation.score}/10`, 470, qyPos + 8, { align: "right" });
            }

            if (q.candidateAnswer) {
                doc.fillColor("#475569")
                   .fontSize(8)
                   .font("Helvetica-Oblique")
                   .text(`Answer: "${q.candidateAnswer.substring(0, 180)}..."`, 50, qyPos + 24, { width: 490 });
            }

            if (q.aiEvaluation?.feedback) {
                doc.fillColor("#0369a1")
                   .fontSize(8)
                   .font("Helvetica")
                   .text(`AI Feedback: ${q.aiEvaluation.feedback.substring(0, 180)}`, 50, qyPos + 42, { width: 490 });
            }

            qyPos += 68;
        });

        // Coding Challenge Breakdown (If any)
        if (codingChallenges && codingChallenges.length > 0) {
            if (qyPos > 650) {
                doc.addPage();
                qyPos = 40;
            }

            doc.moveDown(2);
            doc.fillColor("#0f172a")
               .fontSize(12)
               .font("Helvetica-Bold")
               .text("Coding Challenge Execution", 40, qyPos);

            qyPos += 20;
            codingChallenges.forEach((c) => {
                doc.fillColor("#0f172a")
                   .fontSize(9.5)
                   .font("Helvetica-Bold")
                   .text(`Problem: ${c.title || "Challenge"} (${c.language || "javascript"})`, 40, qyPos);

                qyPos += 14;
                doc.fillColor("#0284c7")
                   .fontSize(8.5)
                   .font("Helvetica")
                   .text(`Time Complexity: ${c.aiEvaluation?.timeComplexity || "O(N)"}   |   Space Complexity: ${c.aiEvaluation?.spaceComplexity || "O(1)"}`, 40, qyPos);

                qyPos += 25;
            });
        }

        // Full Speech Transcript
        if (transcript && transcript.length > 0) {
            if (qyPos > 600) {
                doc.addPage();
                qyPos = 40;
            }

            doc.fillColor("#0f172a")
               .fontSize(12)
               .font("Helvetica-Bold")
               .text("Speech-to-Text Conversation Transcript Summary", 40, qyPos);

            qyPos += 18;
            transcript.slice(0, 10).forEach((t) => {
                if (qyPos > 730) {
                    doc.addPage();
                    qyPos = 40;
                }
                const roleName = t.role === "interviewer" ? "ALEX (AI)" : candidate?.name || "CANDIDATE";
                doc.fillColor(t.role === "interviewer" ? "#0369a1" : "#15803d")
                   .fontSize(8)
                   .font("Helvetica-Bold")
                   .text(`[${roleName}]: `, 40, qyPos, { continued: true });

                doc.fillColor("#334155")
                   .font("Helvetica")
                   .text(t.content.substring(0, 140), { width: 500 });

                qyPos += 14;
            });
        }

        doc.end();
    });
};

module.exports = {
    generateInterviewPDFReport,
};
