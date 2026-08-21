const googleCalendarService = require("../services/googleCalendar.service");

async function connectGoogleCalendarController(req, res) {
    try {
        const userId = req.user.id;

        const authUrl = await googleCalendarService.getGoogleAuthUrl(userId);

        return res.status(200).json({
            success: true,
            authUrl,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//=========================
//Callback Controller
//=========================
async function googleCalendarCallbackController(req, res) {
    try {
        const { code, state } = req.query;

        if (!code) {
            throw new Error("Authorization code is missing");
        }

        if (!state) {
            throw new Error("OAuth state is missing");
        }

        const userId =
            await googleCalendarService.verifyOAuthState(state);

        await googleCalendarService.handleGoogleCallback(
            code,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Google Calendar connected successfully",
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

//====================
//add calendar status
async function getCalendarStatusController(req, res) {
    try {
        const userId = req.user.id;

        const result =
            await googleCalendarService.getCalendarConnectionStatus(
                userId
            );

        return res.status(200).json({
            success: true,
            connected: result.connected,
            calendarId: result.calendarId || null,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

//============================
//disconnect google controller
//============================
async function disconnectGoogleCalendarController(req, res) {
    try {
        const userId = req.user.id;

        const result =
            await googleCalendarService.disconnectGoogleCalendar(
                userId
            );

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
module.exports = {
    connectGoogleCalendarController,
    googleCalendarCallbackController,
    getCalendarStatusController,
    disconnectGoogleCalendarController
};