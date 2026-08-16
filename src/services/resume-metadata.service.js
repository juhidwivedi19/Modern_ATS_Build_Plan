function extractMetadata(text) {

    // Extract email
    const emailMatch = text.match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
    );

    // Extract Indian phone number
    const phoneMatch = text.match(
        /(?:\+91[-\s]?)?[6-9]\d{9}/
    );

    // Basic name extraction
    const lines = text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    let name = null;

    for (const line of lines.slice(0, 10)) {

        // Ignore lines containing email
        if (line.includes("@")) {
            continue;
        }

        // Ignore lines containing phone numbers
        if (/\d{7,}/.test(line)) {
            continue;
        }

        // Name should normally contain only letters and spaces
        if (
            /^[A-Za-z]+(?:\s+[A-Za-z]+){1,3}$/.test(line)
        ) {
            name = line;
            break;
        }
    }

    return {
        name,
        email: emailMatch ? emailMatch[0] : null,
        phone: phoneMatch ? phoneMatch[0] : null
    };
}

module.exports = {
    extractMetadata
};