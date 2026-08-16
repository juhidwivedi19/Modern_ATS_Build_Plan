function extractExperience(text) {
    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const experience = [];

    const experienceKeywords = [
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "work history",
        "internship",
        "internships"
    ];

    let insideExperience = false;

    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        // Start of experience section
        if (
            experienceKeywords.some(keyword =>
                lowerLine === keyword ||
                lowerLine.includes(keyword)
            )
        ) {
            insideExperience = true;
            continue;
        }

        // Stop when another major section starts
        if (
            insideExperience &&
            /^(education|skills|projects|certifications|achievements|contact|summary|objective)$/i.test(line)
        ) {
            break;
        }

        if (insideExperience) {
            experience.push(line);
        }
    }

    return experience;
}

module.exports = {
    extractExperience
};