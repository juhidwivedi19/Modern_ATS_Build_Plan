const crypto = require("crypto");
const prisma = require("../config/db.config.js");

function generateApiKey() {
    return "ats_" + crypto.randomBytes(32).toString("hex");
}

function hashApiKey(apiKey) {
    return crypto
        .createHash("sha256")
        .update(apiKey)
        .digest("hex");
}

async function createApiKey({
    organizationId,
    name,
    expiresAt,
}) {
    if (!organizationId) {
        throw new Error("Organization ID is required");
    }

    if (!name || !name.trim()) {
        throw new Error("API key name is required");
    }

    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    const createdKey = await prisma.apiKey.create({
        data: {
            organizationId,
            name: name.trim(),
            keyHash,
            expiresAt: expiresAt
                ? new Date(expiresAt)
                : null,
        },
        select: {
            id: true,
            name: true,
            expiresAt: true,
            isActive: true,
            createdAt: true,
        },
    });

    return {
        ...createdKey,
        apiKey,
    };
}

module.exports = {
    createApiKey,
    hashApiKey,
};