import mongoose from "mongoose";

const billingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    billNumber: { type: String, unique: true, required: true },
    billType: {
        type: String,
        enum: ['consultation', 'procedure', 'medication', 'lab_test', 'hospital_stay', 'emergency', 'other'],
        required: true
    },

    // References
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment' },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'prescription' },
    labReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'labReport' },

    // Provider details
    hospitalName: { type: String, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
    doctorName: { type: String },

    // Billing details
    billDate: { type: Date, default: Date.now },
    dueDate: { type: Date },

    items: [{
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        taxAmount: { type: Number, default: 0 }
    }],

    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Insurance
    insuranceId: { type: mongoose.Schema.Types.ObjectId, ref: 'insurance' },
    insuranceCovered: { type: Number, default: 0 },
    patientPayable: { type: Number, required: true },

    // Payment details
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
        default: 'pending',
        index: true
    },
    paidAmount: { type: Number, default: 0 },
    paymentMethod: { type: String },
    paymentDate: { type: Date },
    transactionId: { type: String },

    // Documents
    billDocument: { type: String },
    receiptDocument: { type: String },

    notes: { type: String }
}, {
    timestamps: true
});

billingSchema.index({ userId: 1, billDate: -1 });
const billingModel = mongoose.models.billing || mongoose.model("billing", billingSchema);
export default billingModel;
