import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { insertJobSchema, insertApplicationSchema, insertNoticeSchema } from "@shared/schema";

// OTP utility functions
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simulate SMS sending (in production, integrate with SMS provider like Twilio)
function sendSms(phoneNumber: string, message: string): Promise<boolean> {
  console.log(`SMS to ${phoneNumber}: ${message}`);
  // In development, just log the OTP
  return Promise.resolve(true);
}

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // OTP routes
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
      }

      // Generate OTP
      const otp = generateOtp();
      
      // Store OTP in database
      await storage.createOtp(phoneNumber, otp);
      
      // Send SMS (in production, use real SMS service)
      const message = `Your TNCPSB verification code is: ${otp}. Valid for 5 minutes.`;
      await sendSms(phoneNumber, message);
      
      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      
      if (!phoneNumber || !otp) {
        return res.status(400).json({ message: 'Phone number and OTP are required' });
      }

      const isValid = await storage.verifyOtp(phoneNumber, otp);
      
      if (isValid) {
        res.json({ message: 'OTP verified successfully', verified: true });
      } else {
        res.status(400).json({ message: 'Invalid or expired OTP', verified: false });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Failed to verify OTP' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get applicant profile if user is an applicant
      let applicantProfile = null;
      if (user.role === 'applicant') {
        applicantProfile = await storage.getApplicant(userId);
      }

      // Determine redirect URL based on role and profile completion
      let redirectUrl = '/';
      if (user.role === 'applicant') {
        if (!applicantProfile) {
          redirectUrl = '/profile?step=1&reason=complete_profile';
        } else if (applicantProfile.profileCompletionPercentage < 100) {
          redirectUrl = '/profile?step=2&reason=incomplete_profile';
        } else {
          redirectUrl = '/dashboard';
        }
      } else if (user.role === 'admin') {
        redirectUrl = '/admin';
      } else if (user.role === 'board') {
        redirectUrl = '/board';
      }

      res.json({ ...user, applicantProfile, redirectUrl });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes (no authentication required)
  
  // Get all counties for location dropdowns
  app.get('/api/public/counties', async (req, res) => {
    try {
      const counties = await storage.getCounties();
      res.json(counties);
    } catch (error) {
      console.error('Error fetching counties:', error);
      res.status(500).json({ message: 'Failed to fetch counties' });
    }
  });

  // Get constituencies by county
  app.get('/api/public/constituencies/:countyId', async (req, res) => {
    try {
      const countyId = parseInt(req.params.countyId);
      const constituencies = await storage.getConstituenciesByCounty(countyId);
      res.json(constituencies);
    } catch (error) {
      console.error('Error fetching constituencies:', error);
      res.status(500).json({ message: 'Failed to fetch constituencies' });
    }
  });

  // Get wards by constituency
  app.get('/api/public/wards/:constituencyId', async (req, res) => {
    try {
      const constituencyId = parseInt(req.params.constituencyId);
      const wards = await storage.getWardsByConstituency(constituencyId);
      res.json(wards);
    } catch (error) {
      console.error('Error fetching wards:', error);
      res.status(500).json({ message: 'Failed to fetch wards' });
    }
  });

  // Get published notices
  app.get('/api/public/notices', async (req, res) => {
    try {
      const notices = await storage.getNotices(true);
      res.json(notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
      res.status(500).json({ message: 'Failed to fetch notices' });
    }
  });

  // Get active jobs
  app.get('/api/public/jobs', async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
      const jobs = await storage.getJobs({ isActive: true, departmentId });
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ message: 'Failed to fetch jobs' });
    }
  });

  // Get system configuration data
  app.get('/api/public/config', async (req, res) => {
    try {
      const [departments, designations, awards, courses] = await Promise.all([
        storage.getDepartments(),
        storage.getDesignations(),
        storage.getAwards(),
        storage.getCoursesOffered()
      ]);

      res.json({
        departments,
        designations,
        awards,
        courses
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({ message: 'Failed to fetch configuration' });
    }
  });

  // Protected applicant routes
  
  // Create applicant profile
  app.post('/api/applicant/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'applicant') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if profile already exists
      const existingProfile = await storage.getApplicant(userId);
      if (existingProfile) {
        return res.status(400).json({ message: 'Profile already exists' });
      }

      const profileData = {
        ...req.body,
        userId,
      };

      const profile = await storage.createApplicant(profileData);
      res.json(profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(500).json({ message: 'Failed to create profile' });
    }
  });

  // Update applicant profile
  app.put('/api/applicant/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'applicant') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const profile = await storage.getApplicant(userId);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      const updatedProfile = await storage.updateApplicant(profile.id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });
  
  // Mark phone as verified after OTP verification
  app.post('/api/applicant/verify-phone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'applicant') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const profile = await storage.getApplicant(userId);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      const { phoneNumber } = req.body;
      
      // Update phone verification status
      const updatedProfile = await storage.updateApplicant(profile.id, {
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        phoneNumber,
      });
      
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error verifying phone:', error);
      res.status(500).json({ message: 'Failed to verify phone' });
    }
  });

  // Get applicant's applications
  app.get('/api/applicant/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'applicant') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const profile = await storage.getApplicant(userId);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      const applications = await storage.getApplications({ applicantId: profile.id });
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });

  // Apply for a job
  app.post('/api/applicant/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'applicant') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const profile = await storage.getApplicant(userId);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      const { jobId } = req.body;
      
      // Check if already applied
      const existingApplications = await storage.getApplications({ 
        applicantId: profile.id, 
        jobId: parseInt(jobId) 
      });
      
      if (existingApplications.length > 0) {
        return res.status(400).json({ message: 'Already applied for this job' });
      }

      const application = await storage.createApplication({
        jobId: parseInt(jobId),
        applicantId: profile.id,
        status: 'submitted',
        submittedOn: new Date().toISOString().split('T')[0],
      });

      res.json(application);
    } catch (error) {
      console.error('Error applying for job:', error);
      res.status(500).json({ message: 'Failed to apply for job' });
    }
  });

  // Protected admin routes
  
  // Get all applications (admin)
  app.get('/api/admin/applications', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const jobId = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;
      const status = req.query.status as string | undefined;
      
      const applications = await storage.getApplications({ jobId, status });
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });

  // Create job (admin)
  app.post('/api/admin/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const jobData = insertJobSchema.parse({
        ...req.body,
        createdBy: user.id,
      });

      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ message: 'Failed to create job' });
    }
  });

  // Update job (admin)
  app.put('/api/admin/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const jobId = parseInt(req.params.id);
      const job = await storage.updateJob(jobId, req.body);
      res.json(job);
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ message: 'Failed to update job' });
    }
  });

  // Create notice (admin)
  app.post('/api/admin/notices', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const noticeData = insertNoticeSchema.parse({
        ...req.body,
        createdBy: user.id,
      });

      const notice = await storage.createNotice(noticeData);
      res.json(notice);
    } catch (error) {
      console.error('Error creating notice:', error);
      res.status(500).json({ message: 'Failed to create notice' });
    }
  });

  // Protected board committee routes
  
  // Get applications for review (board)
  app.get('/api/board/applications', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'board') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const jobId = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;
      const status = req.query.status as string | undefined;
      
      const applications = await storage.getApplications({ jobId, status });
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });

  // Update application status (board)
  app.put('/api/board/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'board') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const applicationId = parseInt(req.params.id);
      const application = await storage.updateApplication(applicationId, req.body);
      res.json(application);
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({ message: 'Failed to update application' });
    }
  });

  // File upload endpoint
  app.post('/api/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // In production, you would upload to cloud storage (AWS S3, etc.)
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        filename: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimeType: req.file.mimetype
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
