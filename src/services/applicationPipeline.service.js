const prisma = require("../config/db.config.js");

const emailQueue = require("../queues/email.queue.js");

const { hasPermission } =
    require("./permission.service.js");

const {
    createApplicationStageNotification
} = require("./notification.service.js");


// =============================================================
// Application Email Message
// =============================================================

function getApplicationEmailMessage(
    jobTitle,
    newStatus
) {

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
// Allowed Application Transitions
// =============================================================

const allowedTransitions = {

    APPLIED: [
        "SCREENING",
        "REJECTED",
        "WITHDRAWN"
    ],

    SCREENING: [
        "TECHNICAL_INTERVIEW",
        "REJECTED",
        "WITHDRAWN"
    ],

    TECHNICAL_INTERVIEW: [
        "HR_INTERVIEW",
        "REJECTED",
        "WITHDRAWN"
    ],

    HR_INTERVIEW: [
        "OFFER",
        "REJECTED",
        "WITHDRAWN"
    ],

    OFFER: [
        "HIRED",
        "REJECTED",
        "WITHDRAWN"
    ],

    HIRED: [],

    REJECTED: [],

    WITHDRAWN: []
};


// =============================================================
// Validate Transition
// =============================================================

function isValidTransition(
    currentStatus,
    newStatus
) {

    const allowedNextStatuses =
        allowedTransitions[currentStatus];

    if (!allowedNextStatuses) {
        return false;
    }

    return allowedNextStatuses.includes(
        newStatus
    );
}


// =============================================================
// Move Application
// =============================================================

async function moveApplication(
    applicationId,
    newStatus,
    performedById
) {

    // ---------------------------------------------------------
    // 1. Find application
    // ---------------------------------------------------------

    const application =
        await prisma.application.findUnique({

            where: {
                id: applicationId
            },

            include: {

                candidate: {
                    select: {
                        name: true,
                        email: true,
                        userId: true
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


    // ---------------------------------------------------------
    // 2. Check application exists
    // ---------------------------------------------------------

    if (!application) {

        throw new Error(
            "Application not found"
        );
    }


    // ---------------------------------------------------------
    // 3. Get organization ID
    // ---------------------------------------------------------

    const organizationId =
        application.job.organizationId;


    // ---------------------------------------------------------
    // 4. Check permission
    // ---------------------------------------------------------

    const allowed =
        await hasPermission(
            performedById,
            organizationId,
            "APPLICATION_MOVE"
        );


    if (!allowed) {

        throw new Error(
            "You do not have permission to move this application"
        );
    }


    // ---------------------------------------------------------
    // 5. Get current status
    // ---------------------------------------------------------

    const currentStatus =
        application.status;


    // ---------------------------------------------------------
    // 6. Validate transition
    // ---------------------------------------------------------

    const valid =
        isValidTransition(
            currentStatus,
            newStatus
        );


    if (!valid) {

        throw new Error(
            `Invalid transition: ${currentStatus} → ${newStatus}`
        );
    }


    // ---------------------------------------------------------
    // 7. Update application + create activity log
    // ---------------------------------------------------------

    const result =
        await prisma.$transaction(
            async (tx) => {

                // Update application
                const updatedApplication =
                    await tx.application.update({

                        where: {
                            id: applicationId
                        },

                        data: {
                            status: newStatus
                        }
                    });


                // Create activity log
                await tx.activityLog.create({

                    data: {

                        applicationId:
                            applicationId,

                        performedById:
                            performedById,

                        action:
                            "STAGE_CHANGED",

                        oldStatus:
                            currentStatus,

                        newStatus:
                            newStatus
                    }
                });


                return updatedApplication;
            }
        );


    // ---------------------------------------------------------
    // 8. Create in-app notification
    // ---------------------------------------------------------

    await createApplicationStageNotification(

        applicationId,

        newStatus,

        performedById
    );


    // ---------------------------------------------------------
    // 9. Create email message
    // ---------------------------------------------------------

    const emailMessage =
        getApplicationEmailMessage(

            application.job.title,

            newStatus
        );


    // ---------------------------------------------------------
    // 10. Add email job to BullMQ
    // ---------------------------------------------------------

    await emailQueue.add(

        "application-stage-email",

        {

            to:
                application.candidate.email,

            candidateName:
                application.candidate.name,

            jobTitle:
                application.job.title,

            status:
                newStatus,

            message:
                emailMessage
        }
    );


    // ---------------------------------------------------------
    // 11. Return updated application
    // ---------------------------------------------------------

    return result;
}


// =============================================================
// Get Application Activity
// =============================================================

async function getApplicationActivity(
    applicationId,
    performedById
) {

    // ---------------------------------------------------------
    // 1. Find application
    // ---------------------------------------------------------

    const application =
        await prisma.application.findUnique({

            where: {
                id: applicationId
            },

            include: {

                job: {
                    select: {
                        organizationId: true
                    }
                }
            }
        });


    // ---------------------------------------------------------
    // 2. Check application exists
    // ---------------------------------------------------------

    if (!application) {

        throw new Error(
            "Application not found"
        );
    }


    // ---------------------------------------------------------
    // 3. Get organization ID
    // ---------------------------------------------------------

    const organizationId =
        application.job.organizationId;


    // ---------------------------------------------------------
    // 4. Check permission
    // ---------------------------------------------------------

    const allowed =
        await hasPermission(

            performedById,

            organizationId,

            "APPLICATION_VIEW"
        );


    if (!allowed) {

        throw new Error(
            "You do not have permission to view this application activity"
        );
    }


    // ---------------------------------------------------------
    // 5. Get activity logs
    // ---------------------------------------------------------

    const activities =
        await prisma.activityLog.findMany({

            where: {

                applicationId:
                    applicationId
            },

            include: {

                performedBy: {

                    select: {

                        id: true,

                        name: true,

                        email: true
                    }
                }
            },

            orderBy: {

                createdAt: "asc"
            }
        });


    // ---------------------------------------------------------
    // 6. Return activity history
    // ---------------------------------------------------------

    return activities;
}


module.exports = {

    isValidTransition,
    moveApplication,
    getApplicationActivity,
    getApplicationEmailMessage
};