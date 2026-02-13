import familyMemberModel from "../models/familyMemberModel.js";
import insuranceModel from "../models/insuranceModel.js";
import billingModel from "../models/billingModel.js";
import logger from '../config/logger.js';

// Emergency Services Controllers

// Request emergency service
const requestEmergencyService = async (req, res) => {
    try {
        const { serviceType, urgencyLevel, description, location, patientDetails, contactNumber, alternateContact } = req.body;

        const serviceData = {
            userId: req.body.userId,
            serviceType,
            urgencyLevel: urgencyLevel || 'high',
            description,
            location,
            patientDetails,
            contactNumber,
            alternateContact,
            status: 'requested',
            requestTime: new Date()
        };

        const newService = new emergencyServiceModel(serviceData);
        await newService.save();

        // Here you would typically integrate with actual emergency services
        // Send SMS, notifications, etc.

        res.json({
            success: true,
            message: 'Emergency service requested successfully',
            service: newService,
            emergencyNumber: '911' // Or local emergency number
        });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get emergency service history
const getEmergencyServices = async (req, res) => {
    try {
        const services = await emergencyServiceModel.find({ userId: req.body.userId })
            .sort({ requestTime: -1 });
        res.json({ success: true, services });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get active emergency services
const getActiveEmergencyServices = async (req, res) => {
    try {
        const services = await emergencyServiceModel.find({
            userId: req.body.userId,
            status: { $in: ['requested', 'dispatched', 'in_progress'] }
        }).sort({ requestTime: -1 });
        res.json({ success: true, services });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update emergency service status
const updateEmergencyService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const service = await emergencyServiceModel.findByIdAndUpdate(
            serviceId,
            req.body,
            { new: true }
        );

        if (!service) {
            return res.json({ success: false, message: 'Service not found' });
        }

        res.json({ success: true, message: 'Service updated successfully', service });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Cancel emergency service
const cancelEmergencyService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const service = await emergencyServiceModel.findOneAndUpdate(
            { _id: serviceId, userId: req.body.userId },
            { status: 'cancelled' },
            { new: true }
        );

        if (!service) {
            return res.json({ success: false, message: 'Service not found' });
        }

        res.json({ success: true, message: 'Emergency service cancelled', service });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Family Member Controllers

// Add family member
const addFamilyMember = async (req, res) => {
    try {
        const memberData = {
            ...req.body,
            userId: req.body.userId
        };

        const newMember = new familyMemberModel(memberData);
        await newMember.save();

        res.json({ success: true, message: 'Family member added successfully', member: newMember });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get family members
const getFamilyMembers = async (req, res) => {
    try {
        const members = await familyMemberModel.find({
            userId: req.body.userId,
            isActive: true
        }).sort({ createdAt: -1 });
        res.json({ success: true, members });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update family member
const updateFamilyMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const member = await familyMemberModel.findOneAndUpdate(
            { _id: memberId, userId: req.body.userId },
            req.body,
            { new: true }
        );

        if (!member) {
            return res.json({ success: false, message: 'Family member not found' });
        }

        res.json({ success: true, message: 'Family member updated successfully', member });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove family member
const removeFamilyMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        await familyMemberModel.findOneAndUpdate(
            { _id: memberId, userId: req.body.userId },
            { isActive: false }
        );
        res.json({ success: true, message: 'Family member removed successfully' });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Insurance Controllers

// Add insurance policy
const addInsurance = async (req, res) => {
    try {
        const insuranceData = {
            ...req.body,
            userId: req.body.userId
        };

        const newInsurance = new insuranceModel(insuranceData);
        await newInsurance.save();

        res.json({ success: true, message: 'Insurance policy added successfully', insurance: newInsurance });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get insurance policies
const getInsurance = async (req, res) => {
    try {
        const policies = await insuranceModel.find({ userId: req.body.userId })
            .populate('familyMembers', 'name relationship')
            .sort({ createdAt: -1 });
        res.json({ success: true, policies });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get active insurance
const getActiveInsurance = async (req, res) => {
    try {
        const policies = await insuranceModel.find({
            userId: req.body.userId,
            isActive: true,
            endDate: { $gte: new Date() }
        }).populate('familyMembers', 'name relationship');
        res.json({ success: true, policies });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update insurance
const updateInsurance = async (req, res) => {
    try {
        const { insuranceId } = req.params;
        const insurance = await insuranceModel.findOneAndUpdate(
            { _id: insuranceId, userId: req.body.userId },
            req.body,
            { new: true }
        );

        if (!insurance) {
            return res.json({ success: false, message: 'Insurance not found' });
        }

        res.json({ success: true, message: 'Insurance updated successfully', insurance });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Billing Controllers

// Add bill
const addBill = async (req, res) => {
    try {
        const billData = {
            ...req.body,
            billNumber: `BILL${Date.now()}`,
            userId: req.body.userId
        };

        const newBill = new billingModel(billData);
        await newBill.save();

        res.json({ success: true, message: 'Bill added successfully', bill: newBill });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all bills
const getBills = async (req, res) => {
    try {
        const bills = await billingModel.find({ userId: req.body.userId })
            .populate('doctorId', 'name speciality')
            .populate('insuranceId', 'providerName policyNumber')
            .sort({ billDate: -1 });
        res.json({ success: true, bills });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get pending bills
const getPendingBills = async (req, res) => {
    try {
        const bills = await billingModel.find({
            userId: req.body.userId,
            paymentStatus: { $in: ['pending', 'partial', 'overdue'] }
        }).populate('doctorId', 'name speciality')
            .sort({ dueDate: 1 });
        res.json({ success: true, bills });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update bill payment
const updateBillPayment = async (req, res) => {
    try {
        const { billId } = req.params;
        const { paidAmount, paymentMethod, transactionId } = req.body;

        const bill = await billingModel.findOne({ _id: billId, userId: req.body.userId });

        if (!bill) {
            return res.json({ success: false, message: 'Bill not found' });
        }

        bill.paidAmount += paidAmount;
        bill.paymentMethod = paymentMethod;
        bill.transactionId = transactionId;
        bill.paymentDate = new Date();

        if (bill.paidAmount >= bill.patientPayable) {
            bill.paymentStatus = 'paid';
        } else if (bill.paidAmount > 0) {
            bill.paymentStatus = 'partial';
        }

        await bill.save();

        res.json({ success: true, message: 'Payment updated successfully', bill });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get billing summary
const getBillingSummary = async (req, res) => {
    try {
        const totalBills = await billingModel.countDocuments({ userId: req.body.userId });
        const pendingAmount = await billingModel.aggregate([
            { $match: { userId: req.body.userId, paymentStatus: { $ne: 'paid' } } },
            { $group: { _id: null, total: { $sum: '$patientPayable' } } }
        ]);
        const paidAmount = await billingModel.aggregate([
            { $match: { userId: req.body.userId, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$paidAmount' } } }
        ]);

        res.json({
            success: true,
            summary: {
                totalBills,
                pendingAmount: pendingAmount[0]?.total || 0,
                paidAmount: paidAmount[0]?.total || 0
            }
        });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    // Emergency Services
    requestEmergencyService,
    getEmergencyServices,
    getActiveEmergencyServices,
    updateEmergencyService,
    cancelEmergencyService,

    // Family Members
    addFamilyMember,
    getFamilyMembers,
    updateFamilyMember,
    removeFamilyMember,

    // Insurance
    addInsurance,
    getInsurance,
    getActiveInsurance,
    updateInsurance,

    // Billing
    addBill,
    getBills,
    getPendingBills,
    updateBillPayment,
    getBillingSummary
};
