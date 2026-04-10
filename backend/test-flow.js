import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import appointmentModel from './modules/user/appointment.model.js';
import userModel from './modules/user/user.model.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function simulate() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Find the guest recruiter or any user who has an appointment
    const appointment = await appointmentModel.findOne({ cancelled: false, payment: false, isCompleted: false });
    if (!appointment) {
        console.log("No pending appointments found to test with.");
        process.exit(1);
    }

    console.log("Found appointment:", appointment._id);

    // 2. Mock payment-stripe logic
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: appointment.amount * 100, // amount in cents
            currency: process.env.CURRENCY || 'usd',
            metadata: {
                appointmentId: appointment._id.toString()
            },
            automatic_payment_methods: {
                enabled: true,
            },
        })

        console.log("Successfully created paymentIntent with clientSecret:", paymentIntent.client_secret);
    } catch (e) {
        console.error("Stripe Error in backend logic:", e.message);
    }
    
    process.exit(0);
}

simulate();
