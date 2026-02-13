import mongoose from "mongoose";

const labReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
    reportNumber: { type: String, unique: true, required: true },
    reportType: {
        type: String,
        enum: ['blood_test', 'urine_test', 'xray', 'mri', 'ct_scan', 'ultrasound', 'ecg', 'biopsy', 'other'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String },
    labName: { type: String, required: true },
    testDate: { type: Date, required: true },
    reportDate: { type: Date, default: Date.now },

    results: [{
        testName: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String },
        referenceRange: { type: String },
        status: {
            type: String,
            enum: ['normal', 'abnormal', 'critical'],
            default: 'normal'
        },
        notes: { type: String }
    }],

    overallStatus: {
        type: String,
        enum: ['normal', 'abnormal', 'critical', 'pending'],
        default: 'pending'
    },

    files: [{
        name: String,
        url: String,
        type: String
    }],

    doctorNotes: { type: String },
    followUpRequired: { type: Boolean, default: false },
    followUpNotes: { type: String }
}, {
    timestamps: true
});

labReportSchema.index({ userId: 1, testDate: -1 });
const labReportModel = mongoose.models.labReport || mongoose.model("labReport", labReportSchema);
export default labReportModel;
