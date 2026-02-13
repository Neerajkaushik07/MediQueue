import { v2 as cloudinary } from 'cloudinary';
import logger from '../config/logger.js';

// Medical Records Controllers

// Add new medical record
const addMedicalRecord = async (req, res) => {
    try {
        const { recordType, title, description, diagnosis, symptoms, doctorName, hospital, date, medications, notes, followUpDate, status } = req.body;

        const recordData = {
            userId: req.body.userId,
            recordType,
            title,
            description,
            diagnosis,
            symptoms: symptoms || [],
            doctorName,
            hospital,
            date,
            medications: medications || [],
            notes,
            followUpDate,
            status: status || 'active',
            attachments: []
        };

        // Handle file uploads if present
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto'
                });
                recordData.attachments.push({
                    name: file.originalname,
                    url: uploadResult.secure_url,
                    type: file.mimetype
                });
            }
        }

        const newRecord = new medicalRecordModel(recordData);
        await newRecord.save();

        res.json({ success: true, message: 'Medical record added successfully', record: newRecord });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all medical records for user
const getMedicalRecords = async (req, res) => {
    try {
        const records = await medicalRecordModel.find({ userId: req.body.userId })
            .sort({ date: -1 });
        res.json({ success: true, records });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get medical records by type
const getMedicalRecordsByType = async (req, res) => {
    try {
        const { recordType } = req.params;
        const records = await medicalRecordModel.find({
            userId: req.body.userId,
            recordType
        }).sort({ date: -1 });
        res.json({ success: true, records });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update medical record
const updateMedicalRecord = async (req, res) => {
    try {
        const { recordId } = req.params;
        const record = await medicalRecordModel.findOneAndUpdate(
            { _id: recordId, userId: req.body.userId },
            req.body,
            { new: true }
        );

        if (!record) {
            return res.json({ success: false, message: 'Record not found' });
        }

        res.json({ success: true, message: 'Record updated successfully', record });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete medical record
const deleteMedicalRecord = async (req, res) => {
    try {
        const { recordId } = req.params;
        await medicalRecordModel.findOneAndDelete({ _id: recordId, userId: req.body.userId });
        res.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Prescription Controllers

// Add prescription
const addPrescription = async (req, res) => {
    try {
        const prescriptionData = {
            ...req.body,
            prescriptionNumber: `RX${Date.now()}`,
            refillsRemaining: req.body.refillsAllowed || 0
        };

        const newPrescription = new prescriptionModel(prescriptionData);
        await newPrescription.save();

        res.json({ success: true, message: 'Prescription added successfully', prescription: newPrescription });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user prescriptions
const getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await prescriptionModel.find({ userId: req.body.userId })
            .populate('doctorId', 'name speciality')
            .sort({ createdAt: -1 });
        res.json({ success: true, prescriptions });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get active prescriptions
const getActivePrescriptions = async (req, res) => {
    try {
        const prescriptions = await prescriptionModel.find({
            userId: req.body.userId,
            isActive: true,
            validUntil: { $gte: new Date() }
        }).populate('doctorId', 'name speciality');
        res.json({ success: true, prescriptions });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Health Metrics Controllers

// Add health metric
const addHealthMetric = async (req, res) => {
    try {
        const { metricType, value, unit, systolic, diastolic, notes, source, deviceName } = req.body;

        let status = 'normal';

        // Determine status based on metric type and value
        if (metricType === 'blood_pressure' && systolic && diastolic) {
            if (systolic > 140 || diastolic > 90) status = 'high';
            else if (systolic < 90 || diastolic < 60) status = 'low';
        } else if (metricType === 'blood_sugar') {
            if (value > 180) status = 'high';
            else if (value < 70) status = 'low';
        } else if (metricType === 'heart_rate') {
            if (value > 100) status = 'high';
            else if (value < 60) status = 'low';
        }

        const metricData = {
            userId: req.body.userId,
            metricType,
            value,
            unit,
            systolic,
            diastolic,
            notes,
            source: source || 'manual',
            deviceName,
            status,
            recordedAt: req.body.recordedAt || new Date()
        };

        const newMetric = new healthMetricModel(metricData);
        await newMetric.save();

        res.json({ success: true, message: 'Health metric added successfully', metric: newMetric });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get health metrics
const getHealthMetrics = async (req, res) => {
    try {
        const { metricType, startDate, endDate } = req.query;

        let query = { userId: req.body.userId };

        if (metricType) {
            query.metricType = metricType;
        }

        if (startDate && endDate) {
            query.recordedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const metrics = await healthMetricModel.find(query).sort({ recordedAt: -1 });
        res.json({ success: true, metrics });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get latest health metrics by type
const getLatestHealthMetrics = async (req, res) => {
    try {
        const metricTypes = ['blood_pressure', 'heart_rate', 'blood_sugar', 'weight', 'temperature', 'oxygen_saturation'];
        const latestMetrics = {};

        for (const type of metricTypes) {
            const metric = await healthMetricModel.findOne({
                userId: req.body.userId,
                metricType: type
            }).sort({ recordedAt: -1 });

            if (metric) {
                latestMetrics[type] = metric;
            }
        }

        res.json({ success: true, metrics: latestMetrics });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Lab Reports Controllers

// Add lab report
const addLabReport = async (req, res) => {
    try {
        const reportData = {
            ...req.body,
            reportNumber: `LAB${Date.now()}`,
            userId: req.body.userId
        };

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            reportData.files = [];
            for (const file of req.files) {
                const uploadResult = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto'
                });
                reportData.files.push({
                    name: file.originalname,
                    url: uploadResult.secure_url,
                    type: file.mimetype
                });
            }
        }

        const newReport = new labReportModel(reportData);
        await newReport.save();

        res.json({ success: true, message: 'Lab report added successfully', report: newReport });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get lab reports
const getLabReports = async (req, res) => {
    try {
        const reports = await labReportModel.find({ userId: req.body.userId })
            .populate('doctorId', 'name speciality')
            .sort({ testDate: -1 });
        res.json({ success: true, reports });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get lab report by ID
const getLabReportById = async (req, res) => {
    try {
        const { reportId } = req.params;
        const report = await labReportModel.findOne({
            _id: reportId,
            userId: req.body.userId
        }).populate('doctorId', 'name speciality');

        if (!report) {
            return res.json({ success: false, message: 'Report not found' });
        }

        res.json({ success: true, report });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    // Medical Records
    addMedicalRecord,
    getMedicalRecords,
    getMedicalRecordsByType,
    updateMedicalRecord,
    deleteMedicalRecord,

    // Prescriptions
    addPrescription,
    getPrescriptions,
    getActivePrescriptions,

    // Health Metrics
    addHealthMetric,
    getHealthMetrics,
    getLatestHealthMetrics,

    // Lab Reports
    addLabReport,
    getLabReports,
    getLabReportById
};
