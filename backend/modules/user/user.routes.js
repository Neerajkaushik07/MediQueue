import express from 'express';
import { registerUser, loginUser, googleAuth, getProfile, updateProfile, bookAppointment, bookAppointmentLock, cancelAppointmentLock, listAppointment, cancelAppointment, completeAppointment, paymentStripe, verifyStripe, addReview, getDoctorReviews, rescheduleAppointment, toggleFavoriteDoctor, getFavoriteDoctors } from './user.controller.js';
import authUser from '../../middlewares/authUser.js';
import upload from '../../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/google-auth", googleAuth)
userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.post("/book-appointment-lock", authUser, bookAppointmentLock)
userRouter.post("/cancel-appointment-lock", authUser, cancelAppointmentLock)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.post("/complete-appointment", authUser, completeAppointment)
userRouter.post("/reschedule-appointment", authUser, rescheduleAppointment)
userRouter.post("/payment-stripe", authUser, paymentStripe)
userRouter.post("/verify-stripe", authUser, verifyStripe)

userRouter.post("/add-review", authUser, addReview)
userRouter.post("/doctor-reviews", getDoctorReviews)
userRouter.post("/toggle-favorite", authUser, toggleFavoriteDoctor)
userRouter.get("/favorite-doctors", authUser, getFavoriteDoctors)








export default userRouter;