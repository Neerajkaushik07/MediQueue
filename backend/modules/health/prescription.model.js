import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment' },
    prescriptionNumber: { type: String, unique: true, required: true },
    medications: [{
        name: { type: String, required: true },
        genericName: { type: String },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true }, // e.g., "3 times daily"
        duration: { type: String, required: true }, // e.g., "7 days"
        instructions: { type: String },
        morningDose: { type: Boolean, default: false },
        afternoonDose: { type: Boolean, default: false },
        eveningDose: { type: Boolean, default: false },
        nightDose: { type: Boolean, default: false },
        beforeMeal: { type: Boolean, default: false },
        afterMeal: { type: Boolean, default: false }
    }],
    diagnosis: { type: String },
    symptoms: [{ type: String }],
    testRecommended: [{ type: String }],
    notes: { type: String },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
    refillsAllowed: { type: Number, default: 0 },
    refillsRemaining: { type: Number, default: 0 }
}, {
    timestamps: true
});

prescriptionSchema.index({ userId: 1, createdAt: -1 });
const prescriptionModel = mongoose.models.prescription || mongoose.model("prescription", prescriptionSchema);
export default prescriptionModel;
