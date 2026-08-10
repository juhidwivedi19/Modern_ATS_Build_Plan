const prisma = require("../config/db.config.js");

const { uploadToS3 } = require("../services/s3.service.js");


// Controller for uploading candidate resume
async function uploadResume(req, res) {
    try {

        const candidateId = parseInt(req.params.candidateId);

        // Validate candidate ID
        if (isNaN(candidateId)) {
            return res.status(400).json({
                message: "Valid candidate ID is required",
                status: "failed"
            });
        }

        // Find candidate in database
        const candidate = await prisma.candidate.findUnique({
            where: {
                id: candidateId
            }
        });

        // Candidate does not exist
        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found",
                status: "failed"
            });
        }


        // Check whether Multer received a file
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required",
                status: "failed"
            });
        }


        // Create a unique file name
        const uniqueName =
            Date.now() + "-" + req.file.originalname;


        // Create S3 object key
        // Example: resumes/12/1723456789-resume.pdf
        const key = `resumes/${candidateId}/${uniqueName}`;


        // Upload resume to AWS S3
        const fileKey = await uploadToS3(
            req.file,
            key
        );


        // Save resume information in PostgreSQL
        const resume = await prisma.resume.create({
            data: {
                candidateId: candidateId,
                fileName: req.file.originalname,
                fileKey: fileKey,
                fileType: req.file.mimetype,
                fileSize: req.file.size
            }
        });


        // Send success response
        return res.status(201).json({
            message: "Resume uploaded successfully",
            status: "success",
            data: resume
        });


    } catch (error) {

        console.error("Resume upload error:", error);

        return res.status(500).json({
            message: "Failed to upload resume",
            status: "failed"
        });
    }
}


module.exports = {
    uploadResume
};