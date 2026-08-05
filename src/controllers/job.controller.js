const prisma = require("../config/db.config.js");

//1:-Create job controller
    async function createJobController(req,res){
        try{
            //Get organization ID from URL params
            const organizationId = parseInt(req.params.organizationId);

            //get loggedin user's Id
            constcreatedById=req.user.Id;

            //Get job details from req.body
            const{
                title,
                description,
                salary,
                employmentType,
                requiredSkills,
                experience,
                location,
                departmentId} = req.body;

                //Validate required fields
                if(!organizationId ||
                    !title ||
                    !description||
                    !requiredSkills||
                    !experience||
                    !location||
                    !departmentId
                ){
                    return res.status(400).json({
                        message:"Missing required fields",
                        status:"Error"
                    });
                }
        
                //check if department exist and belongs to this organization
                const department = await prisma.department.findFirst({
                    where:{
                        Id: parseInt(departmentId),
                        organizationId: organizationId
                    }
                });

                if(!department){
                     return res.status(404).json({
                    message: "Department not found in this organization",
                    status: "failed"
            });
                }
                //create job in database
        const job = await prisma.job.create({
         data: {
                title,
                description,
                location,
                salary: salary ? parseFloat(salary) : null,
                employmentType,
                requiredSkills: requiredSkills || null,
                experience: experience ? parseInt(experience) : null,
                organizationId,
                departmentId: parseInt(departmentId),
                createdById
            },
            include: {
                department: true,
                organization: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
            

            return res.status(201).json({
                message:"Job created successfully",
                status:"success"
            })
        }catch(error){
            console.error("Error creating job:", error);
            return res.status(400).json({
                message:"Error creating job",
                status:"error"
            })
        }
    }

//2:get jobs controller
     async function getJobController(req,res){
    try{
    const organizationId = parseInt(req.params.organizationId);

    //Validate organization id
     if (!organizationId) {
            return res.status(400).json({
                message: "Organization ID is required",
                status: "failed"
            });
        }
    
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
        where:{
          id: organizationId
        }
    })

         if (!organization) {
            return res.status(404).json({
                message: "Organization not found",
                status: "failed"
            });
        }
 
   // Fetch all jobs belonging to organization
        const jobs = await prisma.job.findMany({
         where: {
        organizationId: organizationId
          },
           include: {
                department: true,

                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
});
     
       // Check if no jobs exist
        if (jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found for this organization",
                status: "failed"
            });
        }   

    return res.status(201).json({
        message:"Jobs fetched successfully",
        status:"Success"
    })
    }catch(error){
        console.error("Error fetching jobs",error);
        return res.status(400).json({
            message:"Internal server error",
            status:"failed"
        });
    }
 } 



 //3:GET single job controller
      async function getJobController(req,res){
         try{
           const organizationId = parseInt(req.params.organizationId)

           const jobId = parseInt(req.params.jobId)

           //validate id's
           if(!organizationId || !jobId){
            return res.status(400).json({
                message:"Organization Id and Job Id are required",
                status:"failed"
            })
           }

        // Find job belonging to this organization
        const job = await prisma.job.findFirst({
            where: {
                id: jobId,
                organizationId: organizationId
            },
            include: {
                department: true,

                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Check if job exists
        if (!job) {
            return res.status(404).json({
                message: "Job not found in this organization",
                status: "failed"
            });
        }

        // Return job
        return res.status(200).json({
            message: "Job fetched successfully",
            status: "success",
            job: job
        });
           }catch(error){
           console.error("Error fetching job",error);
           return res.status(400).json({
            message:"Internal server error",
            status:"failed"
             })
           }
         }


//3:UPDATE job controller
async function updateJobController(req,res){
    try{
        const organizationId = parseInt(req.params.organizationId)
        const jobId = parseInt(req.params.jobId)

        //validate ids
        if(!organizationId || !jobId){
            return res.status(400).json({
                message:"organization Id and job Id both are required",
                status:"failed"
            });
        }
        //get updated fields from request body
        const{
            title,description,
            salary,
            employmentType,
            requiredSkills,
            experience,
            location,
            departmentId
        } = req.body;

        // check if job exist and belong to this organization
        const existingjob = await prisma.job.findFirst({
            where:{
                id:jobId,
                organizationId: organizationId
            }
        });
        if(!existingJob){
            return res.status(404).json({
                message:"Job not found in this organization",
                status:"failed"
            });
        }

          //if department is provided check department
          if(department) {
            const department= await prisma.department.findFirst({
                where:{
                        id: parseInt(departmentId),
                        organizationId: organizationId
                }
            });

              if (!department) {
                return res.status(404).json({
                    message: "Department not found in this organization",
                    status: "failed"
                });
            }
        
          } 


             // Update Job----------------------
        const updatedJob = await prisma.job.update({
            where: {
                id: jobId
            },
            data: {
                title,
                description,
                salary: salary !== undefined
                    ? (salary === null ? null : parseFloat(salary))
                    : undefined,
                employmentType,
                requiredSkills,
                experience: experience !== undefined
                    ? (experience === null ? null : parseInt(experience))
                    : undefined,
                location,
                departmentId: departmentId !== undefined
                    ? parseInt(departmentId)
                    : undefined
            },
            include: {
                department: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Job updated successfully",
            status: "success",
            job: updatedJob
        });
    }catch(error){
       console.error("Error updating job",error);

       return res.status(500).json({
        message:"Internal server error",
        status:"failed"
       });
    }
}


//4:PUBLISH job controller
 async function publishJobController(req,res){
    try{
        const organizationId = parseInt(req.params.organizationId);
    const jobId = parseInt(req.params.jobId);

    //validate IDs
    if(!organizationId || !jobId){
        return res.status(400).json({
            message:"Organization and Job ID's are required",
            status:"failed"
        });
    }

    //Find job belong to thos organization
    const job= await prisma.job.findFirst({
       where:{
        id:jobId,
        organizationId:organizationId
       }
    });

    //check if job exists
    if(!job){
        return res.status(404).json({
            message:"Job not found in this organization",
            status:"failed"
        });
    }

    //check if already published
    if(job.status=="PUBLISHED"){
        return res.status(400).json({
            message:"job is already published",
            status:"failed"
        });
    }

    //publish job
    const publishedJob = await prisma.job.update({
        where:{
            id:jobId
        },
        data:{
            status:"PUBLISHED"
        },
        include:{
            department:true,
             createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
        }
    })

    return res.status(200).json({
        message:"Job published successfully",
        status:"success",
        job: publishedJob
    });

}catch(error){
  console.error("Error published job:",error)

  return res.status(500).json({
    message:"Internal server error",
    status:"failed"
  });
}

 }

module.exports={
    createJobController,
    getJobsController,
    getJobController,
    updateJobController,
    publishJobController
}