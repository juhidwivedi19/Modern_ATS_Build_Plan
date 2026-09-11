const prisma = require("../config/db.config.js");
const { Prisma } = require("@prisma/client");

async function searchCandidates({
    skills,
    location,
    education,
    experience,
    company,
    page = 1,
    limit = 10,
}) {
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    const offset = (page - 1) * limit;

    const conditions = [];

    if (skills) {
        conditions.push(
            Prisma.sql`
                to_tsvector(
                    'english',
                    COALESCE(r."searchText", '')
                )
                @@ plainto_tsquery(
                    'english',
                    ${skills}
                )
            `
        );
    }

    if (education) {
        conditions.push(
            Prisma.sql`
                to_tsvector(
                    'english',
                    COALESCE(r."searchText", '')
                )
                @@ plainto_tsquery(
                    'english',
                    ${education}
                )
            `
        );
    }

    if (experience) {
        conditions.push(
            Prisma.sql`
                to_tsvector(
                    'english',
                    COALESCE(r."searchText", '')
                )
                @@ plainto_tsquery(
                    'english',
                    ${experience}
                )
            `
        );
    }

    if (company) {
        conditions.push(
            Prisma.sql`
                to_tsvector(
                    'english',
                    COALESCE(r."searchText", '')
                )
                @@ plainto_tsquery(
                    'english',
                    ${company}
                )
            `
        );
    }

    if (location) {
        conditions.push(
            Prisma.sql`
                c."location" ILIKE ${`%${location}%`}
            `
        );
    }

    const whereClause =
        conditions.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
            : Prisma.empty;

    const candidatesQuery = Prisma.sql`
        SELECT DISTINCT
            c.id,
            c.name,
            c.email,
            c.phone,
            c.location,
            c.education,
            c."createdAt",
            c."updatedAt"
        FROM "Candidate" c
        INNER JOIN "Resume" r
            ON r."candidateId" = c.id
        ${whereClause}
        ORDER BY c."createdAt" DESC
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    const candidates = await prisma.$queryRaw(candidatesQuery);

    const countQuery = Prisma.sql`
        SELECT COUNT(DISTINCT c.id)::int AS count
        FROM "Candidate" c
        INNER JOIN "Resume" r
            ON r."candidateId" = c.id
        ${whereClause}
    `;

    const totalResult = await prisma.$queryRaw(countQuery);

    const total = totalResult[0]?.count || 0;

    const totalPages = Math.ceil(total / limit);

    return {
        candidates,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
}

module.exports = {
    searchCandidates,
};