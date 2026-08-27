const crypto = require("crypto");
const prisma = require("../config/db.config.js");

async function apiKeyMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "API key is required",
                status: "failed",
            });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid authorization format",
                status: "failed",
            });
        }

        const apiKey = authHeader.substring(7).trim();

        if (!apiKey) {
            return res.status(401).json({
                message: "API key is required",
                status: "failed",
            });
        }

        const keyHash = crypto
            .createHash("sha256")
            .update(apiKey)
            .digest("hex");

        const apiKeyRecord = await prisma.apiKey.findUnique({
            where: {
                keyHash,
            },
        });

        if (!apiKeyRecord) {
            return res.status(401).json({
                message: "Invalid API key",
                status: "failed",
            });
        }

        if (!apiKeyRecord.isActive) {
            return res.status(401).json({
                message: "API key is inactive",
                status: "failed",
            });
        }

        if (
            apiKeyRecord.expiresAt &&
            apiKeyRecord.expiresAt <= new Date()
        ) {
            return res.status(401).json({
                message: "API key has expired",
                status: "failed",
            });
        }

        await prisma.apiKey.update({
            where: {
                id: apiKeyRecord.id,
            },
            data: {
                lastUsedAt: new Date(),
            },
        });

        req.apiKey = apiKeyRecord;

        next();

    } catch (error) {
        console.error("API key authentication error:", error);

        return res.status(500).json({
            message: "API authentication failed",
            status: "failed",
        });
    }
}

module.exports = apiKeyMiddleware;