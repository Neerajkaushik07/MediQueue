import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import reviewModel from "../models/reviewModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import logger from '../config/logger.js';

// API for doctor registration
const registerDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;

        // Validating data
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // Hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const doctorData = {
            name,
            email,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address,
            date: Date.now()
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Doctor registered successfully" });

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API for doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({ email });

        if (!doctor) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get doctor profile for dashboard
const getDoctorProfile = async (req, res) => {
    try {
        const { docId } = req.body;
        const profileData = await doctorModel.findById(docId).select('-password');
        res.json({ success: true, profileData });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to update doctor profile
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available, about, name, phone, languages, qualifications, awards } = req.body;

        await doctorModel.findByIdAndUpdate(docId, {
            fees,
            address,
            available,
            about,
            name,
            phone,
            languages,
            qualifications,
            awards
        });

        res.json({ success: true, message: "Profile Updated" });

    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all doctors list for frontend
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email']);
        res.json({ success: true, doctors });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get doctor appointments
const doctorAppointments = async (req, res) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })
        res.json({ success: true, appointments })
    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId, diagnosis, medications, notes } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                isCompleted: true,
                diagnosis: diagnosis || '',
                medications: medications || [],
                notes: notes || ''
            })
            res.json({ success: true, message: 'Appointment Completed with Details' })
        } else {
            res.json({ success: false, message: 'Mark Failed' })
        }
    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update appointment details (diagnosis, medications, notes) without completing it/if already completed
const updateAppointmentDetails = async (req, res) => {
    try {
        const { docId, appointmentId, diagnosis, medications, notes } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                diagnosis,
                medications,
                notes
            })
            res.json({ success: true, message: 'Appointment Details Updated' })
        } else {
            res.json({ success: false, message: 'Update Failed' })
        }
    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            res.json({ success: true, message: 'Appointment Cancelled' })
        } else {
            res.json({ success: false, message: 'Cancellation Failed' })
        }
    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        let earnings = 0
        let dailyEarnings = 0
        let weeklyEarnings = 0
        let monthlyEarnings = 0

        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))
        const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
        const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount

                const aptDate = new Date(item.date)
                if (aptDate >= oneDayAgo) dailyEarnings += item.amount
                if (aptDate >= oneWeekAgo) weeklyEarnings += item.amount
                if (aptDate >= oneMonthAgo) monthlyEarnings += item.amount
            }
        })

        let patients = []
        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            dailyEarnings,
            weeklyEarnings,
            monthlyEarnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get patient history (all appointments for a specific patient)
const getPatientHistory = async (req, res) => {
    try {
        const { docId, userId } = req.body
        const appointments = await appointmentModel.find({ docId, userId })
        res.json({ success: true, appointments })
    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor reviews
const getDoctorReviews = async (req, res) => {
    try {
        const { docId } = req.body
        const reviews = await reviewModel.find({ doctorId: docId })
        res.json({ success: true, reviews })
    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get financial stats specifically
const getDoctorFinancialStats = async (req, res) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        const monthlyData = {}
        const now = new Date()

        for (let i = 0; i < 6; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthYear = date.toLocaleString('default', { month: 'short' })
            monthlyData[monthYear] = 0
        }

        appointments.forEach(item => {
            if (item.isCompleted || item.payment) {
                const aptDate = new Date(item.date)
                const monthYear = aptDate.toLocaleString('default', { month: 'short' })
                if (monthlyData.hasOwnProperty(monthYear)) {
                    monthlyData[monthYear] += item.amount
                }
            }
        })

        const chartData = Object.keys(monthlyData).map(month => ({
            month,
            amount: monthlyData[month]
        })).reverse()

        res.json({ success: true, chartData })
    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor schedule
const getDoctorSchedule = async (req, res) => {
    try {
        const { docId } = req.body
        const doctor = await doctorModel.findById(docId).select('schedule')
        if (doctor) {
            res.json({ success: true, schedule: doctor.schedule })
        } else {
            res.json({ success: false, message: 'Doctor not found' })
        }
    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update doctor schedule
const updateDoctorSchedule = async (req, res) => {
    try {
        const { docId, workingDays, startTime, endTime, slotDuration } = req.body

        await doctorModel.findByIdAndUpdate(docId, {
            schedule: {
                workingDays,
                startTime,
                endTime,
                slotDuration
            }
        })

        res.json({ success: true, message: 'Schedule Updated' })

    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    registerDoctor,
    loginDoctor,
    getAllDoctors,
    getDoctorProfile,
    updateDoctorProfile,
    getDoctorSchedule,
    updateDoctorSchedule,
    doctorAppointments,
    appointmentComplete,
    appointmentCancel,
    updateAppointmentDetails,
    getPatientHistory,
    getDoctorReviews,
    getDoctorFinancialStats,
    doctorDashboard
}
