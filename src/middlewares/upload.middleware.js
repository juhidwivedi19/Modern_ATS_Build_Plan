const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    console.log("FILE NAME:", file.originalname);
    console.log("FILE MIME:", file.mimetype);

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const allowedExtensions = [".pdf", ".doc", ".docx"];

    const extension = file.originalname
        .toLowerCase()
        .substring(file.originalname.lastIndexOf("."));

    if (
        allowedTypes.includes(file.mimetype) ||
        allowedExtensions.includes(extension)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF, DOC and DOCX files are allowed"), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});

const uploadMiddleware = upload.single("resume");

module.exports = {
    uploadMiddleware
};