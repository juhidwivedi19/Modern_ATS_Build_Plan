const {
  searchCandidates,
} = require("../services/candidateSearch.service.js");

async function searchCandidatesController(req, res) {
  try {
    const {
      skills,
      location,
      education,
      experience,
      company,
      page,
      limit,
    } = req.query;

    const result = await searchCandidates({
      skills,
      location,
      education,
      experience,
      company,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.candidates,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Candidate search error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  searchCandidatesController,
};