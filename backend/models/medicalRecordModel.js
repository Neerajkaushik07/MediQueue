import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    recordType: { 
        type: String, 
        enum: ['consultation', 'diagnosis', 'surgery', 'vaccination', 'allergy', 'chronic_condition', 'other'],
        required: true 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    diagnosis: { type: String },
    symptoms: [{ type: String }],
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
    doctorName: { type: String },
    hospital: { type: String },
    date: { type: Date, required: true },
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String
    }],
    attachments: [{
        name: String,
        url: String,
        type: String // pdf, image, etc.
    }],
    notes: { type: String },
    followUpDate: { type: Date },
    status: { 
        type: String, 
        enum: ['active', 'resolved', 'ongoing'],
        default: 'active'
    }
}, {
    timestamps: true
});

medicalRecordSchema.index({ userId: 1, date: -1 });
medicalRecordSchema.index({ recordType: 1 });

const medicalRecordModel = mongoose.models.medicalRecord || mongoose.model("medicalRecord", medicalRecordSchema);
export default medicalRecordModel;
