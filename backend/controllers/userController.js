import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import reviewModel from "../models/reviewModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary'
import Stripe from 'stripe';
import { sendBookingConfirmation, sendCancellationEmail, sendSubscriptionEmail } from '../config/emailService.js';
import { OAuth2Client } from 'google-auth-library';
import logger from '../config/logger.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API for Google OAuth authentication
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user already exists
        let user = await userModel.findOne({ email });

        if (!user) {
            // Create new user with Google data
            const userData = {
                name,
                email,
                image: picture,
                password: await bcrypt.hash(googleId + process.env.JWT_SECRET, 10), // Random password
                googleId
            };

            user = new userModel(userData);
            await user.save();
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ success: true, token });

    } catch (error) {
        res.json({ success: false, message: 'Google authentication failed' });
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender, bloodGroup, height, weight, allergies, chronicConditions, currentMedications, emergencyContact, healthGoals } = req.body

        const updateData = {}
        if (name) updateData.name = name
        if (phone) updateData.phone = phone
        if (address) updateData.address = JSON.parse(address)
        if (dob) updateData.dob = dob
        if (gender) updateData.gender = gender

        // Health Profile Fields
        if (bloodGroup) updateData.bloodGroup = bloodGroup
        if (height) updateData.height = Number(height)
        if (weight) updateData.weight = Number(weight)
        if (allergies) updateData.allergies = JSON.parse(allergies)
        if (chronicConditions) updateData.chronicConditions = JSON.parse(chronicConditions)
        if (currentMedications) updateData.currentMedications = JSON.parse(currentMedications)
        if (emergencyContact) updateData.emergencyContact = JSON.parse(emergencyContact)
        if (healthGoals) updateData.healthGoals = JSON.parse(healthGoals)

        await userModel.findByIdAndUpdate(userId, updateData)

        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        let { userId, docId, slotDate, slotTime } = req.body

        // If no userId is provided (guest booking), use a default guest user
        let userData;
        if (!userId) {
            const guestEmail = 'guest.recruiter@mediqueue.com';
            userData = await userModel.findOne({ email: guestEmail });

            if (!userData) {
                // Create a guest user if one doesn't exist
                const guestData = {
                    name: "Guest Recruiter",
                    email: guestEmail,
                    password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
                };
                userData = new userModel(guestData);
                await userData.save();
            }
            userId = userData._id;
        } else {
            userData = await userModel.findById(userId).select("-password")
        }

        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Send booking confirmation email
        try {
            const formattedDate = slotDate.replace(/_/g, '-')
            await sendBookingConfirmation(
                userData.email,
                userData.name,
                docData.name,
                formattedDate,
                slotTime
            )
        } catch (emailError) {
            // Don't fail the booking if email fails
        }

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Send cancellation email
        try {
            const userData = await userModel.findById(userId).select('name email')
            const formattedDate = slotDate.replace(/_/g, '-')
            await sendCancellationEmail(
                userData.email,
                userData.name,
                appointmentData.docData.name,
                formattedDate,
                slotTime
            )
        } catch (emailError) {
        }

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message })
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: appointmentData.amount * 100, // amount in cents
            currency: process.env.CURRENCY || 'usd',
            metadata: {
                appointmentId: appointmentId.toString()
            },
            automatic_payment_methods: {
                enabled: true,
            },
        })

        res.json({ success: true, clientSecret: paymentIntent.client_secret })

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of Stripe
const verifyStripe = async (req, res) => {
    try {
        const { paymentIntentId } = req.body
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

        if (paymentIntent.status === 'succeeded') {
            const appointmentId = paymentIntent.metadata.appointmentId
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to add a review for a doctor
const addReview = async (req, res) => {
    try {
        const { userId, doctorId, appointmentId, rating, comment } = req.body;

        // Validate inputs
        if (!doctorId || !appointmentId || !rating || !comment) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Check if appointment exists and is completed
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        if (!appointment.isCompleted) {
            return res.json({ success: false, message: 'Can only review completed appointments' });
        }

        if (appointment.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized' });
        }

        // Check if review already exists
        const existingReview = await reviewModel.findOne({ appointmentId });
        if (existingReview) {
            return res.json({ success: false, message: 'Review already submitted for this appointment' });
        }

        // Get user data
        const userData = await userModel.findById(userId).select('name image');

        // Create review
        const reviewData = {
            doctorId,
            userId,
            appointmentId,
            rating,
            comment,
            userName: userData.name,
            userImage: userData.image || '',
            date: Date.now()
        };

        const newReview = new reviewModel(reviewData);
        await newReview.save();

        // Update doctor's average rating
        const allReviews = await reviewModel.find({ doctorId });
        const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;

        await doctorModel.findByIdAndUpdate(doctorId, {
            rating: Math.round(avgRating * 10) / 10,
            totalReviews: allReviews.length
        });

        res.json({ success: true, message: 'Review submitted successfully' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to reschedule appointment
const rescheduleAppointment = async (req, res) => {
    try {
        const { userId, appointmentId, newSlotDate, newSlotTime } = req.body;

        // Validate inputs
        if (!appointmentId || !newSlotDate || !newSlotTime) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Get appointment data
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // Verify user owns the appointment
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        // Check if appointment is already cancelled or completed
        if (appointmentData.cancelled) {
            return res.json({ success: false, message: 'Cannot reschedule cancelled appointment' });
        }

        if (appointmentData.isCompleted) {
            return res.json({ success: false, message: 'Cannot reschedule completed appointment' });
        }

        // Get doctor data and check availability
        const doctorData = await doctorModel.findById(appointmentData.docId);
        if (!doctorData.available) {
            return res.json({ success: false, message: 'Doctor not available' });
        }

        let slots_booked = doctorData.slots_booked;

        // Check if new slot is available
        if (slots_booked[newSlotDate] && slots_booked[newSlotDate].includes(newSlotTime)) {
            return res.json({ success: false, message: 'Selected slot not available' });
        }

        // Release old slot
        const oldSlotDate = appointmentData.slotDate;
        const oldSlotTime = appointmentData.slotTime;

        if (slots_booked[oldSlotDate]) {
            slots_booked[oldSlotDate] = slots_booked[oldSlotDate].filter(time => time !== oldSlotTime);
        }

        // Book new slot
        if (slots_booked[newSlotDate]) {
            slots_booked[newSlotDate].push(newSlotTime);
        } else {
            slots_booked[newSlotDate] = [newSlotTime];
        }

        // Update doctor's booked slots
        await doctorModel.findByIdAndUpdate(appointmentData.docId, { slots_booked });

        // Update appointment with new date and time
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            slotDate: newSlotDate,
            slotTime: newSlotTime
        });

        // Send reschedule confirmation email
        try {
            const userData = await userModel.findById(userId).select('name email');
            const formattedDate = newSlotDate.replace(/_/g, '-');
            await sendBookingConfirmation(
                userData.email,
                userData.name,
                appointmentData.docData.name,
                formattedDate,
                newSlotTime
            );
        } catch (emailError) {
        }

        res.json({ success: true, message: 'Appointment rescheduled successfully' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to get reviews for a doctor
const getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.body;

        const reviews = await reviewModel.find({ doctorId }).sort({ date: -1 });

        res.json({ success: true, reviews });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to add/remove doctor from favorites
const toggleFavoriteDoctor = async (req, res) => {
    try {
        const { userId, doctorId } = req.body;

        if (!doctorId) {
            return res.json({ success: false, message: 'Doctor ID required' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        let favoriteDoctors = user.favoriteDoctors || [];

        // Check if doctor is already in favorites
        const index = favoriteDoctors.indexOf(doctorId);

        if (index > -1) {
            // Remove from favorites
            favoriteDoctors.splice(index, 1);
            await userModel.findByIdAndUpdate(userId, { favoriteDoctors });
            res.json({ success: true, message: 'Removed from favorites', isFavorite: false });
        } else {
            // Add to favorites
            favoriteDoctors.push(doctorId);
            await userModel.findByIdAndUpdate(userId, { favoriteDoctors });
            res.json({ success: true, message: 'Added to favorites', isFavorite: true });
        }

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to get user's favorite doctors
const getFavoriteDoctors = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const favoriteDoctors = await doctorModel.find({
            '_id': { $in: user.favoriteDoctors || [] }
        }).select('-password');

        res.json({ success: true, favoriteDoctors });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



// API to make payment of appointment using Razorpay
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // Mocking Razorpay Order
        const order = {
            id: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY || 'INR',
            receipt: appointmentId,
        }

        // Save mock order ID to appointment for verification
        await appointmentModel.findByIdAndUpdate(appointmentId, { orderId: order.id })

        res.json({ success: true, order })

    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body

        // Find appointment by orderId
        const appointmentData = await appointmentModel.findOne({ orderId: razorpay_order_id })

        if (appointmentData) {
            await appointmentModel.findByIdAndUpdate(appointmentData._id, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        } else {
            res.json({ success: false, message: 'Payment verification failed' })
        }

    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

const subscribeToNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // Send subscription email
        try {
            await sendSubscriptionEmail(email);
        } catch (emailError) {
            logger.error("Email error:", emailError);
            // We can still return success to the user, but maybe log it
        }

        res.json({ success: true, message: 'Subscribed successfully' });

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { registerUser, loginUser, googleAuth, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentStripe, verifyStripe, addReview, getDoctorReviews, rescheduleAppointment, toggleFavoriteDoctor, getFavoriteDoctors, subscribeToNewsletter, paymentRazorpay, verifyRazorpay }
