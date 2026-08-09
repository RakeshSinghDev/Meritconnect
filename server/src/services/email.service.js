const sendEmail = require("../utils/mailer");

const sendWelcomeEmail = async (user) => {
    const html = `
        <h2>Welcome to AI Recruitment Platform</h2>

        <p>Hi <strong>${user.name}</strong>,</p>

        <p>Your account has been created successfully.</p>

        <p>We are excited to help you find great opportunities.</p>

        <br>

        <p>Regards,<br>AI Recruitment Platform Team</p>
    `;

    await sendEmail({
        to: user.email,
        subject: "Welcome to AI Recruitment Platform",
        html,
        text: `Welcome ${user.name}!`,
    });
};

const sendApplicationSubmittedEmail = async (
    candidate,
    job
) => {
    const html = `
        <h2>Application Submitted Successfully</h2>

        <p>Hi <strong>${candidate.name}</strong>,</p>

        <p>
            Your application for
            <strong>${job.title}</strong>
            at
            <strong>${job.company}</strong>
            has been submitted successfully.
        </p>

        <p>We wish you all the best for the hiring process.</p>

        <br>

        <p>Regards,<br>AI Recruitment Platform Team</p>
    `;

    await sendEmail({
        to: candidate.email,
        subject: "Application Submitted Successfully",
        html,
        text: `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
    });
};
const sendApplicationStatusEmail = async (
    candidate,
    job,
    status
) => {
    let message = "";

    switch (status) {
        case "Reviewed":
            message =
                "Your application has been reviewed by the recruiter.";
            break;

        case "Shortlisted":
            message =
                "Congratulations! You have been shortlisted for the next round.";
            break;

        case "Interview":
            message =
                "Congratulations! You have been selected for the interview round.";
            break;

        case "Rejected":
            message =
                "We appreciate your interest. Unfortunately, you were not selected for this role.";
            break;

        case "Hired":
            message =
                "Congratulations! You have been selected for the position.";
            break;

        default:
            message = `Your application status has been updated to ${status}.`;
    }

    const html = `
        <h2>Application Status Updated</h2>

        <p>Hi <strong>${candidate.name}</strong>,</p>

        <p>
            Your application for
            <strong>${job.title}</strong>
            at
            <strong>${job.company}</strong>
            has been updated.
        </p>

        <h3>Status: ${status}</h3>

        <p>${message}</p>

        <br>

        <p>Regards,<br>AI Recruitment Platform Team</p>
    `;

    await sendEmail({
        to: candidate.email,
        subject: `Application Status Updated - ${status}`,
        html,
        text: message,
    });
};
const sendPasswordResetEmail = async (
    user,
    resetUrl
) => {
    const html = `
        <h2>Password Reset Request</h2>

        <p>Hi <strong>${user.name}</strong>,</p>

        <p>
            You requested to reset your password.
        </p>

        <p>
            Click the button below to reset it.
        </p>

        <p>
            <a
                href="${resetUrl}"
                style="
                    background:#2563eb;
                    color:white;
                    padding:12px 20px;
                    text-decoration:none;
                    border-radius:6px;
                    display:inline-block;
                "
            >
                Reset Password
            </a>
        </p>

        <p>
            This link expires in 15 minutes.
        </p>

        <p>
            If you didn't request this, you can safely ignore this email.
        </p>

        <br>

        <p>AI Recruitment Platform</p>
    `;

    await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html,
        text: `Reset your password using this link: ${resetUrl}`,
    });
};
const sendInterviewInvitationEmail = async (
    candidate,
    job,
    interview
) => {
    const interviewDate = new Date(
        interview.interviewDate
    ).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
    });

    const html = `
        <h2>Interview Invitation</h2>

        <p>Hi <strong>${candidate.name}</strong>,</p>

        <p>
            Congratulations! You have been shortlisted for an interview.
        </p>

        <table style="border-collapse:collapse">
            <tr>
                <td><strong>Company</strong></td>
                <td>${job.company}</td>
            </tr>
            <tr>
                <td><strong>Job</strong></td>
                <td>${job.title}</td>
            </tr>
            <tr>
                <td><strong>Date & Time</strong></td>
                <td>${interviewDate}</td>
            </tr>
            <tr>
                <td><strong>Duration</strong></td>
                <td>${interview.duration} Minutes</td>
            </tr>
            <tr>
                <td><strong>Mode</strong></td>
                <td>${interview.mode}</td>
            </tr>
        </table>

        ${interview.mode === "Online"
            ? `<p><strong>Meeting Link:</strong><br>
                <a href="${interview.meetingLink}">
                    ${interview.meetingLink}
                </a></p>`
            : `<p><strong>Venue:</strong><br>${interview.venue}</p>`
        }

        ${interview.notes
            ? `<p><strong>Notes:</strong><br>${interview.notes}</p>`
            : ""
        }

        <br>

        <p>Best of luck for your interview!</p>

        <br>

        <p>Regards,<br>
        AI Recruitment Platform Team</p>
    `;

    await sendEmail({
        to: candidate.email,
        subject: `Interview Scheduled - ${job.company}`,
        html,
        text: `Interview scheduled on ${interviewDate}`,
    });
};
module.exports = {
    sendWelcomeEmail,
    sendApplicationSubmittedEmail,
    sendApplicationStatusEmail,
    sendPasswordResetEmail,
    sendInterviewInvitationEmail,
};