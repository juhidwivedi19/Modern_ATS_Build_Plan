const {
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const {
    getSignedUrl: createSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const s3 = require("../config/s3.config.js");

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Download file from S3
async function downloadFromS3(key) {

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });

    const response = await s3.send(command);

    const chunks = [];

    for await (const chunk of response.Body) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

// Upload file to S3
async function uploadToS3(file, key) {

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    });

    await s3.send(command);

    return key;
}


// Delete file from S3
async function deleteFromS3(key) {

    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });

    await s3.send(command);
}


// Generate temporary signed URL for downloading resume
async function getSignedUrl(key) {

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });

    // URL will remain valid for 5 minutes
    const signedUrl = await createSignedUrl(
        s3,
        command,
        {
            expiresIn: 300
        }
    );

    return signedUrl;
}


module.exports = {
    uploadToS3,
    deleteFromS3,
    getSignedUrl,
    downloadFromS3
};