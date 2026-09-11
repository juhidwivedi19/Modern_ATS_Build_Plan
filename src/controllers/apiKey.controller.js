const { createApiKey } = require("../services/apiKey.service.js");
const prisma = require("../config/db.config.js");

async function createApiKeyController(req, res) {
    try {
        const { name, expiresAt } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed",
            });
        }

        const membership = await prisma.organizationMember.findFirst({
            where: {
                userId: req.user.id,
            },
        });

        if (!membership) {
            return res.status(400).json({
                message: "Organization is required",
                status: "failed",
            });
        }

        const apiKey = await createApiKey({
            organizationId: membership.organizationId,
            name,
            expiresAt,
        });

        return res.status(201).json({
            message: "API key created successfully",
            status: "success",
            data: apiKey,
        });

    } catch (error) {
        console.error("Create API key error:", error);

        return res.status(400).json({
            message: error.message,
            status: "failed",
        });
    }
}

module.exports = {
    createApiKeyController,
};