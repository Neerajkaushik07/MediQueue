import medicationReminderModel from "../models/medicationReminderModel.js";
import telemedicineModel from "../models/telemedicineModel.js";
import logger from '../config/logger.js';

// Medication Reminder Controllers

// Add medication reminder
const addMedicationReminder = async (req, res) => {
    try {
        const reminderData = {
            ...req.body,
            userId: req.body.userId
        };

        const newReminder = new medicationReminderModel(reminderData);
        await newReminder.save();

        res.json({ success: true, message: 'Medication reminder set successfully', reminder: newReminder });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get active reminders
const getActiveReminders = async (req, res) => {
    try {
        const currentDate = new Date();
        const reminders = await medicationReminderModel.find({
            userId: req.body.userId,
            isActive: true,
            endDate: { $gte: currentDate }
        }).sort({ startDate: 1 });

        res.json({ success: true, reminders });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all reminders
const getAllReminders = async (req, res) => {
    try {
        const reminders = await medicationReminderModel.find({
            userId: req.body.userId
        }).sort({ startDate: -1 });

        res.json({ success: true, reminders });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Log medication intake
const logMedicationIntake = async (req, res) => {
    try {
        const { reminderId } = req.params;
        const { taken, skipped, notes } = req.body;

        const reminder = await medicationReminderModel.findOne({
            _id: reminderId,
            userId: req.body.userId
        });

        if (!reminder) {
            return res.json({ success: false, message: 'Reminder not found' });
        }

        reminder.intakeHistory.push({
            date: new Date(),
            time: new Date().toTimeString().slice(0, 5),
            taken: taken || false,
            skipped: skipped || false,
            notes: notes || ''
        });

        await reminder.save();

        res.json({ success: true, message: 'Medication intake logged', reminder });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update reminder
const updateReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;

        const reminder = await medicationReminderModel.findOneAndUpdate(
            { _id: reminderId, userId: req.body.userId },
            req.body,
            { new: true }
        );

        if (!reminder) {
            return res.json({ success: false, message: 'Reminder not found' });
        }

        res.json({ success: true, message: 'Reminder updated successfully', reminder });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete reminder
const deleteReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;

        await medicationReminderModel.findOneAndUpdate(
            { _id: reminderId, userId: req.body.userId },
            { isActive: false, completionStatus: 'discontinued' }
        );

        res.json({ success: true, message: 'Reminder deleted successfully' });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Telemedicine Controllers

// Schedule telemedicine consultation
const scheduleTelemedicine = async (req, res) => {
    try {
        const consultationData = {
            ...req.body,
            userId: req.body.userId,
            // Generate meeting link (in production, integrate with Zoom/Google Meet/Agora)
            meetingLink: `https://mediqueue.com/consultation/${Date.now()}`,
            meetingId: `MQ${Date.now()}`,
            meetingPassword: Math.random().toString(36).substring(7)
        };

        const newConsultation = new telemedicineModel(consultationData);
        await newConsultation.save();

        res.json({
            success: true,
            message: 'Telemedicine consultation scheduled successfully',
            consultation: newConsultation
        });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's telemedicine consultations
const getTelemedicineConsultations = async (req, res) => {
    try {
        const consultations = await telemedicineModel.find({ userId: req.body.userId })
            .populate('doctorId', 'name speciality image')
            .populate('prescriptionId')
            .sort({ scheduledTime: -1 });

        res.json({ success: true, consultations });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get upcoming consultations
const getUpcomingConsultations = async (req, res) => {
    try {
        const consultations = await telemedicineModel.find({
            userId: req.body.userId,
            scheduledTime: { $gte: new Date() },
            status: { $in: ['scheduled', 'waiting'] }
        })
            .populate('doctorId', 'name speciality image')
            .sort({ scheduledTime: 1 });

        res.json({ success: true, consultations });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Join consultation
const joinConsultation = async (req, res) => {
    try {
        const { consultationId } = req.params;

        const consultation = await telemedicineModel.findOne({
            _id: consultationId,
            userId: req.body.userId
        }).populate('doctorId', 'name speciality image');

        if (!consultation) {
            return res.json({ success: false, message: 'Consultation not found' });
        }

        // Update status to in_progress
        if (consultation.status === 'scheduled' || consultation.status === 'waiting') {
            consultation.status = 'in_progress';
            consultation.startTime = new Date();
            await consultation.save();
        }

        res.json({
            success: true,
            consultation,
            meetingLink: consultation.meetingLink,
            meetingId: consultation.meetingId,
            meetingPassword: consultation.meetingPassword
        });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// End consultation
const endConsultation = async (req, res) => {
    try {
        const { consultationId } = req.params;
        const { diagnosis, treatmentPlan, doctorNotes, prescriptionId } = req.body;

        const consultation = await telemedicineModel.findById(consultationId);

        if (!consultation) {
            return res.json({ success: false, message: 'Consultation not found' });
        }

        consultation.status = 'completed';
        consultation.endTime = new Date();
        consultation.actualDuration = Math.round((consultation.endTime - consultation.startTime) / (1000 * 60));

        if (diagnosis) consultation.diagnosis = diagnosis;
        if (treatmentPlan) consultation.treatmentPlan = treatmentPlan;
        if (doctorNotes) consultation.doctorNotes = doctorNotes;
        if (prescriptionId) consultation.prescriptionId = prescriptionId;

        await consultation.save();

        res.json({ success: true, message: 'Consultation ended successfully', consultation });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Rate consultation
const rateConsultation = async (req, res) => {
    try {
        const { consultationId } = req.params;
        const { rating, feedback } = req.body;

        const consultation = await telemedicineModel.findOneAndUpdate(
            { _id: consultationId, userId: req.body.userId },
            {
                patientRating: rating,
                patientFeedback: feedback
            },
            { new: true }
        );

        if (!consultation) {
            return res.json({ success: false, message: 'Consultation not found' });
        }

        res.json({ success: true, message: 'Rating submitted successfully', consultation });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Cancel consultation
const cancelTelemedicine = async (req, res) => {
    try {
        const { consultationId } = req.params;

        const consultation = await telemedicineModel.findOneAndUpdate(
            { _id: consultationId, userId: req.body.userId },
            { status: 'cancelled' },
            { new: true }
        );

        if (!consultation) {
            return res.json({ success: false, message: 'Consultation not found' });
        }

        res.json({ success: true, message: 'Consultation cancelled successfully', consultation });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    // Medication Reminders
    addMedicationReminder,
    getActiveReminders,
    getAllReminders,
    logMedicationIntake,
    updateReminder,
    deleteReminder,

    // Telemedicine
    scheduleTelemedicine,
    getTelemedicineConsultations,
    getUpcomingConsultations,
    joinConsultation,
    endConsultation,
    rateConsultation,
    cancelTelemedicine
};
