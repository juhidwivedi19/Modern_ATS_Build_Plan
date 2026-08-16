const { Worker } = require("bullmq");
const { downloadFromS3 } = require("../services/s3.service.js");
const { extractText } = require("../services/resume-parser.service.js");
const { extractSkills } = require("../services/resume-skills.service.js");
const {extractEducation} = require("../services/resume-education.service.js");
const {extractExperience} = require("../services/resume-experience.service.js");
const {extractProjects} = require("../services/resume-projects.service.js");
const { extractMetadata } = require("../services/resume-metadata.service.js");

const prisma = require("../config/db.config.js");

const worker = new Worker(
    "resume-processing",

    async (job) => {
        const { resumeId, fileKey, fileType } = job.data;

        console.log("Processing resume:", resumeId);

        try {
            // 1. Mark resume as PROCESSING
            await prisma.resume.update({
                where: {
                    id: resumeId
                },
                data: {
                    processingStatus: "PROCESSING"
                }
            });

            // 2. Download resume from S3
            const fileBuffer = await downloadFromS3(fileKey);

            console.log("Resume downloaded from S3");

            // 3. Extract text
            const text = await extractText(fileBuffer, fileType);

            console.log("Resume text extracted");

            if (!text || !text.trim()) {
                throw new Error("No readable text found in resume");
            }

            console.log(`Extracted ${text.length} characters`);

            // 4. Extract metadata
            const metadata = extractMetadata(text);
              console.log(
                "Resume metadata extracted:",
                metadata
            );

        //from resume -skills service
        const skills = extractSkills(text);
            console.log("Resume skills extracted:", skills);
   
        //from resume-education service
        const education = extractEducation(text);
           console.log(
           "Resume education extracted:",
            education
            );

        //from  resume-experience.service.js
        const experience = extractExperience(text);
            console.log(
             "Resume experience extracted:",
             experience
          );
       //from resume-projects.js
    
        const projects = extractProjects(text);
              console.log(
                "Resume projects extracted:",
                 projects
             );

     // 5. Create searchable text
         const searchText = [
            text,
            metadata.name,
            metadata.email,
            metadata.phone,
            ...skills,
            education,
           ...experience,
            ...projects
          ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

            console.log("Search text created");

            // 6. Save everything to PostgreSQL
            await prisma.resume.update({
                where: {
                    id: resumeId
                },
                data: {
                    extractedText: text,
                    searchText: searchText,

                    name: metadata.name,
                    email: metadata.email,
                    phone: metadata.phone,

                    skills:skills,
                    education:education,
                    experience:experience,
                    projects:projects,

                    processingStatus: "COMPLETED"
                }
            });

            console.log("Extracted text saved to database");
            console.log("Resume processing completed");

            return {
                success: true
            };

        } catch (error) {

            // 7. Mark resume as FAILED
            await prisma.resume.update({
                where: {
                    id: resumeId
                },
                data: {
                    processingStatus: "FAILED"
                }
            });

            console.error(
                "Resume processing failed:",
                error.message
            );

            // 8. Tell BullMQ job failed
            throw error;
        }
    },

    {
        connection: {
            host: "localhost",
            port: 6379
        }
    }
);

// BullMQ completed event
worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

// BullMQ failed event
worker.on("failed", (job, err) => {
    console.error(
        `Job ${job?.id} failed:`,
        err.message
    );
});

console.log("Resume worker started");