const interviewService = require("../services/interview.service");


//=========================
//Schedule Interview
//========================
async function scheduleInterviewController(req, res) {
  try {
    const {
      applicationId,
      type,
      scheduledAt,
      duration,
      meetingLink,
    } = req.body;

    const createdById = req.user.id;

    const interview = await interviewService.scheduleInterview({
      applicationId,
      type,
      scheduledAt,
      duration,
      meetingLink,
      createdById,
    });

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      interview,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
//=====================================
//Create assign Interviewer Controller
//======================================
async function assignInterviewerController(req, res) {
  try {
    const { interviewId } = req.params;
    const { userId } = req.body;

    const assignment = await interviewService.assignInterviewer({
      interviewId: Number(interviewId),
      userId: Number(userId),
    });

    return res.status(201).json({
      success: true,
      message: "Interviewer assigned successfully",
      assignment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

//======================
//add Controller to remove INTERVIEWER
//we are using this that if the owner or HR  wants to remove assigned interviewer then they can do
//=================================
  async function removeInterviewerController(req, res) {
  try {
    const { interviewId, userId } = req.params;

    const result = await interviewService.removeInterviewer({
      interviewId: Number(interviewId),
      userId: Number(userId),
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


//=====================================
//GET SINGLE INTERVIEW
//===================================
async function getInterviewByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    const interview = await interviewService.getInterviewById(
      Number(interviewId)
    );

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


//========================
//Get All Interview
//========================

async function getAllInterviewsController(req, res) {
  try {
    const interviews = await interviewService.getAllInterviews();

    return res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


//=======================
//Update interview
//========================
async function updateInterviewController(req,res){
  try{

      const {interviewId} = req.params;

      const{
        type,
        scheduledAt,
        duration,
        meetingLink,
      } = req.body;

      const interview = await interviewService.updateInterview({
        interviewId: Number(interviewId),
        type,
        scheduledAt,
        duration,
        meetingLink
      })

    return res.status(200).json({
      message:"Interview updated successfully",
     status:"Success",
     interview
    });
  }catch(error){
    return res.status(400).json({
      message:"Internal server error",
      status:"failed"
    })
  }
}


//========================
//cancel Interview
//==========================
async function cancelInterviewController(req,res){
  try{
    const {interviewId} = req.params;

    const interview = await interviewService.cancelInterview(
      Number(interviewId)
    );
   
return res.status(200).json({
  message:"Interview Cancelled successfully",
  status:"success",
  interview,
})
      }
       catch(error){
      return res.status(400).json({
        message:error.message,
        status:"failed"
      });
    }
    }
  
module.exports = {
  scheduleInterviewController,
  assignInterviewerController,
  removeInterviewerController,
  getInterviewByIdController,
  getAllInterviewsController,
  updateInterviewController,
  cancelInterviewController
};