import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: { type: Object, default: { line1: '', line2: '' } },
    date: { type: Number, default: Date.now() },
    slots_booked: { type: Object, default: {} },
    // New fields for enhanced doctor features
    phone: { type: String, default: "" },
    qualifications: { type: Array, default: [] },
    awards: { type: Array, default: [] },
    languages: { type: Array, default: [] },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    schedule: {
        type: Object,
        default: {
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30
        }
    }
}, { minimize: false })

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;
