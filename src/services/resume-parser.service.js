const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function extractText(buffer, fileType) {

    if (fileType === "application/pdf") {

        const data = await pdfParse(buffer);

        return data.text;
    }

    if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {

        const result = await mammoth.extractRawText({
            buffer: buffer
        });

        return result.value;
    }

    throw new Error(`Unsupported file type: ${fileType}`);
}

module.exports = {
    extractText
};