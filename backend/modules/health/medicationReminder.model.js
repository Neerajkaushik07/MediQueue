import mongoose from "mongoose";

const medicationReminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'prescription' },
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    
    // Reminder settings
    reminderTimes: [{
        time: String, // HH:MM format
        label: String // e.g., "Morning", "Afternoon", "Evening", "Night"
    }],
    
    // Duration
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    // Meal timing
    beforeMeal: { type: Boolean, default: false },
    afterMeal: { type: Boolean, default: false },
    withMeal: { type: Boolean, default: false },
    
    // Tracking
    instructions: { type: String },
    notes: { type: String },
    
    // Notification settings
    notificationsEnabled: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    vibrationEnabled: { type: Boolean, default: true },
    
    // History
    intakeHistory: [{
        date: Date,
        time: String,
        taken: Boolean,
        skipped: Boolean,
        notes: String
    }],
    
    // Status
    isActive: { type: Boolean, default: true },
    completionStatus: { 
        type: String, 
        enum: ['ongoing', 'completed', 'discontinued'],
        default: 'ongoing'
    }
}, {
    timestamps: true
});

medicationReminderSchema.index({ userId: 1, isActive: 1 });
medicationReminderSchema.index({ userId: 1, startDate: 1, endDate: 1 });

const medicationReminderModel = mongoose.models.medicationReminder || mongoose.model("medicationReminder", medicationReminderSchema);
export default medicationReminderModel;
