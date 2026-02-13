import express from 'express';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';
import {
    addMedicalRecord,
    getMedicalRecords,
    getMedicalRecordsByType,
    updateMedicalRecord,
    deleteMedicalRecord,
    addPrescription,
    getPrescriptions,
    getActivePrescriptions,
    addHealthMetric,
    getHealthMetrics,
    getLatestHealthMetrics,
    addLabReport,
    getLabReports,
    getLabReportById
} from '../controllers/healthController.js';

const healthRouter = express.Router();

// Medical Records Routes
healthRouter.post('/medical-records/add', authUser, upload.array('attachments', 5), addMedicalRecord);
healthRouter.get('/medical-records', authUser, getMedicalRecords);
healthRouter.get('/medical-records/type/:recordType', authUser, getMedicalRecordsByType);
healthRouter.put('/medical-records/:recordId', authUser, updateMedicalRecord);
healthRouter.delete('/medical-records/:recordId', authUser, deleteMedicalRecord);

// Prescription Routes
healthRouter.post('/prescriptions/add', authUser, addPrescription);
healthRouter.get('/prescriptions', authUser, getPrescriptions);
healthRouter.get('/prescriptions/active', authUser, getActivePrescriptions);

// Health Metrics Routes
healthRouter.post('/metrics/add', authUser, addHealthMetric);
healthRouter.get('/metrics', authUser, getHealthMetrics);
healthRouter.get('/metrics/latest', authUser, getLatestHealthMetrics);

// Lab Reports Routes
healthRouter.post('/lab-reports/add', authUser, upload.array('files', 5), addLabReport);
healthRouter.get('/lab-reports', authUser, getLabReports);
healthRouter.get('/lab-reports/:reportId', authUser, getLabReportById);

export default healthRouter;
