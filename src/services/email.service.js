const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({  
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

async function sendRegistrationEmail(email, name) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to ATS Project",
        text: `Hello ${name}, your account has been successfully created.`
    });
}

async function sendVerificationEmail(email, name, verificationToken) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        text: `Hello ${name}, your email verification token is: ${verificationToken}`
    });
}

//for forgot password
async function sendPasswordResetEmail(email, name, resetToken) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your Password",
        text: `Hello ${name}, your password reset token is: ${resetToken}`
    });
}


async function sendInvitationEmail(email, role, invitationLink) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Organization Invitation",
        html: `
            <h2>You have been invited!</h2>

            <p>You have been invited to join an organization.</p>

            <p>Your assigned role is: <strong>${role}</strong></p>

            <p>Click the link below to accept the invitation:</p>

            <a href="${invitationLink}">
                Accept Invitation
            </a>

            <p>This invitation will expire in 24 hours.</p>
        `
    });
}

//For NOTIFICATION PHASE 7

async function sendApplicationStageEmail(
    email,
    candidateName,
    jobTitle,
    status,
    message
) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Application Update - ${jobTitle}`,
        html: `
            <h2>Application Update</h2>

            <p>Hello ${candidateName},</p>

            <p>${message}</p>

            <p>
                <strong>Position:</strong> ${jobTitle}
            </p>

            <p>
                <strong>Current Status:</strong> ${status}
            </p>

            <p>Thank you for using ATS Project.</p>
        `
    });
}


//================
//Add Schedule interview email
//====================
async function sendInterviewScheduledEmail(
    email,
    candidateName,
    jobTitle,
    interviewType,
    scheduledAt,
    duration,
    meetingLink
) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Interview Scheduled - ${jobTitle}`,
        html: `
            <h2>Interview Scheduled</h2>

            <p>Hello ${candidateName},</p>

            <p>Your interview has been scheduled.</p>

            <p>
                <strong>Position:</strong> ${jobTitle}
            </p>

            <p>
                <strong>Interview Type:</strong> ${interviewType}
            </p>

            <p>
                <strong>Date & Time:</strong> ${scheduledAt}
            </p>

            <p>
                <strong>Duration:</strong> ${duration} minutes
            </p>

            ${
                meetingLink
                    ? `
                    <p>
                        <strong>Meeting Link:</strong>
                        <a href="${meetingLink}">
                            Join Interview
                        </a>
                    </p>
                    `
                    : ""
            }

            <p>Please make sure you are available at the scheduled time.</p>

            <p>Best wishes!</p>

            <p>ATS Project</p>
        `
    });
}



//=====================
//ADD RESCHEDULE INTERVIEW EMAIL
async function sendInterviewRescheduledEmail(
    email,
    candidateName,
    jobTitle,
    interviewType,
    scheduledAt,
    duration,
    meetingLink
) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Interview Rescheduled - ${jobTitle}`,
        html: `
            <h2>Interview Rescheduled</h2>

            <p>Hello ${candidateName},</p>

            <p>Your interview has been rescheduled.</p>

            <p>
                <strong>Position:</strong> ${jobTitle}
            </p>

            <p>
                <strong>Interview Type:</strong> ${interviewType}
            </p>

            <p>
                <strong>New Date & Time:</strong> ${scheduledAt}
            </p>

            <p>
                <strong>Duration:</strong> ${duration} minutes
            </p>

            ${
                meetingLink
                    ? `
                    <p>
                        <strong>Meeting Link:</strong>
                        <a href="${meetingLink}">
                            Join Interview
                        </a>
                    </p>
                    `
                    : ""
            }

            <p>Please make a note of the new interview time.</p>

            <p>ATS Project</p>
        `
    });
}



//=====================
//Add Cancel interview email
//======================
async function sendInterviewCancelledEmail(
    email,
    candidateName,
    jobTitle,
    interviewType
) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Interview Cancelled - ${jobTitle}`,
        html: `
            <h2>Interview Cancelled</h2>

            <p>Hello ${candidateName},</p>

            <p>
                We would like to inform you that your interview
                has been cancelled.
            </p>

            <p>
                <strong>Position:</strong> ${jobTitle}
            </p>

            <p>
                <strong>Interview Type:</strong> ${interviewType}
            </p>

            <p>
                If the interview is rescheduled, you will receive
                another notification.
            </p>

            <p>ATS Project</p>
        `
    });
}


//======================
//Add reminder email
//================

async function sendInterviewReminderEmail(
    email,
    candidateName,
    jobTitle,
    interviewType,
    scheduledAt,
    meetingLink,
    reminderTime
) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Interview Reminder - ${jobTitle}`,
        html: `
            <h2>Interview Reminder</h2>

            <p>Hello ${candidateName},</p>

            <p>
                This is a reminder that you have an upcoming interview.
            </p>

            <p>
                <strong>Position:</strong> ${jobTitle}
            </p>

            <p>
                <strong>Interview Type:</strong> ${interviewType}
            </p>

            <p>
                <strong>Date & Time:</strong> ${scheduledAt}
            </p>

            <p>
                <strong>Reminder:</strong> ${reminderTime}
            </p>

            ${
                meetingLink
                    ? `
                    <p>
                        <strong>Meeting Link:</strong>
                        <a href="${meetingLink}">
                            Join Interview
                        </a>
                    </p>
                    `
                    : ""
            }

            <p>Please be ready before the scheduled time.</p>

            <p>ATS Project</p>
        `
    });
}


//=================
//send interview reminder email

module.exports = {
    sendRegistrationEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendInvitationEmail,
    sendApplicationStageEmail,
    sendInterviewScheduledEmail,
    sendInterviewRescheduledEmail,
    sendInterviewCancelledEmail,
    sendInterviewReminderEmail
};

