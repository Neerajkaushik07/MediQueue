import mongoose from "mongoose";

const emergencyServiceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    serviceType: { 
        type: String, 
        enum: ['ambulance', 'emergency_consultation', 'police', 'fire', 'disaster_management'],
        required: true 
    },
    status: { 
        type: String, 
        enum: ['requested', 'dispatched', 'in_progress', 'completed', 'cancelled'],
        default: 'requested'
    },
    urgencyLevel: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'high'
    },
    description: { type: String, required: true },
    location: {
        address: { type: String, required: true },
        latitude: { type: Number },
        longitude: { type: Number },
        landmark: { type: String }
    },
    patientDetails: {
        name: { type: String, required: true },
        age: { type: Number },
        gender: { type: String },
        condition: { type: String },
        vitals: { type: String }
    },
    contactNumber: { type: String, required: true },
    alternateContact: { type: String },
    
    assignedTo: {
        vehicleNumber: { type: String },
        driverName: { type: String },
        driverContact: { type: String },
        hospitalName: { type: String }
    },
    
    requestTime: { type: Date, default: Date.now },
    dispatchTime: { type: Date },
    arrivalTime: { type: Date },
    completionTime: { type: Date },
    
    estimatedArrival: { type: String },
    notes: { type: String },
    cost: { type: Number, default: 0 }
}, {
    timestamps: true
});

emergencyServiceSchema.index({ userId: 1, requestTime: -1 });
emergencyServiceSchema.index({ status: 1 });

const emergencyServiceModel = mongoose.models.emergencyService || mongoose.model("emergencyService", emergencyServiceSchema);
export default emergencyServiceModel;
