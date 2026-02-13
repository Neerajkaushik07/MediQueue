import express from 'express';
import { registerUser, loginUser, googleAuth, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentStripe, verifyStripe, addReview, getDoctorReviews, rescheduleAppointment, toggleFavoriteDoctor, getFavoriteDoctors, subscribeToNewsletter, paymentRazorpay, verifyRazorpay } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/google-auth", googleAuth)
userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.post("/reschedule-appointment", authUser, rescheduleAppointment)
userRouter.post("/payment-stripe", authUser, paymentStripe)
userRouter.post("/verify-stripe", authUser, verifyStripe)
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
userRouter.post("/add-review", authUser, addReview)
userRouter.post("/doctor-reviews", getDoctorReviews)
userRouter.post("/toggle-favorite", authUser, toggleFavoriteDoctor)
userRouter.get("/favorite-doctors", authUser, getFavoriteDoctors)
userRouter.post("/subscribe", subscribeToNewsletter)







export default userRouter;