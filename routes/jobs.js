const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const { 
    getJobs, 
    createJob,
    newJobForm,
    editJobForm, 
    updateJob, 
    deleteJob
} =  require("../controllers/jobs");



//Route to get all jobs
router.get("/", auth, getJobs);

// Routed for adding new job 
router.post("/", auth, createJob);
router.get("/new", auth, newJobForm);

// Routes for editing an existing job 
router.get("/edit/:id", auth, editJobForm);
router.post("/update/:id", auth, updateJob);

// Route for deleting a job 
router.post("/delete/:id", auth, deleteJob);

 module.exports = router;

