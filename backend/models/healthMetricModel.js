import mongoose from "mongoose";

const healthMetricSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    metricType: { 
        type: String, 
        enum: ['blood_pressure', 'heart_rate', 'blood_sugar', 'weight', 'height', 'bmi', 'temperature', 'oxygen_saturation', 'cholesterol', 'steps', 'sleep', 'water_intake'],
        required: true 
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be number or object for complex values
    unit: { type: String, required: true },
    
    // For blood pressure
    systolic: { type: Number },
    diastolic: { type: Number },
    
    // For cholesterol
    totalCholesterol: { type: Number },
    ldl: { type: Number },
    hdl: { type: Number },
    triglycerides: { type: Number },
    
    recordedAt: { type: Date, default: Date.now },
    notes: { type: String },
    source: { 
        type: String, 
        enum: ['manual', 'device', 'lab', 'doctor'],
        default: 'manual'
    },
    deviceName: { type: String },
    
    // Status indicators
    status: { 
        type: String, 
        enum: ['normal', 'low', 'high', 'critical'],
        default: 'normal'
    }
}, {
    timestamps: true
});

healthMetricSchema.index({ userId: 1, recordedAt: -1 });
healthMetricSchema.index({ metricType: 1, recordedAt: -1 });

const healthMetricModel = mongoose.models.healthMetric || mongoose.model("healthMetric", healthMetricSchema);
export default healthMetricModel;
