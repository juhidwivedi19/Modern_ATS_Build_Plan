const prisma = require("../config/db.config.js");

const {
    createActivityLog
} = require("./activityLog.service.js");
//we have two type of msg first for candidate second recruiter
// =============================================================
// Candidate Application Stage Message
// =============================================================

function getCandidateApplicationMessage(jobTitle, newStatus) {

    switch (newStatus) {

        case "SCREENING":
            return `Your application for ${jobTitle} has moved to the screening stage.`;

        case "TECHNICAL_INTERVIEW":
            return `Congratulations! Your application for ${jobTitle} has progressed to the technical interview stage.`;

        case "HR_INTERVIEW":
            return `Congratulations! Your application for ${jobTitle} has progressed to the HR interview stage.`;

        case "OFFER":
            return `Congratulations! You have received an offer for the ${jobTitle} position.`;

        case "HIRED":
            return `Congratulations! You have been selected for the ${jobTitle} position.`;

        case "REJECTED":
            return `Thank you for your application for ${jobTitle}. Unfortunately, we will not be moving forward with your application.`;

        case "WITHDRAWN":
            return `Your application for ${jobTitle} has been withdrawn.`;

        default:
            return `Your application for ${jobTitle} has been updated.`;
    }
}


// =============================================================
// Team Application Stage Message
// =============================================================

function getTeamApplicationMessage(
    candidateName,
    jobTitle,
    newStatus
) {

    switch (newStatus) {

        case "SCREENING":
            return `${candidateName}'s application for ${jobTitle} has moved to Screening.`;

        case "TECHNICAL_INTERVIEW":
            return `${candidateName}'s application for ${jobTitle} has moved to Technical Interview.`;

        case "HR_INTERVIEW":
            return `${candidateName}'s application for ${jobTitle} has moved to HR Interview.`;

        case "OFFER":
            return `An offer stage has been reached for ${candidateName}'s application for ${jobTitle}.`;

        case "HIRED":
            return `${candidateName} has been hired for the ${jobTitle} position.`;

        case "REJECTED":
            return `${candidateName}'s application for ${jobTitle} has been rejected.`;

        case "WITHDRAWN":
            return `${candidateName}'s application for ${jobTitle} has been withdrawn.`;

        default:
            return `${candidateName}'s application for ${jobTitle} has been updated.`;
    }
}


// =============================================================
// Create Application Stage Notification
// =============================================================

async function createApplicationStageNotification(
    applicationId,
    newStatus,
    performedById
)
    {

           // =========================================================
    // Create Offer Sent Activity Log
    // =========================================================

    if (newStatus === "OFFER") {
        await createActivityLog({
            applicationId: applicationId,
            performedById: performedById,
            action: "OFFER_SENT"
        });
    }

    // 1. Find application
    const application =
        await prisma.application.findUnique({

            where: {
                id: applicationId
            },

            include: {

                candidate: {
                    select: {
                        userId: true,
                        name: true
                    }
                },

                job: {
                    select: {
                        title: true,
                        organizationId: true
                    }
                }
            }
        });


    // 2. Check application exists
    if (!application) {
        throw new Error("Application not found");
    }


    // 3. Get candidate information
    const candidateUserId =
        application.candidate.userId;

    const candidateName =
        application.candidate.name;

    const jobTitle =
        application.job.title;

let notificationType =
    "APPLICATION_STAGE_CHANGED";

if (newStatus === "OFFER") {
    notificationType =
        "APPLICATION_OFFER";
}

if (newStatus === "HIRED") {
    notificationType =
        "APPLICATION_HIRED";
}
    // =========================================================
    // 4. Create Candidate Notification
    // =========================================================

    const candidateMessage =
        getCandidateApplicationMessage(
            jobTitle,
            newStatus
        );

    await prisma.notification.create({
        data: {
            userId: candidateUserId,

            applicationId: applicationId,

           type: notificationType,

            message: candidateMessage
        }
    });


    // =========================================================
    // 5. Find Organization Team Members
    // =========================================================

    const members =
        await prisma.organizationMember.findMany({

            where: {

                organizationId:
                    application.job.organizationId,

                role: {
                    in: [
                        "OWNER",
                        "ADMIN",
                        "RECRUITER"
                    ]
                },

                // Don't notify the person
                // who performed the action
                userId: {
                    not: performedById
                }
            },

            select: {
                userId: true
            }
        });


    // =========================================================
    // 6. Create Team Notification Message
    // =========================================================

    const teamMessage =
        getTeamApplicationMessage(
            candidateName,
            jobTitle,
            newStatus
        );


    // =========================================================
    // 7. Create Team Notifications
    // =========================================================

    if (members.length > 0) {

        await prisma.notification.createMany({

            data: members.map(member => ({

                userId:
                    member.userId,

                applicationId:
                    applicationId,

            type:
               notificationType,

                message:
                    teamMessage
            }))
        });
    }


    // =========================================================
    // 8. Return Success
    // =========================================================

    return {
        candidateNotified: true,

        teamMembersNotified:
            members.length
    };
}

// =============================================================
// Create Interview Scheduled Notification
// =============================================================

async function createInterviewScheduledNotification(
    applicationId,
    interviewId,
    performedById
) {
    const interview = await prisma.interview.findUnique({
        where: {
            id: interviewId
        },
        include: {
            application: {
                include: {
                    candidate: true,
                    job: true
                }
            }
        }
    });

    if (!interview) {
        throw new Error("Interview not found");
    }

    const application = interview.application;

    // Candidate notification
    await prisma.notification.create({
        data: {
            userId: application.candidate.userId,
            applicationId: applicationId,
            type: "APPLICATION_STAGE_CHANGED",
            message: `Your ${interview.type} interview for ${application.job.title} has been scheduled for ${interview.scheduledAt.toLocaleString()}.`
        }
    });

    // Find organization team members
    const members = await prisma.organizationMember.findMany({
        where: {
            organizationId: application.job.organizationId,
            role: {
                in: [
                    "OWNER",
                    "ADMIN",
                    "RECRUITER"
                ]
            },
            userId: {
                not: performedById
            }
        },
        select: {
            userId: true
        }
    });

    // Team notifications
    if (members.length > 0) {
        await prisma.notification.createMany({
            data: members.map(member => ({
                userId: member.userId,
                applicationId: applicationId,
                type: "APPLICATION_STAGE_CHANGED",
                message: `${application.candidate.name}'s ${interview.type} interview for ${application.job.title} has been scheduled.`
            }))
        });
    }

    return {
        candidateNotified: true,
        teamMembersNotified: members.length
    };
}


async function createApplicationReceivedNotification(applicationId) {

    const application = await prisma.application.findUnique({
        where: {
            id: applicationId
        },
        include: {
            candidate: true,
            job: true
        }
    });

    if (!application) {
        throw new Error("Application not found");
    }

    const members = await prisma.organizationMember.findMany({
        where: {
            organizationId: application.job.organizationId,
            role: {
                in: [
                    "OWNER",
                    "ADMIN",
                    "RECRUITER"
                ]
            }
        },
        select: {
            userId: true
        }
    });

    if (members.length > 0) {
        await prisma.notification.createMany({
            data: members.map(member => ({
                userId: member.userId,
                applicationId: application.id,
                type: "APPLICATION_RECEIVED",
                message: `${application.candidate.name} has applied for ${application.job.title}.`
            }))
        });
    }

    return {
        notified: members.length
    };
}

module.exports = {

    createApplicationStageNotification,

    createInterviewScheduledNotification,

           createApplicationReceivedNotification,
    getCandidateApplicationMessage,

    getTeamApplicationMessage
};