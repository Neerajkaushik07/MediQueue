import mongoose from "mongoose";

const telemedicineSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment' },
    
    consultationType: { 
        type: String, 
        enum: ['video', 'audio', 'chat'],
        required: true 
    },
    
    scheduledTime: { type: Date, required: true },
    duration: { type: Number, default: 30 }, // in minutes
    
    status: { 
        type: String, 
        enum: ['scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled'
    },
    
    // Consultation details
    chiefComplaint: { type: String, required: true },
    symptoms: [{ type: String }],
    medicalHistory: { type: String },
    
    // Meeting details
    meetingLink: { type: String },
    meetingId: { type: String },
    meetingPassword: { type: String },
    
    // Session info
    startTime: { type: Date },
    endTime: { type: Date },
    actualDuration: { type: Number }, // in minutes
    
    // Consultation outcome
    diagnosis: { type: String },
    treatmentPlan: { type: String },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'prescription' },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    
    // Files and attachments
    attachments: [{
        name: String,
        url: String,
        type: String,
        uploadedBy: String // 'patient' or 'doctor'
    }],
    
    // Notes
    doctorNotes: { type: String },
    patientNotes: { type: String },
    
    // Payment
    consultationFee: { type: Number, required: true },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: { type: String },
    transactionId: { type: String },
    
    // Ratings
    patientRating: { type: Number, min: 1, max: 5 },
    patientFeedback: { type: String },
    
    // Technical details
    connectionQuality: { type: String },
    technicalIssues: { type: String }
}, {
    timestamps: true
});

telemedicineSchema.index({ userId: 1, scheduledTime: -1 });
telemedicineSchema.index({ doctorId: 1, scheduledTime: -1 });
telemedicineSchema.index({ status: 1 });

const telemedicineModel = mongoose.models.telemedicine || mongoose.model("telemedicine", telemedicineSchema);
export default telemedicineModel;
