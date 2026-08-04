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
            "DEPARTMENT_DELETE"
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
            "DEPARTMENT_DELETE"
        ],

        RECRUITER: [
            "ORGANIZATION_VIEW",
            "MEMBER_VIEW",
            "DEPARTMENT_VIEW"
        ],

        INTERVIEWER: [
            "ORGANIZATION_VIEW",
            "MEMBER_VIEW",
            "DEPARTMENT_VIEW"
        ],

        MEMBER: [
            "ORGANIZATION_VIEW",
            "MEMBER_VIEW",
            "DEPARTMENT_VIEW"
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