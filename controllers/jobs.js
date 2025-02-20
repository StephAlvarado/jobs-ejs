const Job = require("../models/Job");
//const parseVErr = require("../utils/parseValidationErrs");
const flash = require("connect-flash")


//get jobs
exports.getJobs= async (req, res) => {
  try{
    const jobs = await Job.find({
      createdBy: req.user._id
    });
    res.render("jobs", {jobs});
  } catch(error){
    console.error(error);
    res.status(500).send("Server error")
  }
};





// add new job 
exports.createJob = async (req, res) => {
 
try{
  const { company, position, status } = req.body;
  if(!company || !position || !status) {
    req.flash("error", "All fields are required.")
    return res. redirect("/jobs/new")
  }
  await Job.create({
    company,
    position,
    status,
    createdBy: req.user._id,
  });
  req.flash("success", "Job added successfully.")
  res.redirect("/jobs")
} catch (error){
  console.error(error)
  req.flash("error", "Error adding job.")
  res.redirect("/jobs/new");
}
};



// job creation form (Rendered)
exports.newJobForm = (req, res) => {
  res.render("job", { job: null });
};



// edit job form (Rendered)
exports.editJobForm = async (req, res) => {
  try{
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    if(!job) {
      return res.status(404).send("Job not found or unauthorized");
    }
    res.render("job", { job });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};


//update Job 
exports.updateJob = async (req, res) => {
  try{
    const {company, position, status } = req.body;
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
  if (!job) {
    req.flash("errpr", "Job not found or authorized.")
    return res.redirect("/jobs")
  }
  job.company = company;
  job.position = position;
  job.status = status;
  await job.save();
  
  req.flash("succcess", "Job updated successfully.");
  res.redirect("/jobs")
  } catch (error) {
    console.error(error)
    req.flash("error", "Error updating Job.")
    res.redirect(`/jobs/edit/${req.params.id}`);
  }
};



//delete job 
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    if(!job){
      req.flash("error", "Job not found or unauthorized.")
      return res.redirect("/jobs");
    }

    await Job.deleteOne({
      _id: req.params.id
    });
    req.flash("success", "Job deleted successfully.")
    res.redirect("/jobs")
  } catch (error) {
    req.flash("error", "Error deleting job.");
    res.redirect("/jobs");
  }
};



  


//  module.exports = {
//   getJobs,
//   createJob,
//   showNewJobForm,
//   showEditJobForm,
//   updateJob,
//   deleteJob,
// };















