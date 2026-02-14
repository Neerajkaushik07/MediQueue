import React, { useContext, useEffect, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaHeart, FaFileMedical, FaPills, FaChartLine, FaUserCircle, FaLightbulb } from 'react-icons/fa'
import axios from 'axios'

import DashboardHeader from '../components/Dashboard/DashboardHeader'
import StatCard from '../components/Dashboard/StatCard'
import ActionGrid from '../components/Dashboard/ActionGrid'
import AppointmentList from '../components/Dashboard/AppointmentList'

const PatientDashboard = () => {
    const { token, userData, backendUrl, isDemoMode } = useContext(AppContext)
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)



    const fetchAppointments = useCallback(async () => {
        try {
            if (token && !isDemoMode) {
                const { data } = await axios.get(backendUrl + '/api/user/appointments', {
                    headers: { token }
                })
                if (data.success) {
                    setAppointments(data.appointments.slice(0, 5)) // Get latest 5
                }
            } else {
                setAppointments([
                    {
                        _id: 'mock1',
                        docData: { name: 'Dr. Richard James', speciality: 'General Physician', image: assets.doc1 },
                        slotDate: '24_10_2024',
                        slotTime: '10:00 AM',
                        cancelled: false,
                        isCompleted: false
                    },
                    {
                        _id: 'mock2',
                        docData: { name: 'Dr. Sarah Smith', speciality: 'Gynecologist', image: assets.doc2 },
                        slotDate: '25_10_2024',
                        slotTime: '11:00 AM',
                        cancelled: false,
                        isCompleted: true
                    }
                ])
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    }, [backendUrl, token, isDemoMode])

    useEffect(() => {
        fetchAppointments()
    }, [fetchAppointments])

    const quickActions = [
        { icon: FaCalendarAlt, title: 'Book Appointment', path: '/doctors', color: 'from-blue-500 to-blue-600' },
        { icon: FaHeart, title: 'Favorite Doctors', path: '/my-favorites', color: 'from-pink-500 to-pink-600' },
        { icon: FaFileMedical, title: 'Medical Records', path: '/medical-records', color: 'from-green-500 to-green-600' },
        { icon: FaPills, title: 'Medications', path: '/medications', color: 'from-purple-500 to-purple-600' },
        { icon: FaChartLine, title: 'Health Metrics', path: '/health-metrics', color: 'from-orange-500 to-orange-600' },
        { icon: FaUserCircle, title: 'My Profile', path: '/my-profile', color: 'from-indigo-500 to-indigo-600' },
        { icon: FaLightbulb, title: 'Health Tips', path: '/health-tips', color: 'from-teal-500 to-teal-600' },
    ]

    return (
        <div className='min-h-screen py-8'>
            <div className='max-w-7xl mx-auto'>
                <DashboardHeader
                    name={userData?.name || 'Patient'}
                    subtitle="Here's your health dashboard overview"
                    image={userData?.image}
                />

                <ActionGrid actions={quickActions} />

                {/* Stats Overview */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    <StatCard
                        title="Total Appointments"
                        value={appointments.length}
                        subtext="All time"
                        icon={FaCalendarAlt}
                        iconColorClass="text-primary"
                    />
                    <StatCard
                        title="Upcoming"
                        value={appointments.filter(apt => !apt.cancelled && !apt.isCompleted).length}
                        subtext="This month"
                        icon={FaCalendarAlt}
                        iconColorClass="text-blue-500"
                    />
                    <StatCard
                        title="Completed"
                        value={appointments.filter(apt => apt.isCompleted).length}
                        subtext="Total"
                        icon={FaFileMedical}
                        iconColorClass="text-green-500"
                    />
                </div>

                <AppointmentList
                    appointments={appointments}
                    onViewAll={() => navigate('/my-appointments')}
                    emptyMessage={loading ? "Loading..." : "No appointments yet"}
                />
            </div>
        </div>
    )
}

export default PatientDashboard
