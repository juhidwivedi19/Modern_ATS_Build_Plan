const prisma=require("../config/db.config.js");

//controller for updation of candidate profile

async function updateCandidateController(req,res){
    try{

        const candidateId= parseInt(req.params.candidateId)

        
        // Validate candidate ID
        if (isNaN(candidateId)) { //NAN-not a number
            return res.status(400).json({
                message: "Valid candidate ID is required",
                status: "failed"
            });
        }
       
          // Find candidate in database
        const candidate = await prisma.candidate.findUnique({
            where: {
                id: candidateId
            }
        });

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found",
                status: "failed"
            });
        }

        // Only these fields are allowed to be updated.
        // Email and phone intentionally cannot be changed.
        const {
            name,
            location,
            education,
            linkedin,
            portfolio
        } = req.body;

        const updatedCandidate = await prisma.candidate.update({
            where: {
                id: candidateId
            },
            data: {
                name,
                location,
                education,
                linkedin,
                portfolio
            }
        });

        return res.status(200).json({
            message: "Candidate profile updated successfully",
            status: "success",
            candidate: updatedCandidate
        });


    }catch(error){
        console.error("Error updating candidate profile:", error)

        return res.status(500).json({
            message:"Internal server error",
            status:"Failed"

        })
    }
}

module.exports={
  updateCandidateController
}