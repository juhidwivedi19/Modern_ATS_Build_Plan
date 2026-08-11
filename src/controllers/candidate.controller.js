const prisma = require("../config/db.config.js");


// Check whether a value is a valid HTTP/HTTPS URL
function isValidUrl(value) {
    try {
        const url = new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {
        return false;
    }
}


// Controller for updating candidate profile
async function updateCandidateController(req, res) {
    try {

        // 1. Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }


        // 2. Get candidate ID from URL
        const candidateId = Number(req.params.candidateId);


        // 3. Validate candidate ID
        if (!Number.isInteger(candidateId) || candidateId <= 0) {
            return res.status(400).json({
                message: "Valid candidate ID is required",
                status: "failed"
            });
        }


        // 4. Get logged-in user's ID
        const userId = req.user.id;


        // 5. Find candidate
        const candidate = await prisma.candidate.findUnique({
            where: {
                id: candidateId
            }
        });


        // 6. Candidate doesn't exist
        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found",
                status: "failed"
            });
        }


        // 7. Check candidate ownership
        if (candidate.userId !== userId) {
            return res.status(403).json({
                message: "You are not authorized to update this profile",
                status: "failed"
            });
        }


        // 8. Get fields from request body
        const {
            name,
            location,
            education,
            linkedin,
            portfolio
        } = req.body;


        // 9. Validate name
        if (name !== undefined) {

            if (typeof name !== "string") {
                return res.status(400).json({
                    message: "Name must be a string",
                    status: "failed"
                });
            }

            if (name.trim().length < 2) {
                return res.status(400).json({
                    message: "Name must contain at least 2 characters",
                    status: "failed"
                });
            }

            if (name.trim().length > 100) {
                return res.status(400).json({
                    message: "Name cannot exceed 100 characters",
                    status: "failed"
                });
            }
        }


        // 10. Validate location
        if (location !== undefined && location !== null) {

            if (typeof location !== "string") {
                return res.status(400).json({
                    message: "Location must be a string",
                    status: "failed"
                });
            }

            if (location.trim().length > 200) {
                return res.status(400).json({
                    message: "Location cannot exceed 200 characters",
                    status: "failed"
                });
            }
        }


        // 11. Validate education
        if (education !== undefined && education !== null) {

            if (typeof education !== "string") {
                return res.status(400).json({
                    message: "Education must be a string",
                    status: "failed"
                });
            }

            if (education.trim().length > 500) {
                return res.status(400).json({
                    message: "Education cannot exceed 500 characters",
                    status: "failed"
                });
            }
        }


        // 12. Validate LinkedIn URL
        if (
            linkedin !== undefined &&
            linkedin !== null &&
            linkedin !== ""
        ) {

            if (
                typeof linkedin !== "string" ||
                !isValidUrl(linkedin)
            ) {
                return res.status(400).json({
                    message: "Valid LinkedIn URL is required",
                    status: "failed"
                });
            }
        }


        // 13. Validate portfolio URL
        if (
            portfolio !== undefined &&
            portfolio !== null &&
            portfolio !== ""
        ) {

            if (
                typeof portfolio !== "string" ||
                !isValidUrl(portfolio)
            ) {
                return res.status(400).json({
                    message: "Valid portfolio URL is required",
                    status: "failed"
                });
            }
        }


        // 14. Build update object
        const updateData = {};


        if (name !== undefined) {
            updateData.name = name.trim();
        }

        if (location !== undefined) {
            updateData.location =
                location === null
                    ? null
                    : location.trim();
        }

        if (education !== undefined) {
            updateData.education =
                education === null
                    ? null
                    : education.trim();
        }

        if (linkedin !== undefined) {
            updateData.linkedin =
                linkedin === ""
                    ? null
                    : linkedin.trim();
        }

        if (portfolio !== undefined) {
            updateData.portfolio =
                portfolio === ""
                    ? null
                    : portfolio.trim();
        }


        // 15. Make sure at least one field is provided
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "At least one field is required for update",
                status: "failed"
            });
        }


        // 16. Update candidate
        const updatedCandidate = await prisma.candidate.update({
            where: {
                id: candidateId
            },
            data: updateData
        });


        // 17. Send response
        return res.status(200).json({
            message: "Candidate profile updated successfully",
            status: "success",
            candidate: updatedCandidate
        });


    } catch (error) {

        console.error(
            "Error updating candidate profile:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


module.exports = {
    updateCandidateController
};