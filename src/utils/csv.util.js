const fs = require("fs");
const path = require("path");

// Convert array of objects into CSV
function convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return "";
    }

    const headers = Object.keys(data[0]);

    const rows = data.map(function (item) {
        return headers.map(function (header) {
            const value = item[header];

            if (value === null || value === undefined) {
                return "";
            }

            if (typeof value === "object") {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }

            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(",");
    });

    return [
        headers.join(","),
        ...rows
    ].join("\n");
}


// Save CSV file
function saveCSV(data, fileName) {
    const reportsDirectory = path.join(
        process.cwd(),
        "reports"
    );

    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDirectory)) {
        fs.mkdirSync(reportsDirectory, {
            recursive: true
        });
    }

    const filePath = path.join(
        reportsDirectory,
        fileName
    );

    const csv = convertToCSV(data);

    fs.writeFileSync(
        filePath,
        csv,
        "utf8"
    );

    return filePath;
}


module.exports = {
    convertToCSV,
    saveCSV
};