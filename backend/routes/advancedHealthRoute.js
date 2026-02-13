import express from 'express';
import authUser from '../middlewares/authUser.js';
import {
    addMedicationReminder,
    getActiveReminders,
    getAllReminders,
    logMedicationIntake,
    updateReminder,
    deleteReminder,
    scheduleTelemedicine,
    getTelemedicineConsultations,
    getUpcomingConsultations,
    joinConsultation,
    endConsultation,
    rateConsultation,
    cancelTelemedicine
} from '../controllers/advancedHealthController.js';

const advancedHealthRouter = express.Router();

// Medication Reminder Routes
advancedHealthRouter.post('/medication-reminders/add', authUser, addMedicationReminder);
advancedHealthRouter.get('/medication-reminders/active', authUser, getActiveReminders);
advancedHealthRouter.get('/medication-reminders', authUser, getAllReminders);
advancedHealthRouter.post('/medication-reminders/:reminderId/log', authUser, logMedicationIntake);
advancedHealthRouter.put('/medication-reminders/:reminderId', authUser, updateReminder);
advancedHealthRouter.delete('/medication-reminders/:reminderId', authUser, deleteReminder);

// Telemedicine Routes
advancedHealthRouter.post('/telemedicine/schedule', authUser, scheduleTelemedicine);
advancedHealthRouter.get('/telemedicine', authUser, getTelemedicineConsultations);
advancedHealthRouter.get('/telemedicine/upcoming', authUser, getUpcomingConsultations);
advancedHealthRouter.get('/telemedicine/:consultationId/join', authUser, joinConsultation);
advancedHealthRouter.post('/telemedicine/:consultationId/end', authUser, endConsultation);
advancedHealthRouter.post('/telemedicine/:consultationId/rate', authUser, rateConsultation);
advancedHealthRouter.post('/telemedicine/:consultationId/cancel', authUser, cancelTelemedicine);

export default advancedHealthRouter;
