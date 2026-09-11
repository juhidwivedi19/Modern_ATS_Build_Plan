require("dotenv").config();

const { google } = require("googleapis");
const http = require("http");
const url = require("url");

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "http://localhost:3000/oauth2callback"
);

const scopes = [
    "https://mail.google.com/"
];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent"
});

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for Google OAuth callback...\n");

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith("/oauth2callback")) {
        const query = url.parse(req.url, true).query;

        if (!query.code) {
            res.end("Authorization failed.");
            return;
        }

        try {
            const { tokens } = await oauth2Client.getToken(query.code);

            console.log("\nOAuth successful!");
            console.log("\nNEW REFRESH TOKEN:\n");
            console.log(tokens.refresh_token);

            res.end(
                "Gmail authorization successful. You can close this window."
            );

            server.close();
        } catch (error) {
            console.error("OAuth error:", error.message);
            res.end("OAuth failed. Check your terminal.");
            server.close();
        }
    }
});

server.listen(3000, () => {
    console.log("OAuth callback server running on http://localhost:3000");
});