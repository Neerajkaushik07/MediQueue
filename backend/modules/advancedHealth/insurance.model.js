import mongoose from "mongoose";

const insuranceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    providerName: { type: String, required: true },
    policyNumber: { type: String, required: true },

    // Fields from frontend
    type: { type: String }, // e.g. Health, Vision
    premium: { type: String }, // e.g. $50/mo

    // Made optional or changed
    policyType: {
        type: String,
        enum: ['individual', 'family', 'group', 'senior_citizen'],
        // required: true // Made optional
    },

    coverage: {
        // Made entire object structure flexible or optional
        amount: { type: Number },
        currency: { type: String, default: 'USD' },
        deductible: { type: Number },
        coPayment: { type: Number },
        // specific for frontend display if needed, or just store as string in notes/description
        displayValue: { type: String }
    },

    // Policy dates
    startDate: { type: Date, default: Date.now }, // Default to now if not provided
    endDate: { type: Date, required: true },
    renewalDate: { type: Date },

    // Coverage details
    coveredServices: [{
        service: String,
        coveragePercentage: Number,
        limit: Number
    }],

    // Additional members covered
    familyMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'familyMember'
    }],

    // Documents
    documents: [{
        name: String,
        url: String,
        type: String
    }],

    isActive: { type: Boolean, default: true },
    notes: { type: String }
}, {
    timestamps: true
});

insuranceSchema.index({ userId: 1 });
const insuranceModel = mongoose.models.insurance || mongoose.model("insurance", insuranceSchema);
export default insuranceModel;
