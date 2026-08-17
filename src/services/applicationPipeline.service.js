const prisma = require("../config/db.config.js");

const allowedTransitions = {
  APPLIED: ["SCREENING", "REJECTED", "WITHDRAWN"],

  SCREENING: [
    "TECHNICAL_INTERVIEW",
    "REJECTED",
    "WITHDRAWN",
  ],

  TECHNICAL_INTERVIEW: [
    "HR_INTERVIEW",
    "REJECTED",
    "WITHDRAWN",
  ],

  HR_INTERVIEW: [
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
  ],

  OFFER: [
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ],

  HIRED: [],

  REJECTED: [],

  WITHDRAWN: [],
};



function isValidTransition(currentStatus, newStatus) {
  const allowedNextStatuses = allowedTransitions[currentStatus];

  if (!allowedNextStatuses) {
    return false;
  }

  return allowedNextStatuses.includes(newStatus);
}



async function moveApplication(applicationId, newStatus, performedById) {

  // 1. Find the application
  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
  });

  // 2. Check if application exists
  if (!application) {
    throw new Error("Application not found");
  }

  // 3. Get current status
  const currentStatus = application.status;

  // 4. Check if transition is allowed
  const valid = isValidTransition(currentStatus, newStatus);

  if (!valid) {
    throw new Error(
      `Invalid transition: ${currentStatus} → ${newStatus}`
    );
  }

  // 5. Update application + create activity log
  const result = await prisma.$transaction(async (tx) => {

    const updatedApplication = await tx.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status: newStatus,
      },
    });

    await tx.activityLog.create({
      data: {
        applicationId: applicationId,
        performedById: performedById,
        action: "STAGE_CHANGED",
        oldStatus: currentStatus,
        newStatus: newStatus,
      },
    });

    return updatedApplication;
  });

  // 6. Return updated application
  return result;
}  



async function getApplicationActivity(applicationId){
      //1.Check if application Exist 
      const application = await prisma.application.findUnique({
        where:{
            id:applicationId
        }
             });
        if (!application){
         throw new Error("Application not found")
        }

    // 2. Get activity logs
    const activities = await prisma.activityLog.findMany({
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

    // 3. Return activity history
    return activities;
}
    
module.exports = {
  isValidTransition,
  moveApplication,
  getApplicationActivity
};