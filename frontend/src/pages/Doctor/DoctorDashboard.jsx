import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'

const DoctorDashboard = () => {
    const { backendUrl, token, userRole, currencySymbol, userData, isDemoMode } = useContext(AppContext)
    const [dashData, setDashData] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [actionLoadingId, setActionLoadingId] = useState('')
    const navigate = useNavigate()

    const getDashData = useCallback(async (manualRefresh = false) => {
        if (manualRefresh) setRefreshing(true)
        try {
            if (isDemoMode) {
                setDashData({
                    dailyEarnings: 4500,
                    weeklyEarnings: 28000,
                    monthlyEarnings: 125000,
                    earnings: 95000,
                    appointments: 120,
                    latestAppointments: [
                        {
                            _id: 'mock_apt_1',
                            userData: { name: 'Sarah Wilson', image: assets.profile_pic },
                            slotDate: '15_02_2026',
                            slotTime: '10:30 AM',
                            cancelled: false,
                            isCompleted: false
                        },
                        {
                            _id: 'mock_apt_2',
                            userData: { name: 'John Miller', image: assets.profile_pic },
                            slotDate: '14_02_2026',
                            slotTime: '02:00 PM',
                            cancelled: false,
                            isCompleted: true
                        },
                        {
                            _id: 'mock_apt_3',
                            userData: { name: 'Elena Brown', image: assets.profile_pic },
                            slotDate: '16_02_2026',
                            slotTime: '11:45 AM',
                            cancelled: true,
                            isCompleted: false
                        }
                    ]
                })
                setLastUpdated(new Date())
                return
            }
            if (userRole === 'doctor' && token) {
                const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { Authorization: `Bearer ${token}` } })
                if (data.success) {
                    setDashData(data.dashData)
                    setLastUpdated(new Date())
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            console.error('Error in getDashData:', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setRefreshing(false)
        }
    }, [backendUrl, token, userRole, isDemoMode])

    const completeAppointment = async (appointmentId) => {
        if (isDemoMode) {
            toast.info('Changes cannot be saved in Demo Mode')
            return
        }
        try {
            setActionLoadingId(appointmentId)
            if (userRole === 'doctor' && token) {
                const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { Authorization: `Bearer ${token}` } })
                if (data.success) {
                    toast.success('Appointment completed')
                    getDashData()
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error('Failed to complete appointment')
        } finally {
            setActionLoadingId('')
        }
    }

    const cancelAppointment = async (appointmentId) => {
        if (isDemoMode) {
            toast.info('Changes cannot be saved in Demo Mode')
            return
        }
        try {
            setActionLoadingId(appointmentId)
            if (userRole === 'doctor' && token) {
                const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { Authorization: `Bearer ${token}` } })
                if (data.success) {
                    toast.success('Appointment cancelled')
                    getDashData()
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error('Failed to cancel appointment')
        } finally {
            setActionLoadingId('')
        }
    }

    useEffect(() => {
        getDashData()
    }, [getDashData])

    const recentAppointments = useMemo(() => {
        return Array.isArray(dashData?.latestAppointments) ? dashData.latestAppointments : []
    }, [dashData])

    const completedCount = useMemo(() => recentAppointments.filter(item => item.isCompleted).length, [recentAppointments])
    const cancelledCount = useMemo(() => recentAppointments.filter(item => item.cancelled).length, [recentAppointments])
    const activeCount = useMemo(() => recentAppointments.filter(item => !item.cancelled && !item.isCompleted).length, [recentAppointments])
    const careScore = useMemo(() => {
        if (!recentAppointments.length) return 0
        return Math.round(((completedCount + activeCount) / recentAppointments.length) * 100)
    }, [recentAppointments, completedCount, activeCount])

    const sessionSuccess = useMemo(() => {
        if (!recentAppointments.length) return 0
        return Math.round((completedCount / recentAppointments.length) * 100)
    }, [recentAppointments, completedCount])

    const statCards = [
        {
            label: "Today's Revenue",
            value: dashData?.dailyEarnings || 0,
            sub: `${activeCount} active today`,
            iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconWrap: 'bg-emerald-50 text-emerald-600',
            subClass: 'text-emerald-600'
        },
        {
            label: 'Weekly Revenue',
            value: dashData?.weeklyEarnings || 0,
            sub: `${completedCount} completed sessions`,
            iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            iconWrap: 'bg-violet-50 text-violet-600',
            subClass: 'text-violet-600'
        },
        {
            label: 'Monthly Revenue',
            value: dashData?.monthlyEarnings || 0,
            sub: `${currencySymbol}${dashData?.earnings || 0} available`,
            iconPath: 'M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
            iconWrap: 'bg-sky-50 text-sky-600',
            subClass: 'text-sky-600'
        },
        {
            label: 'Total Patients',
            value: dashData?.appointments || 0,
            sub: `${cancelledCount} cancelled recently`,
            iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            iconWrap: 'bg-indigo-50 text-indigo-600',
            subClass: 'text-indigo-600'
        }
    ]

    const operationsActions = [
        { label: 'Appointments', sub: 'Schedule Management', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', route: '/doctor-appointments', className: 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:border-cyan-300' },
        { label: 'Patient Logs', sub: 'Clinical Records', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', route: '/doctor-patients', className: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300' },
        { label: 'Set Availability', sub: 'Work Schedule', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', route: '/doctor-schedule', className: 'bg-violet-50 text-violet-700 border-violet-100 hover:border-violet-300' },
        { label: 'Finances', sub: 'Payouts & Reports', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', route: '/doctor-finances', className: 'bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300' },
        { label: 'Live Chat', sub: 'Active Consultations', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', route: '/teleconsultation?role=doctor', className: 'bg-rose-50 text-rose-700 border-rose-100 hover:border-rose-300' }
    ]

    if (dashData === null) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </div>
        )
    }

    return (
        <div className='m-5 max-w-7xl mx-auto'>
            {/* Professional Welcome Header */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4'>
                <div>
                    <h1 className='text-4xl font-black text-gray-900 dark:text-white font-poppins tracking-tight'>
                        Welcome back, <span className='text-primary'>Dr. {userData?.name.split(' ')[0] || 'Doctor'}</span>! 👋
                    </h1>
                    <p className='text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></span>
                        Your practice is performing excellently today.
                    </p>
                </div>
                <div className='flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-soft border border-gray-100'>
                    <div className='text-right px-2'>
                        <p className='text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>Last Updated</p>
                        <p className='text-sm font-bold text-gray-800 dark:text-gray-100 uppercase'>
                            {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'}
                        </p>
                    </div>
                    <button
                        onClick={() => getDashData(true)}
                        disabled={refreshing}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${refreshing ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'}`}
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                {statCards.map((stat, i) => (
                    <div key={i} className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-100 hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 group'>
                        <div className='flex items-center justify-between mb-4'>
                            <div className={`${stat.iconWrap} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d={stat.iconPath} /></svg>
                            </div>
                            <span className='text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400'>{stat.label.split(' ')[0]}</span>
                        </div>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>{stat.label}</p>
                        <p className='text-3xl font-black text-gray-900 dark:text-white mt-1 font-poppins tracking-tight'>
                            {stat.label.includes('Revenue') ? currencySymbol : ''}{stat.value || 0}
                        </p>
                        <div className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${stat.subClass}`}>
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z' clipRule='evenodd' /></svg>
                            <span>{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Intelligence & Actions */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8'>
                {/* Operations Center */}
                <div className='lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 overflow-hidden'>
                    <div className='px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50'>
                        <div>
                            <h3 className='text-lg font-bold text-gray-900 dark:text-white font-poppins'>Operations Center</h3>
                            <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>Control your digital clinic</p>
                        </div>

                    </div>
                    <div className='p-8 grid grid-cols-1 md:grid-cols-3 gap-6'>
                        {operationsActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.route)}
                                className={`flex flex-col items-center p-6 rounded-2xl border transition-all group ${action.className}`}
                            >
                                <div className='mb-4 w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800/70 group-hover:scale-110 transition-transform'>
                                    <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d={action.icon} /></svg>
                                </div>
                                <span className='font-bold text-gray-900 dark:text-white'>{action.label}</span>
                                <span className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1'>{action.sub}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Digital Wallet & Metrics */}
                <div className='lg:col-span-4 space-y-6'>
                    <div className='bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-2xl p-7 text-white shadow-medical relative overflow-hidden group'>
                        <div className='absolute -right-10 -bottom-10 w-40 h-40 bg-white dark:bg-gray-800/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>
                        <h3 className='text-xs font-black uppercase tracking-[0.2em] text-indigo-200/80'>Clinical Wallet</h3>
                        <div className='mt-6 mb-8'>
                            <p className='text-4xl font-black font-poppins truncate'>{currencySymbol}{dashData.earnings || 0}</p>
                            <p className='text-xs font-medium text-indigo-300 mt-1 flex items-center gap-1.5'>
                                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                                Available for immediate payout
                            </p>
                        </div>
                        <div className='flex gap-3'>
                            <button
                                onClick={() => navigate('/doctor-finances')}
                                className='flex-1 h-11 bg-white dark:bg-gray-800 text-indigo-700 rounded-xl text-xs font-bold hover:bg-neutral-100 transition-all shadow-lg active:scale-95'
                            >
                                Withdraw Funds
                            </button>
                        </div>
                    </div>

                    <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 p-6'>
                        <h3 className='text-sm font-black text-gray-900 dark:text-white mb-5 uppercase tracking-wider flex items-center justify-between'>
                            Efficiency
                            <span className='text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full'>Elite Tier</span>
                        </h3>
                        <div className='space-y-6'>
                            {[
                                { label: 'Patient Care', val: careScore, color: 'text-green-500', bg: 'bg-green-500' },
                                { label: 'Session Success', val: sessionSuccess, color: 'text-blue-500', bg: 'bg-blue-500' }
                            ].map((m, i) => (
                                <div key={i}>
                                    <div className='flex justify-between text-xs font-bold mb-2'>
                                        <span className='text-gray-500 dark:text-gray-400'>{m.label}</span>
                                        <span className={m.color}>{m.val}%</span>
                                    </div>
                                    <div className='w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden px-[1px] py-[1px]'>
                                        <div className={`${m.bg} h-full rounded-full transition-all duration-1000`} style={{ width: `${m.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Appointment Feed */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 overflow-hidden'>
                <div className='px-8 py-6 border-b border-gray-100 flex justify-between items-center'>
                    <div className='flex items-center gap-3'>
                        <div className='bg-primary/10 p-2.5 rounded-xl'>
                            <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                        </div>
                        <h2 className='text-xl font-bold text-gray-900 dark:text-white font-poppins'>Recent Medical Activity</h2>
                    </div>
                    <button
                        onClick={() => navigate('/doctor-appointments')}
                        className='text-primary hover:bg-primary/5 px-4 py-2 rounded-lg font-bold text-xs transition-colors'
                    >
                        View Full History
                    </button>
                </div>

                <div className='divide-y divide-gray-50'>
                    {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
                        dashData.latestAppointments.slice(0, 6).map((item, index) => (
                            <div className='flex items-center justify-between p-6 hover:bg-gray-50 dark:bg-gray-900/50 transition-colors group' key={index}>
                                <div className='flex items-center gap-5 flex-1'>
                                    <div className='relative'>
                                        <img
                                            className='w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-soft group-hover:scale-105 transition-transform'
                                            src={item.userData?.image || assets.profile_pic}
                                            alt={item.userData?.name || 'Patient'}
                                            onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = assets.profile_pic
                                            }}
                                        />
                                        {!item.cancelled && !item.isCompleted && (
                                            <div className='absolute -top-1 -right-1 w-4 h-4 bg-primary border-2 border-white rounded-full'></div>
                                        )}
                                    </div>
                                    <div>
                                        <p className='font-bold text-gray-900 dark:text-white font-poppins text-lg leading-tight'>{item.userData?.name || 'Unknown Patient'}</p>
                                        <div className='flex items-center gap-3 mt-1.5'>
                                            <p className='text-xs font-bold text-gray-400 flex items-center gap-1'>
                                                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                                                {item.slotDate}
                                            </p>
                                            <span className='w-1 h-1 rounded-full bg-gray-300'></span>
                                            <p className='text-xs font-bold text-gray-400 flex items-center gap-1'>
                                                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                                                {item.slotTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center gap-4'>
                                    {item.cancelled ? (
                                        <span className='px-4 py-1.5 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100'>
                                            Cancelled
                                        </span>
                                    ) : item.isCompleted ? (
                                        <span className='px-4 py-1.5 bg-green-50 text-green-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100'>
                                            Completed
                                        </span>
                                    ) : (
                                        <div className='flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity'>
                                            <button
                                                onClick={() => cancelAppointment(item._id)}
                                                disabled={actionLoadingId === item._id}
                                                className='w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all shadow-sm dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed'
                                                title='Deny'
                                            >
                                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' /></svg>
                                            </button>
                                            <button
                                                onClick={() => completeAppointment(item._id)}
                                                disabled={actionLoadingId === item._id}
                                                className='flex items-center gap-2 px-5 bg-primary text-white rounded-xl text-xs font-extrabold hover:bg-primary-dark transition-all shadow-medical active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' /></svg>
                                                {actionLoadingId === item._id ? 'UPDATING...' : 'CHECK-IN'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-center py-20 bg-gray-50 dark:bg-gray-900/30'>
                            <div className='text-5xl mb-6 grayscale opacity-30'>📭</div>
                            <p className='text-gray-500 dark:text-gray-400 text-lg font-bold font-poppins'>No Recent Activity</p>
                            <p className='text-gray-400 text-sm mt-1 font-medium'>Your schedule is currently clear</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DoctorDashboard
