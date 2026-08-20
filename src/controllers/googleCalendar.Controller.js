const googleCalendarService = require("../services/googleCalendar.service");

async function connectGoogleCalendarController(req, res) {
    try {
        const authUrl = await googleCalendarService.getGoogleAuthUrl();

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

async function googleCalendarCallbackController(req, res) {
    try {
        const { code } = req.query;

        const tokens = await googleCalendarService.handleGoogleCallback(code);

        return res.status(200).json({
            success: true,
            message: "Google Calendar connected successfully",
            tokens,
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
    googleCalendarCallbackController
};