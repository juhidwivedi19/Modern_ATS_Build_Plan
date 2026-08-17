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
module.exports = {
    sendRegistrationEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendInvitationEmail,
    sendApplicationStageEmail
};

