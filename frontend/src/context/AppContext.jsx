import { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import { assets } from "../assets/assets";
import { useNavigate } from 'react-router-dom';

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token') || null)
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || null)
    const [isDemoMode, setIsDemoMode] = useState(sessionStorage.getItem('isDemoMode') === 'true' || false)
    const [userData, setUserData] = useState({
        name: 'Demo User',
        image: assets.profile_pic,
        email: 'demo@mediqueue.com',
        phone: '1234567890',
        address: {
            line1: '123 Demo St',
            line2: 'Demo City'
        },
        gender: 'Not Specified',
        dob: '2000-01-01'
    })



    const getDoctorsData = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {

            toast.error(error.message)
        }
    }, [backendUrl])

    const loadUserProfileData = useCallback(async () => {
        try {
            if (!token) return // Skip fetch if no token
            if (isDemoMode) return // Skip API calls in demo mode

            // Call different endpoints based on user role
            if (userRole === 'doctor') {
                const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { Authorization: `Bearer ${token}` } })

                if (data.success) {
                    setUserData(data.profileData)
                }
            } else if (userRole === 'patient') {
                const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })

                if (data.success) {
                    setUserData(data.userData)
                }
            }
        } catch (error) {
            // Error handled silently or with toast in other parts of the app
        }
    }, [backendUrl, token, userRole, isDemoMode])


    // Demo login functions
    const loginAsPatientDemo = () => {
        const demoToken = 'demo-patient-token-' + Date.now()
        const demoPatientData = {
            name: 'Alex Johnson',
            image: assets.profile_pic,
            email: 'patient.demo@mediqueue.com',
            phone: '+91 98765 43210',
            address: {
                line1: '456 Healthcare Avenue',
                line2: 'Mumbai, Maharashtra'
            },
            gender: 'Male',
            dob: '1990-05-15',
            bloodType: 'O+',
            height: '175 cm',
            weight: '70 kg'
        }

        sessionStorage.setItem('token', demoToken)
        sessionStorage.setItem('userRole', 'patient')
        sessionStorage.setItem('isDemoMode', 'true')

        setToken(demoToken)
        setUserRole('patient')
        setIsDemoMode(true)
        setUserData(demoPatientData)

        toast.success('🎉 Welcome to Patient Demo Mode!')
    }

    const loginAsDoctorDemo = () => {
        const demoToken = 'demo-doctor-token-' + Date.now()
        const demoDoctorData = {
            _id: 'demo-doctor-' + Date.now(),
            name: 'Dr. Sarah Williams',
            image: assets.profile_pic,
            email: 'doctor.demo@mediqueue.com',
            phone: '+91 98765 12345',
            address: {
                line1: 'Apollo Clinic, 789 Medical Street',
                line2: 'Delhi, India'
            },
            speciality: 'Cardiologist',
            degree: 'MBBS, MD (Cardiology)',
            experience: 12,
            about: 'Experienced cardiologist specializing in interventional cardiology and heart disease prevention. Committed to providing comprehensive cardiac care with a patient-centered approach.',
            fees: 800,
            available: true,
            languages: ['English', 'Hindi', 'Spanish'],
            qualifications: [
                'MBBS - All India Institute of Medical Sciences (2008)',
                'MD Cardiology - Harvard Medical School (2012)',
                'Fellowship in Interventional Cardiology (2014)'
            ],
            awards: [
                'Best Cardiologist Award 2022',
                'Excellence in Patient Care 2021',
                'Research Publication Award 2020'
            ],
            insurance: {
                provider: 'Medical Shield Pro',
                policyNo: 'MS-77428-AQ'
            }
        }

        sessionStorage.setItem('token', demoToken)
        sessionStorage.setItem('userRole', 'doctor')
        sessionStorage.setItem('isDemoMode', 'true')

        setToken(demoToken)
        setUserRole('doctor')
        setIsDemoMode(true)
        setUserData(demoDoctorData)

        toast.success('🎉 Welcome to Doctor Demo Mode!')
    }

    const logoutDemo = () => {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('userRole')
        sessionStorage.removeItem('isDemoMode')

        setToken(null)
        setUserRole(null)
        setIsDemoMode(false)
        setUserData({
            name: 'Demo User',
            image: assets.profile_pic,
            email: 'demo@mediqueue.com',
            phone: '1234567890',
            address: {
                line1: '123 Demo St',
                line2: 'Demo City'
            },
            gender: 'Not Specified',
            dob: '2000-01-01'
        })
    }

    useEffect(() => {
        getDoctorsData()
    }, [getDoctorsData])

    useEffect(() => {
        loadUserProfileData()
    }, [loadUserProfileData])



    const value = {
        doctors, getDoctorsData,
        currencySymbol,
        backendUrl,
        token, setToken,
        userRole, setUserRole,
        userData, setUserData, loadUserProfileData,
        isDemoMode, setIsDemoMode,
        loginAsPatientDemo, loginAsDoctorDemo, logoutDemo
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
