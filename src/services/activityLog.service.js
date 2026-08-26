const prisma = require("../config/db.config.js");


async function createActivityLog({
    applicationId = null,
    performedById,
    action,
    oldStatus = null,
    newStatus = null
}) {

    return await prisma.activityLog.create({

        data: {

            applicationId,
            performedById,
            action,
            oldStatus,
            newStatus

        }

    });
}


async function getActivityLogs(applicationId) {

    return await prisma.activityLog.findMany({

        where: {

            applicationId: applicationId

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

}


module.exports = {

    createActivityLog,
    getActivityLogs

};