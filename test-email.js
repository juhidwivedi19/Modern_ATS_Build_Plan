require("dotenv").config();

const { sendApplicationStageEmail } = require("./src/services/email.service.js");

async function testEmail() {
    try {
        await sendApplicationStageEmail(
            process.env.EMAIL_USER,
            "Test Candidate",
            "Frontend Developer",
            "OFFER",
            "This is a test email from the ATS project."
        );

        console.log("TEST EMAIL SENT SUCCESSFULLY");
    } catch (error) {
        console.error("TEST EMAIL FAILED:", error.message);
    }
}

testEmail();