const SKILLS = [
    // Programming languages
    "c",
    "c++",
    "java",
    "python",
    "javascript",
    "typescript",
    "go",
    "rust",
    "php",

    // Frontend
    "html",
    "css",
    "react",
    "next.js",
    "angular",
    "vue",
    "tailwind",
    "bootstrap",

    // Backend
    "node.js",
    "express",
    "spring boot",
    "django",
    "flask",

    // Databases
    "mongodb",
    "mysql",
    "postgresql",
    "redis",
    "sql",

    // Cloud / DevOps
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "git",
    "github",

    // Other
    "rest api",
    "graphql",
    "socket.io",
    "prisma",
    "tensorflow",
    "pytorch"
];

function extractSkills(text) {

    const lowerText = text.toLowerCase();

    const foundSkills = [];

    for (const skill of SKILLS) {

        const escapedSkill = skill.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(
            `\\b${escapedSkill}\\b`,
            "i"
        );

        if (regex.test(lowerText)) {
            foundSkills.push(skill);
        }
    }

    return foundSkills;
}

module.exports = {
    extractSkills
};