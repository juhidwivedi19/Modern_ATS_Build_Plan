const prisma = require("../config/db.config.js");

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
) {

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

            type: "APPLICATION_STAGE_CHANGED",

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
                    "APPLICATION_STAGE_CHANGED",

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
// Exports
// =============================================================

module.exports = {

    createApplicationStageNotification,

    getCandidateApplicationMessage,

    getTeamApplicationMessage
};