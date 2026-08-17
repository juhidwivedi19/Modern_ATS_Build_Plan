const prisma = require("../config/db.config.js");

async function hasPermission(userId, organizationId, permission) {
    // 1. Find the user's membership in this organization
    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: userId,
                organizationId: organizationId
            }
        }
    });

    // 2. User is not a member of this organization
    if (!membership) {
        return false;
    }

    // 3. Check whether the user's role has the required permission
    const rolePermission = await prisma.rolePermission.findUnique({
        where: {
            role_permission: {
                role: membership.role,
                permission: permission
            }
        }
    });

    // 4. Permission exists → allowed
    if (rolePermission) {
        return true;
    }

    // 5. Permission doesn't exist → not allowed
    return false;
}

module.exports = {
    hasPermission
};