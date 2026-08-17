const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
const rolePermissions = {
    OWNER: [
        "ORGANIZATION_VIEW",
        "ORGANIZATION_UPDATE",
        "ORGANIZATION_DELETE",

        "MEMBER_VIEW",
        "MEMBER_INVITE",
        "MEMBER_REMOVE",
        "MEMBER_ROLE_UPDATE",

        "DEPARTMENT_VIEW",
        "DEPARTMENT_CREATE",
        "DEPARTMENT_UPDATE",
        "DEPARTMENT_DELETE",

        "JOB_VIEW",
        "JOB_CREATE",
        "JOB_UPDATE",
        "JOB_PUBLISH",
        "JOB_ARCHIVE",

        "APPLICATION_VIEW",
        "APPLICATION_UPDATE",
        "APPLICATION_MOVE"
    ],

    ADMIN: [
        "ORGANIZATION_VIEW",
        "ORGANIZATION_UPDATE",

        "MEMBER_VIEW",
        "MEMBER_INVITE",
        "MEMBER_REMOVE",
        "MEMBER_ROLE_UPDATE",

        "DEPARTMENT_VIEW",
        "DEPARTMENT_CREATE",
        "DEPARTMENT_UPDATE",
        "DEPARTMENT_DELETE",

        "JOB_VIEW",
        "JOB_CREATE",
        "JOB_UPDATE",
        "JOB_PUBLISH",
        "JOB_ARCHIVE",

        "APPLICATION_VIEW",
        "APPLICATION_UPDATE",
        "APPLICATION_MOVE"
    ],

    RECRUITER: [
        "ORGANIZATION_VIEW",
        "MEMBER_VIEW",
        "DEPARTMENT_VIEW",

        "JOB_VIEW",
        "JOB_CREATE",
        "JOB_UPDATE",
        "JOB_PUBLISH",
        "JOB_ARCHIVE",

        "APPLICATION_VIEW",
        "APPLICATION_UPDATE",
        "APPLICATION_MOVE"
    ],

    INTERVIEWER: [
        "ORGANIZATION_VIEW",
        "MEMBER_VIEW",
        "DEPARTMENT_VIEW",

        "JOB_VIEW",

        "APPLICATION_VIEW"
    ],

    MEMBER: [
        "ORGANIZATION_VIEW",
        "MEMBER_VIEW",
        "DEPARTMENT_VIEW",

        "JOB_VIEW",

        "APPLICATION_VIEW"
    ]
};

    for (const [role, permissions] of Object.entries(rolePermissions)) {
        for (const permission of permissions) {
            await prisma.rolePermission.upsert({
                where: {
                    role_permission: {
                        role: role,
                        permission: permission
                    }
                },
                update: {},
                create: {
                    role: role,
                    permission: permission
                }
            });
        }
    }

    console.log("Role permissions seeded successfully");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });