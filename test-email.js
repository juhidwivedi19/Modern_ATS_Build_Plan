const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function makeOwner() {
    await prisma.organizationMember.update({
        where: {
            id: 3
        },
        data: {
            role: "OWNER"
        }
    });

    console.log("User is now OWNER");
}

makeOwner()
    .catch(console.error)
    .finally(() => prisma.$disconnect());