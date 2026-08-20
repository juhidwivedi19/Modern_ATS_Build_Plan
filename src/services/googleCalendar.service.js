const { googleOAuth2Client } = require("../config/googleCalendar.config");

const GOOGLE_CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
];

async function getGoogleAuthUrl() {
    const authUrl = googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: GOOGLE_CALENDAR_SCOPES,
        prompt: "consent",
    });

    return authUrl;
}

async function handleGoogleCallback(code) {
    if (!code) {
        throw new Error("Authorization code is missing");
    }

    const { tokens } = await googleOAuth2Client.getToken(code);

    if (!tokens.access_token) {
        throw new Error("Google access token was not received");
    }

    return tokens;
}

module.exports = {
    getGoogleAuthUrl,
    handleGoogleCallback,
};