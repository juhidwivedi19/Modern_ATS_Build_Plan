function roleAuthorizationMiddleware(allowedRoles) {
    return async function (req, res, next) {
        try {
            const { organizationMember } = req;

            
            if (!organizationMember) {
                return res.status(403).json({
                    message: "Organization member information is missing",
                    status: "failed"
                });
            }

         
            if (!allowedRoles.includes(organizationMember.role)) {
                return res.status(403).json({
                    message: "Insufficient permissions",
                    status: "failed"
                });
            }

            next();

        } catch (error) {
            console.error("Error:", error);

            return res.status(500).json({
                message: "Internal server error",
                status: "failed"
            });
        }
    };
}

module.exports={
    roleAuthorizationMiddleware
}
