import express from 'express';
import authUser from '../middlewares/authUser.js';
import {
    requestEmergencyService,
    getEmergencyServices,
    getActiveEmergencyServices,
    updateEmergencyService,
    cancelEmergencyService,
    addFamilyMember,
    getFamilyMembers,
    updateFamilyMember,
    removeFamilyMember,
    addInsurance,
    getInsurance,
    getActiveInsurance,
    updateInsurance,
    addBill,
    getBills,
    getPendingBills,
    updateBillPayment,
    getBillingSummary
} from '../controllers/familyHealthController.js';

const familyHealthRouter = express.Router();

// Emergency Services Routes
familyHealthRouter.post('/emergency/request', authUser, requestEmergencyService);
familyHealthRouter.get('/emergency', authUser, getEmergencyServices);
familyHealthRouter.get('/emergency/active', authUser, getActiveEmergencyServices);
familyHealthRouter.put('/emergency/:serviceId', authUser, updateEmergencyService);
familyHealthRouter.post('/emergency/:serviceId/cancel', authUser, cancelEmergencyService);

// Family Members Routes
familyHealthRouter.post('/family/add', authUser, addFamilyMember);
familyHealthRouter.get('/family', authUser, getFamilyMembers);
familyHealthRouter.put('/family/:memberId', authUser, updateFamilyMember);
familyHealthRouter.delete('/family/:memberId', authUser, removeFamilyMember);

// Insurance Routes
familyHealthRouter.post('/insurance/add', authUser, addInsurance);
familyHealthRouter.get('/insurance', authUser, getInsurance);
familyHealthRouter.get('/insurance/active', authUser, getActiveInsurance);
familyHealthRouter.put('/insurance/:insuranceId', authUser, updateInsurance);

// Billing Routes
familyHealthRouter.post('/billing/add', authUser, addBill);
familyHealthRouter.get('/billing', authUser, getBills);
familyHealthRouter.get('/billing/pending', authUser, getPendingBills);
familyHealthRouter.post('/billing/:billId/payment', authUser, updateBillPayment);
familyHealthRouter.get('/billing/summary', authUser, getBillingSummary);

export default familyHealthRouter;
