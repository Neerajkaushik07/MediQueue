import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Primary user
    name: { type: String, required: true },
    relationship: { 
        type: String, 
        enum: ['spouse', 'child', 'parent', 'sibling', 'grandparent', 'other'],
        required: true 
    },
    email: { type: String },
    phone: { type: String },
    
    // Demographics
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dob: { type: Date },
    age: { type: Number },
    bloodGroup: { type: String },
    
    // Address
    address: {
        line1: String,
        line2: String
    },
    
    // Medical Information
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedications: [{
        name: String,
        dosage: String
    }],
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    
    // Insurance
    insuranceProvider: { type: String },
    insurancePolicyNumber: { type: String },
    
    // Access permissions
    canBookAppointments: { type: Boolean, default: true },
    canViewRecords: { type: Boolean, default: true },
    
    profileImage: { type: String },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

familyMemberSchema.index({ userId: 1 });

const familyMemberModel = mongoose.models.familyMember || mongoose.model("familyMember", familyMemberSchema);
export default familyMemberModel;
