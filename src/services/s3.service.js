const {
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = require("../config/s3.config.js");

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

async function uploadToS3(file, key) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,  //This "file.buffer" is important for your Multer setup.
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return key;
}

async function deleteFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3.send(command);
}

module.exports = {
  uploadToS3,
  deleteFromS3,
};