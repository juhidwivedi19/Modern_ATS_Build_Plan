function extractProjects(text) {
    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const projects = [];

    const projectKeywords = [
        "projects",
        "project",
        "personal projects",
        "academic projects",
        "key projects"
    ];

    let insideProjects = false;

    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        // Start of Projects section
        if (
            projectKeywords.some(keyword =>
                lowerLine === keyword
            )
        ) {
            insideProjects = true;
            continue;
        }

        // Stop at another major section
        if (
            insideProjects &&
            /^(experience|work experience|education|skills|certifications|achievements|contact|summary|objective)$/i.test(line)
        ) {
            break;
        }

        if (insideProjects) {
            projects.push(line);
        }
    }

    return projects;
}

module.exports = {
    extractProjects
};