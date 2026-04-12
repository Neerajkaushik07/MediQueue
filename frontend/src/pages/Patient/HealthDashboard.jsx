import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import DashboardHeader from '../../components/Dashboard/DashboardHeader'
import StatCard from '../../components/Dashboard/StatCard'
import ActionGrid from '../../components/Dashboard/ActionGrid'
import AppointmentList from '../../components/Dashboard/AppointmentList'
import axios from 'axios'
import {
    FaUserMd, FaPills, FaHeartbeat, FaFileMedicalAlt,
    FaVideo, FaAmbulance, FaUsers, FaBookMedical,
    FaCalendarCheck, FaMicroscope
} from 'react-icons/fa'

const HealthDashboard = () => {
    const navigate = useNavigate()
    const { token, userData, backendUrl } = useContext(AppContext)
    const [stats, setStats] = useState({
        appointmentsUpcoming: 0,
        prescriptions: 0,
        records: 0,
        reports: 0
    })
    const [latestMetrics, setLatestMetrics] = useState(null)
    const [upcomingAppointments, setUpcomingAppointments] = useState([])
    const [dashboardLoading, setDashboardLoading] = useState(false)
    const [dashboardError, setDashboardError] = useState('')
    const [lastUpdated, setLastUpdated] = useState(null)

    // Actions Configuration
    const healthActions = [
        {
            title: 'Medical Records',
            subtitle: 'View your history',
            icon: FaFileMedicalAlt,
            path: '/medical-records',
            color: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Medications',
            subtitle: 'Track prescriptions',
            icon: FaPills,
            path: '/medications',
            color: 'from-green-500 to-green-600'
        },
        {
            title: 'Health Metrics',
            subtitle: 'Monitor vitals',
            icon: FaHeartbeat,
            path: '/health-metrics',
            color: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Lab Reports',
            subtitle: 'Access test results',
            icon: FaMicroscope,
            path: '/lab-reports',
            color: 'from-pink-500 to-pink-600'
        },
        {
            title: 'Find Doctors',
            subtitle: 'Book appointments',
            icon: FaUserMd,
            path: '/doctors',
            color: 'from-indigo-500 to-indigo-600'
        },
        {
            title: 'Teleconsultation',
            subtitle: 'Video consults',
            icon: FaVideo,
            path: '/teleconsultation',
            color: 'from-cyan-500 to-cyan-600'
        },
        {
            title: 'Emergency',
            subtitle: 'Quick help',
            icon: FaAmbulance,
            path: '/emergency',
            color: 'from-red-500 to-red-600'
        },
        {
            title: 'Family Health',
            subtitle: 'Manage dependents',
            icon: FaUsers,
            path: '/family-health',
            color: 'from-orange-500 to-orange-600'
        },
        {
            title: 'Health Education',
            subtitle: 'Stay informed',
            icon: FaBookMedical,
            path: '/health-blog',
            color: 'from-yellow-500 to-yellow-600'
        }
    ]

    const parseSlotDate = (slotDate) => {
        if (!slotDate || typeof slotDate !== 'string') return null
        const normalized = slotDate.replace(/_/g, '-')
        const [d, m, y] = normalized.split('-').map(Number)
        if (!d || !m || !y) return null
        const parsed = new Date(y, m - 1, d)
        return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    const fetchDashboardData = async () => {
        if (!token) return

        setDashboardLoading(true)
        setDashboardError('')

        const results = await Promise.allSettled([
            axios.get(backendUrl + '/api/user/appointments', { headers: { token } }),
            axios.get(backendUrl + '/api/health/metrics/latest', { headers: { token } }),
            axios.get(backendUrl + '/api/health/prescriptions', { headers: { token } }),
            axios.get(backendUrl + '/api/health/medical-records', { headers: { token } }),
            axios.get(backendUrl + '/api/health/lab-reports', { headers: { token } })
        ])

        const [appointmentsRes, metricsRes, presRes, recordsRes, labRes] = results

        let appointments = []
        if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value?.data?.success) {
            appointments = Array.isArray(appointmentsRes.value.data.appointments)
                ? appointmentsRes.value.data.appointments
                : []
        }

        const now = new Date()
        const upcoming = appointments
            .filter((appt) => !appt.cancelled && !appt.isCompleted)
            .map((appt) => ({ ...appt, parsedDate: parseSlotDate(appt.slotDate) }))
            .filter((appt) => !appt.parsedDate || appt.parsedDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
            .sort((a, b) => {
                const aTime = a.parsedDate ? a.parsedDate.getTime() : Number.MAX_SAFE_INTEGER
                const bTime = b.parsedDate ? b.parsedDate.getTime() : Number.MAX_SAFE_INTEGER
                return aTime - bTime
            })

        setUpcomingAppointments(upcoming.slice(0, 4))

        if (metricsRes.status === 'fulfilled' && metricsRes.value?.data?.success) {
            const metricsPayload = metricsRes.value.data.metrics || metricsRes.value.data.latestMetric || null
            setLatestMetrics(metricsPayload)
        } else {
            setLatestMetrics(null)
        }

        const prescriptionsCount = presRes.status === 'fulfilled' && presRes.value?.data?.success
            ? (presRes.value.data.prescriptions || []).length
            : 0

        const recordsCount = recordsRes.status === 'fulfilled' && recordsRes.value?.data?.success
            ? (recordsRes.value.data.records || []).length
            : 0

        const reportsCount = labRes.status === 'fulfilled' && labRes.value?.data?.success
            ? (labRes.value.data.reports || []).length
            : 0

        setStats({
            appointmentsUpcoming: upcoming.length,
            prescriptions: prescriptionsCount,
            records: recordsCount,
            reports: reportsCount
        })

        const failedCount = results.filter(result => result.status === 'rejected').length
        if (failedCount > 0) {
            setDashboardError('Some widgets could not be fully updated. Showing available data.')
        }

        setLastUpdated(new Date())
        setDashboardLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [token, backendUrl])

    const widgetCards = [
        {
            title: 'Blood Pressure',
            value: latestMetrics?.blood_pressure ? `${latestMetrics.blood_pressure.systolic}/${latestMetrics.blood_pressure.diastolic}` : '--/--',
            subtext: 'mmHg',
            icon: FaHeartbeat,
            colorClass: 'bg-red-50 border border-red-100',
            iconColorClass: 'text-red-500',
            onClick: () => navigate('/health-metrics')
        },
        {
            title: 'Weight',
            value: latestMetrics?.weight ? latestMetrics.weight.value : '--',
            subtext: 'kg',
            icon: FaUserMd,
            colorClass: 'bg-blue-50 border border-blue-100',
            iconColorClass: 'text-blue-500',
            onClick: () => navigate('/health-metrics')
        },
        {
            title: 'Upcoming Appointments',
            value: stats.appointmentsUpcoming,
            subtext: 'Scheduled',
            icon: FaCalendarCheck,
            colorClass: 'bg-green-50 border border-green-100',
            iconColorClass: 'text-green-500',
            onClick: () => navigate('/my-appointments')
        },
        {
            title: 'Prescriptions',
            value: stats.prescriptions,
            subtext: 'Available',
            icon: FaPills,
            colorClass: 'bg-purple-50 border border-purple-100',
            iconColorClass: 'text-purple-500',
            onClick: () => navigate('/medications')
        },
        {
            title: 'Medical Records',
            value: stats.records,
            subtext: 'Documents',
            icon: FaFileMedicalAlt,
            colorClass: 'bg-indigo-50 border border-indigo-100',
            iconColorClass: 'text-indigo-500',
            onClick: () => navigate('/medical-records')
        },
        {
            title: 'Lab Reports',
            value: stats.reports,
            subtext: 'Results',
            icon: FaMicroscope,
            colorClass: 'bg-pink-50 border border-pink-100',
            iconColorClass: 'text-pink-500',
            onClick: () => navigate('/lab-reports')
        }
    ]

    return (
        <div className='min-h-screen pt-4 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900'>
            {/* Header with Greeting */}
            <DashboardHeader
                name={userData?.name || 'Guest'}
                subtitle="Here's your health overview for today"
                image={userData?.image}
                status={{
                    label: lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Dashboard ready',
                    text: dashboardLoading ? 'Refreshing...' : 'Refresh Data',
                    isActive: !dashboardLoading,
                    icon: <FaCalendarCheck className='text-sm' />
                }}
                onStatusToggle={fetchDashboardData}
            />

            {dashboardError && (
                <div className='mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium'>
                    {dashboardError}
                </div>
            )}

            {/* Quick Stats Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10'>
                {widgetCards.map((widget) => (
                    <StatCard
                        key={widget.title}
                        title={widget.title}
                        value={widget.value}
                        subtext={widget.subtext}
                        icon={widget.icon}
                        colorClass={widget.colorClass}
                        iconColorClass={widget.iconColorClass}
                        loading={dashboardLoading}
                        onClick={widget.onClick}
                    />
                ))}
            </div>

            {/* Main Functions Grid */}
            <ActionGrid actions={healthActions} />

            {/* Recent/Upcoming Appointments */}
            <div className='mt-8'>
                <AppointmentList
                    appointments={upcomingAppointments}
                    title="Upcoming Appointments"
                    onViewAll={() => navigate('/my-appointments')}
                />
            </div>
        </div>
    )
}

export default HealthDashboard

