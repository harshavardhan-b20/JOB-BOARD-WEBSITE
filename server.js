require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded bodies


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

   
    
// Route to count the total number of jobs
app.get('/api/job/count', async (req, res) => {
    try {
        // Count the total number of jobs in the database
        const jobCount = await Job.countDocuments();
        res.json({ totalJobs: jobCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/jobs/:jobTitle', async (req, res) => {
    try {
        const jobTitle = req.params.jobTitle;
        const job = await Job.findOne({ jobTitle }); // Assuming your job title field in the collection is also named jobTitle
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Route to search for jobs based on criteria
app.post('/api/job/search', async (req, res) => {
    try {
        const { jobTitle, jobLocation, jobType } = req.body;

        // Build the search query based on provided criteria
        const query = {};
        if (jobTitle) {
            query.jobTitle = { $regex: jobTitle, $options: 'i' }; // Case-insensitive search
        }
        if (jobLocation && jobLocation !== 'Anywhere') {
            query.jobLocation = jobLocation;
        }
        if (jobType) {
            query.jobType = jobType;
        }

        // Query the database
        const jobs = await Job.find(query);

        // Return the search results
        res.json({ success: true, jobs });
    } catch (error) {
        console.error('Error searching for jobs:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Schema and Model for Job Seekers
const JobSeekerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },

    password: { type: String, required: true }
});

const JobSeeker = mongoose.model('JobSeeker', JobSeekerSchema);

// Schema and Model for Recruiters
const RecruiterSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const Recruiter = mongoose.model('Recruiter', RecruiterSchema);

// Schema and Model for Admins
const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', AdminSchema);

// Schema and Model for Jobs
const JobSchema = new mongoose.Schema({
    email: { type: String, required: true },
    jobTitle: { type: String, required: true },
    jobLocation: { type: String, required: true },
    jobRegion: { type: String },
    jobType: { type: String },
    jobDescription: { type: String },
    education: { type: String },
    applicationLink: { type: String }, 
    companyName: { type: String }, 
    companyTagline: { type: String }, 
    companyDescription: { type: String }, 
    companyWebsite: { type: String }, 
    companyFacebook: { type: String }, 
    companyTwitter: { type: String }, 
    companyLinkedin: { type: String },
    jobLogo: { type: String }
});



const Job = mongoose.model('Job', JobSchema);

// Signup for Job Seekers
app.post('/api/jobseeker/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await JobSeeker.findOne({ email });
        if (existingUser) return res.status(400).json({ email: 'Email already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new JobSeeker({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Signup for Recruiters
app.post('/api/recruiter/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await Recruiter.findOne({ email });
        if (existingUser) return res.status(400).json({ email: 'Email already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new Recruiter({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Signup for Admins
app.post('/api/admin/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await Admin.findOne({ email });
        if (existingUser) return res.status(400).json({ email: 'Email already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new Admin({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Signup for all roles
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        let UserModel;
        switch (role) {
            case 'jobseeker':
                UserModel = JobSeeker;
                break;
            case 'recruiter':
                UserModel = Recruiter;
                break;
            case 'admin':
                UserModel = Admin;
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ email: 'Email already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new UserModel({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login for all roles
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        let UserModel;
        switch (role) {
            case 'jobseeker':
                UserModel = JobSeeker;
                break;
            case 'recruiter':
                UserModel = Recruiter;
                break;
            case 'admin':
                UserModel = Admin;
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ emailnotfound: 'Email not found' });
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ passwordincorrect: 'Incorrect password' });
        const payload = { id: user.id, email: user.email, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Post a new job
app.post('/api/job/post', async (req, res) => {
    try {
        const {
            email,
            jobTitle,
            jobLocation,
            jobRegion,
            jobType,
            jobDescription,
            education,
            applicationLink,
            companyName,
            companyTagline,
            companyDescription,
            jobLogo,
            companyWebsite,
            companyFacebook,
            companyTwitter,
            companyLinkedin
            
        } = req.body;

        const newJob = new Job({
            email,
            jobTitle,
            jobLocation,
            jobRegion,
            jobType,
            jobDescription,
            education,
            applicationLink,
            companyName,
            companyTagline,
            companyDescription,
            jobLogo,
            companyWebsite,
            companyFacebook,
            companyTwitter,
            companyLinkedin
        });

        await newJob.save();
        res.status(201).json({ message: 'Job posted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Route to fetch job details
app.get('/api/jobs', async (req, res) => {
    try {
        // Fetch all job details from the database
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/jobss', async (req, res) => {
    try {
        // Fetch all job details from the database
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const port = process.env.PORT || 5500;
app.listen(port, () => console.log(`Server running on port ${port}`));
