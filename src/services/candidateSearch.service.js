const prisma = require("../config/db.config.js");

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

  // Build PostgreSQL WHERE conditions independently
  const conditions = [];

  // Skills filter
  if (skills) {
    conditions.push(
      prisma.sql`
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

  // Education filter
  if (education) {
    conditions.push(
      prisma.sql`
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

  // Experience filter
  if (experience) {
    conditions.push(
      prisma.sql`
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

  // Previous company filter
  if (company) {
    conditions.push(
      prisma.sql`
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

  // Location filter
  if (location) {
    conditions.push(
      prisma.sql`
        c."location" ILIKE ${`%${location}%`}
      `
    );
  }

  const whereClause =
    conditions.length > 0
      ? prisma.sql`WHERE ${prisma.join(conditions, " AND ")}`
      : prisma.empty;

  // Get candidates
  const candidates = await prisma.$queryRaw`
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

  // Count total matching candidates
  const totalResult = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT c.id)::int AS count
    FROM "Candidate" c
    INNER JOIN "Resume" r
      ON r."candidateId" = c.id
    ${whereClause}
  `;

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