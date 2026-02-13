import express from 'express';
import { loginDoctor, getAllDoctors, getDoctorProfile, updateDoctorProfile, registerDoctor, doctorAppointments, appointmentComplete, appointmentCancel, doctorDashboard, updateAppointmentDetails, getPatientHistory, getDoctorReviews, getDoctorFinancialStats, getDoctorSchedule, updateDoctorSchedule } from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';

const doctorRouter = express.Router();

doctorRouter.post('/register', registerDoctor);
doctorRouter.post('/login', loginDoctor);
doctorRouter.get('/list', getAllDoctors);

// Protected routes
doctorRouter.get('/profile', authDoctor, getDoctorProfile);
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile);

doctorRouter.get('/appointments', authDoctor, doctorAppointments);
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete);
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel);
doctorRouter.post('/update-appointment-details', authDoctor, updateAppointmentDetails);
doctorRouter.post('/patient-history', authDoctor, getPatientHistory);
doctorRouter.post('/reviews', authDoctor, getDoctorReviews);
doctorRouter.get('/financial-stats', authDoctor, getDoctorFinancialStats);
doctorRouter.get('/dashboard', authDoctor, doctorDashboard);

// Schedule routes
doctorRouter.get('/schedule', authDoctor, getDoctorSchedule);
doctorRouter.post('/update-schedule', authDoctor, updateDoctorSchedule);

export default doctorRouter;
