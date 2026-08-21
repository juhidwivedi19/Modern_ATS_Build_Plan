const { google } = require("googleapis");
const crypto = require("crypto");

const redis = require("../config/redis.config.js")
const { googleOAuth2Client } = require("../config/googleCalendar.config");
const prisma = require("../config/db.config.js");

const GOOGLE_CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
];

//=========
//get ggoogle auth url
//==============
async function getGoogleAuthUrl(userId) {
    const state = await generateOAuthState(userId);

    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: GOOGLE_SCOPES,
        state,
        prompt: "consent",
    });
}


async function handleGoogleCallback(code, userId) {
    if (!code) {
        throw new Error("Authorization code is missing");
    }

    if (!userId) {
        throw new Error("User ID is required");
    }

    const { tokens } = await googleOAuth2Client.getToken(code);

    if (!tokens.access_token) {
        throw new Error("Google access token was not received");
    }

    const tokenExpiry = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : null;

    const googleAccount = await prisma.googleCalendarAccount.upsert({
        where: {
            userId: Number(userId),
        },
        update: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || undefined,
            tokenExpiry,
        },
        create: {
            userId: Number(userId),
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || null,
            tokenExpiry,
            calendarId: "primary",
        },
    });

    return googleAccount;
}


//Create an Authenticated Google Calendar Client
async function getAuthenticatedCalendar(userId) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const googleAccount = await prisma.googleCalendarAccount.findUnique({
        where: {
            userId: Number(userId),
        },
    });

    if (!googleAccount) {
        throw new Error("Google Calendar is not connected");
    }

    if (!googleAccount.refreshToken) {
        throw new Error("Google refresh token is missing");
    }

    googleOAuth2Client.setCredentials({
        access_token: googleAccount.accessToken,
        refresh_token: googleAccount.refreshToken,
    });

    // Check whether access token is expired
    if (
        googleAccount.tokenExpiry &&
        new Date(googleAccount.tokenExpiry) <= new Date()
    ) {
        const { credentials } =
            await googleOAuth2Client.refreshAccessToken();

        if (!credentials.access_token) {
            throw new Error("Failed to refresh Google access token");
        }

        await prisma.googleCalendarAccount.update({
            where: {
                userId: Number(userId),
            },
            data: {
                accessToken: credentials.access_token,
                tokenExpiry: credentials.expiry_date
                    ? new Date(credentials.expiry_date)
                    : googleAccount.tokenExpiry,
            },
        });

        googleOAuth2Client.setCredentials({
            access_token: credentials.access_token,
            refresh_token: googleAccount.refreshToken,
        });
    }

    const calendar = google.calendar({
        version: "v3",
        auth: googleOAuth2Client,
    });

    return calendar;
}

//=================
//Create calendar event
//=====================
async function createCalendarEvent({
    userId,
    summary,
    description,
    scheduledAt,
    duration,
    meetingLink,
    attendeeEmails = [],
}) {
    const calendar = await getAuthenticatedCalendar(userId);

    const startDate = new Date(scheduledAt);

    const endDate = new Date(
        startDate.getTime() + duration * 60 * 1000
    );

    const event = {
        summary,
        description,
        start: {
            dateTime: startDate.toISOString(),
        },
        end: {
            dateTime: endDate.toISOString(),
        },

        attendees: attendeeEmails.map((email) => ({
            email,
        })),
    };

    // If manual meeting link is provided
    if (meetingLink) {
        event.description += `\n\nMeeting Link: ${meetingLink}`;
    } else {
        // Automatically create Google Meet
        event.conferenceData = {
            createRequest: {
                requestId: `interview-${userId}-${Date.now()}`,
                conferenceSolutionKey: {
                    type: "hangoutsMeet",
                },
            },
        };
    }

    const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: "all",
    });

    const meetLink =
        response.data.hangoutLink ||
        response.data.conferenceData?.entryPoints?.find(
            (entry) => entry.entryPointType === "video"
        )?.uri ||
        null;

    return {
        ...response.data,
        meetLink,
    };
}

//=================
//add calendar attendee
//=====================
async function addCalendarAttendee({
    userId,
    googleEventId,
    attendeeEmail,
}) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!googleEventId) {
        throw new Error("Google Calendar event ID is required");
    }

    if (!attendeeEmail) {
        throw new Error("Attendee email is required");
    }

    const calendar = await getAuthenticatedCalendar(userId);

    const eventResponse = await calendar.events.get({
        calendarId: "primary",
        eventId: googleEventId,
    });

    const event = eventResponse.data;

    const attendees = event.attendees || [];

    const alreadyAdded = attendees.some(
        (attendee) => attendee.email === attendeeEmail
    );

    if (alreadyAdded) {
        throw new Error("Interviewer is already a calendar attendee");
    }

    attendees.push({
        email: attendeeEmail,
    });

    const updatedEvent = await calendar.events.update({
        calendarId: "primary",
        eventId: googleEventId,
        requestBody: {
            attendees,
        },
        sendUpdates: "all",
    });

    return updatedEvent.data;
}

//=================================
//remove interviewer from google calendar
//=========================
async function removeCalendarAttendee({
    userId,
    googleEventId,
    attendeeEmail,
}) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!googleEventId) {
        throw new Error("Google Calendar event ID is required");
    }

    if (!attendeeEmail) {
        throw new Error("Attendee email is required");
    }

    const calendar = await getAuthenticatedCalendar(userId);

    const eventResponse = await calendar.events.get({
        calendarId: "primary",
        eventId: googleEventId,
    });

    const event = eventResponse.data;

    const attendees = event.attendees || [];

    const updatedAttendees = attendees.filter(
        (attendee) => attendee.email !== attendeeEmail
    );

    if (attendees.length === updatedAttendees.length) {
        throw new Error("Interviewer is not a calendar attendee");
    }

    const updatedEvent = await calendar.events.update({
        calendarId: "primary",
        eventId: googleEventId,
        requestBody: {
            attendees: updatedAttendees,
        },
        sendUpdates: "all",
    });

    return updatedEvent.data;
}

//==========================
//add updateCalendarEvent
//==========================
async function updateCalendarEvent({
    userId,
    googleEventId,
    summary,
    description,
    scheduledAt,
    duration,
    meetingLink,
}) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!googleEventId) {
        throw new Error("Google Calendar event ID is required");
    }

    if (!scheduledAt) {
        throw new Error("Scheduled date and time are required");
    }

    if (!duration) {
        throw new Error("Interview duration is required");
    }

    const calendar = await getAuthenticatedCalendar(userId);

    const startDate = new Date(scheduledAt);

    const endDate = new Date(
        startDate.getTime() + duration * 60 * 1000
    );

    const event = {
        summary,
        description: description || "Interview scheduled through ATS",
        start: {
            dateTime: startDate.toISOString(),
        },
        end: {
            dateTime: endDate.toISOString(),
        },
    };

    if (meetingLink) {
        event.description += `\n\nMeeting Link: ${meetingLink}`;
    }

    const response = await calendar.events.update({
        calendarId: "primary",
        eventId: googleEventId,
        requestBody: event,
        sendUpdates: "all",
    });

    return response.data;
}

//=====================
//Delete calendar event
//======================
async function deleteCalendarEvent({
    userId,
    googleEventId,
}) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!googleEventId) {
        throw new Error("Google Calendar event ID is required");
    }

    const calendar = await getAuthenticatedCalendar(userId);

    await calendar.events.delete({
        calendarId: "primary",
        eventId: googleEventId,
        sendUpdates: "all",
    });

    return {
        message: "Google Calendar event deleted successfully",
    };
}


//=======================
//Add Google Calendar Connection status
//=========================
async function getCalendarConnectionStatus(userId) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const googleAccount =
        await prisma.googleCalendarAccount.findUnique({
            where: {
                userId: Number(userId),
            },
        });

    if (!googleAccount) {
        return {
            connected: false,
        };
    }

    return {
        connected: true,
        calendarId: googleAccount.calendarId,
    };
}


//=======================
//Disconnect google calendar
//=======================
async function disconnectGoogleCalendar(userId) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const googleAccount =
        await prisma.googleCalendarAccount.findUnique({
            where: {
                userId: Number(userId),
            },
        });

    if (!googleAccount) {
        throw new Error("Google Calendar is not connected");
    }

    await prisma.googleCalendarAccount.delete({
        where: {
            userId: Number(userId),
        },
    });

    return {
        message: "Google Calendar disconnected successfully",
    };
}


//============================
//Create OAUTH STARTE IN YOUR SERVICE
//=============================
async function generateOAuthState(userId) {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const state = crypto.randomBytes(32).toString("hex");

    await redis.set(
        `google:oauth:state:${state}`,
        String(userId),
        "EX",
        600
    );

    return state;
}

//====================
//Verify OAUTH STATE
//================
async function verifyOAuthState(state) {
    if (!state) {
        throw new Error("OAuth state is missing");
    }

    const key = `google:oauth:state:${state}`;

    const userId = await redis.get(key);

    if (!userId) {
        throw new Error("Invalid or expired OAuth state");
    }

    await redis.del(key);

    return Number(userId);
}
module.exports = {
    getGoogleAuthUrl,
    handleGoogleCallback,
    getAuthenticatedCalendar,
    createCalendarEvent,
    addCalendarAttendee,
    removeCalendarAttendee,
    updateCalendarEvent,
    deleteCalendarEvent,
    getCalendarConnectionStatus,
    disconnectGoogleCalendar,
    generateOAuthState,
    generateOAuthState
};