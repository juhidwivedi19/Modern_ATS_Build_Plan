function extractEducation(text) {
    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const educationKeywords = [
        "education",
        "academic",
        "qualification",
        "b.tech",
        "btech",
        "m.tech",
        "mtech",
        "b.e",
        "bca",
        "mca",
        "mba",
        "b.sc",
        "m.sc",
        "bachelor",
        "master",
        "university",
        "college",
        "school"
    ];

    const education = [];

    let insideEducationSection = false;

    for (const line of lines) {

        const lowerLine = line.toLowerCase();

        // Start education section
        if (
            lowerLine === "education" ||
            lowerLine.includes("education") ||
            lowerLine.includes("academic qualification")
        ) {
            insideEducationSection = true;
            continue;
        }

        // Stop at another major section
        if (
            insideEducationSection &&
            (
                lowerLine === "experience" ||
                lowerLine.includes("work experience") ||
                lowerLine === "projects" ||
                lowerLine === "skills" ||
                lowerLine === "certifications"
            )
        ) {
            break;
        }

        if (insideEducationSection) {
            education.push(line);
        }
    }

    // If no education section was detected,
    // look for lines containing common education keywords.
    if (education.length === 0) {
        for (const line of lines) {

            const lowerLine = line.toLowerCase();

            if (
                educationKeywords.some(keyword =>
                    lowerLine.includes(keyword)
                )
            ) {
                education.push(line);
            }
        }
    }

    return education;
}

module.exports = {
    extractEducation
};