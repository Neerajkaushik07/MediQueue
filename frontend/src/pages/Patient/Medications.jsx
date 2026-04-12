import React, { useState, useContext, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'

const Medications = () => {
    const { backendUrl, token, isDemoMode } = useContext(AppContext)
    const [activeTab, setActiveTab] = useState('active')
    const [showAddModal, setShowAddModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [reminders, setReminders] = useState([
        {
            _id: 'demo1',
            name: 'Amoxicillin (Demo)',
            dosage: '500mg',
            frequency: '3 times daily',
            isActive: true,
            reminderTimes: ['09:00', '14:00', '21:00'],
            startDate: '2024-10-01',
            endDate: '2026-12-31',
            doctorName: 'Dr. Richard James',
            instructions: 'Take after food',
            mealTiming: 'after_food',
            intakeHistory: [],
            isDemo: true
        },
        {
            _id: 'demo2',
            name: 'Lisinopril (Demo)',
            dosage: '10mg',
            frequency: 'Once daily',
            isActive: true,
            reminderTimes: ['08:00'],
            startDate: '2024-09-01',
            endDate: '2026-12-31',
            doctorName: 'Dr. Sarah Smith',
            instructions: 'Take in the morning',
            mealTiming: 'before_food',
            intakeHistory: [],
            isDemo: true
        }
    ])

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: 'once_daily',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        doctorName: '',
        instructions: '',
        mealTiming: 'none',
        reminderTimes: ['08:00']
    })

    const fetchReminders = useCallback(async () => {
        if (isDemoMode) {
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/advanced-health/medication-reminders', { headers: { token } })
            if (data.success) {
                setReminders(prev => {
                    const demos = prev.filter(r => r.isDemo)
                    return [...demos, ...data.reminders]
                })
            }
        } catch (error) {
            console.error('Error fetching reminders:', error)
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token, isDemoMode]);

    useEffect(() => {
        if (token) {
            fetchReminders()
        }
    }, [token, fetchReminders])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.reminderTimes]
        newTimes[index] = value
        setFormData(prev => ({ ...prev, reminderTimes: newTimes }))
    }

    const addTimeField = () => {
        setFormData(prev => ({ ...prev, reminderTimes: [...prev.reminderTimes, '08:00'] }))
    }

    const removeTimeField = (index) => {
        const newTimes = formData.reminderTimes.filter((_, i) => i !== index)
        setFormData(prev => ({ ...prev, reminderTimes: newTimes }))
    }

    const handleAddReminder = async (e) => {
        e.preventDefault()
        if (isDemoMode) {
            toast.info('Changes cannot be saved in Demo Mode')
            setShowAddModal(false)
            return
        }
        try {
            const { data } = await axios.post(backendUrl + '/api/advanced-health/medication-reminders/add', formData, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                setShowAddModal(false)
                setFormData({
                    name: '',
                    dosage: '',
                    frequency: 'once_daily',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    doctorName: '',
                    instructions: '',
                    mealTiming: 'none',
                    reminderTimes: ['08:00']
                })
                fetchReminders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleLogIntake = async (reminderId, time, status = 'taken') => {
        if (reminderId.startsWith('demo')) {
            const dateStr = new Date().toDateString()
            setReminders(prev => prev.map(rem => {
                if (rem._id === reminderId) {
                    const existingHistory = rem.intakeHistory || []
                    // Filter out existing record for today and this time to avoid duplicates
                    const filteredHistory = existingHistory.filter(h => !(new Date(h.date).toDateString() === dateStr && h.time === time))
                    return {
                        ...rem,
                        intakeHistory: [...filteredHistory, { date: new Date(), time, status, taken: status === 'taken' }]
                    }
                }
                return rem
            }))
            toast.success(`Demo dose marked as ${status}!`)
            return
        }
        try {
            const { data } = await axios.post(`${backendUrl}/api/advanced-health/medication-reminders/${reminderId}/log`, { taken: status === 'taken', status, time }, { headers: { token } })
            if (data.success) {
                toast.success(`Dose marked as ${status}`)
                fetchReminders()
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDeleteReminder = async (reminderId) => {
        if (reminderId.startsWith('demo')) {
            setReminders(prev => prev.filter(r => r._id !== reminderId))
            toast.success('Demo reminder removed')
            return
        }
        try {
            const { data } = await axios.delete(`${backendUrl}/api/advanced-health/medication-reminders/${reminderId}`, { headers: { token } })
            if (data.success) {
                toast.success('Reminder discontinued')
                fetchReminders()
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const calculateAdherence = (reminder) => {
        if (!reminder.intakeHistory || reminder.intakeHistory.length === 0) return 0
        const taken = reminder.intakeHistory.filter(h => h.taken).length
        return Math.round((taken / reminder.intakeHistory.length) * 100)
    }

    const activeMeds = reminders.filter(m => m.isActive && (new Date(m.endDate) >= new Date() || !m.endDate))
    const pastMeds = reminders.filter(m => !m.isActive || (m.endDate && new Date(m.endDate) < new Date()))

    const displayMeds = activeTab === 'active' ? activeMeds : pastMeds

    // Schedule logic
    const todaySchedule = activeMeds.flatMap(med =>
        (med.reminderTimes || []).map(time => {
            const historyForTime = med.intakeHistory?.find(h =>
                new Date(h.date).toDateString() === new Date().toDateString() && h.time === time
            )
            return {
                ...med,
                scheduledTime: time,
                intakeStatus: historyForTime ? (historyForTime.status || (historyForTime.taken ? 'taken' : 'missed')) : 'pending',
                isTaken: historyForTime?.taken || historyForTime?.status === 'taken'
            }
        })
    ).sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))

    const groupedSchedule = {
        Morning: todaySchedule.filter(item => item.scheduledTime >= '05:00' && item.scheduledTime < '12:00'),
        Afternoon: todaySchedule.filter(item => item.scheduledTime >= '12:00' && item.scheduledTime < '17:00'),
        Evening: todaySchedule.filter(item => item.scheduledTime >= '17:00' && item.scheduledTime < '21:00'),
        Night: todaySchedule.filter(item => item.scheduledTime >= '21:00' || item.scheduledTime < '05:00')
    }

    const mealTimingLabels = {
        before_food: '🍽️ Before Food',
        with_food: '🥪 With Food',
        after_food: '🍽️ After Food',
        none: 'Anytime'
    }

    const averageAdherence = activeMeds.length > 0
        ? Math.round(activeMeds.reduce((acc, m) => acc + calculateAdherence(m), 0) / activeMeds.length)
        : 0
    const totalDailyDoses = activeMeds.reduce((acc, m) => acc + (m.reminderTimes || []).length, 0)
    const todayTakenCount = todaySchedule.filter(item => item.intakeStatus === 'taken').length

    return (
        <div className='min-h-screen pt-8 pb-20 px-4 md:px-6'>
            <div className='max-w-7xl mx-auto'>
                <div className='relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-6 md:p-8 mb-8'>
                    <div className='absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl'></div>
                    <div className='absolute -right-16 -bottom-16 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl'></div>
                    <div className='relative flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between'>
                        <div>
                            <p className='text-xs md:text-sm font-semibold uppercase tracking-wide text-cyan-700 mb-2'>Medication Tracker</p>
                            <h1 className='text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2'>Medications & Reminders</h1>
                            <p className='text-slate-600 dark:text-slate-300 max-w-xl'>Keep prescriptions organized, track adherence, and log each dose from one place.</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className='px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                            </svg>
                            Add Medication
                        </button>
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Active Medications</p>
                        <p className='text-3xl font-black text-slate-900 dark:text-white'>{activeMeds.length}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Daily Doses</p>
                        <p className='text-3xl font-black text-emerald-600'>{totalDailyDoses}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Average Adherence</p>
                        <p className='text-3xl font-black text-cyan-700'>{averageAdherence}%</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Taken Today</p>
                        <p className='text-3xl font-black text-violet-700'>{todayTakenCount}</p>
                    </div>
                </div>

                <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 mb-8 inline-flex shadow-sm dark:shadow-none'>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-6 py-3 rounded-xl text-sm md:text-base font-semibold transition-all ${activeTab === 'active'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-gray-800'
                            }`}
                    >
                        Active ({activeMeds.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-6 py-3 rounded-xl text-sm md:text-base font-semibold transition-all ${activeTab === 'past'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-gray-800'
                            }`}
                    >
                        Past ({pastMeds.length})
                    </button>
                </div>

                <div className='space-y-4 mb-8'>
                    {loading && reminders.length === 0 ? (
                        <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center'>
                            <div className='inline-flex items-center gap-3 text-slate-600 dark:text-slate-300'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600'></div>
                                <span className='font-semibold'>Loading medications...</span>
                            </div>
                        </div>
                    ) : displayMeds.length === 0 ? (
                        <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center'>
                            <div className='text-6xl mb-4'>💊</div>
                            <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>No Medications</h3>
                            <p className='text-slate-600 dark:text-slate-300 mb-6'>
                                You don't have any {activeTab} medications
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className='px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all'
                            >
                                Add Medication
                            </button>
                        </div>
                    ) : (
                        displayMeds.map((med) => (
                            <article
                                key={med._id}
                                className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-lg transition-all'
                            >
                                <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <div className='w-12 h-12 bg-gradient-to-r from-cyan-600 to-sky-700 rounded-xl flex items-center justify-center text-2xl text-white'>
                                                💊
                                            </div>
                                            <div>
                                                <h3 className='text-xl font-bold text-slate-900 dark:text-white'>{med.name}</h3>
                                                <p className='text-slate-600 dark:text-slate-300 text-sm'>{med.dosage} • {(med.frequency || '').replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {med.isActive && (
                                        <div className='lg:text-right'>
                                            <div className='flex items-center gap-2 mb-1 lg:justify-end'>
                                                <span className='text-sm text-slate-600 dark:text-slate-300'>Adherence</span>
                                                <span className='font-bold text-lg text-emerald-600'>{calculateAdherence(med)}%</span>
                                            </div>
                                            <div className='w-32 h-2 bg-slate-200 rounded-full overflow-hidden'>
                                                <div
                                                    className='h-full bg-gradient-to-r from-emerald-500 to-teal-500'
                                                    style={{ width: `${calculateAdherence(med)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Duration</p>
                                        <p className='font-semibold text-slate-900 dark:text-white'>
                                            {new Date(med.startDate).toLocaleDateString()} - {med.endDate ? new Date(med.endDate).toLocaleDateString() : 'Ongoing'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Prescribed by</p>
                                        <p className='font-semibold text-slate-900 dark:text-white'>{med.doctorName || 'Not specified'}</p>
                                    </div>
                                </div>

                                {med.instructions && (
                                    <div className='bg-cyan-50 border border-cyan-100 p-4 rounded-xl mb-4'>
                                        <p className='text-sm text-cyan-900'>
                                            <span className='font-semibold'>Instructions:</span> {med.instructions}
                                        </p>
                                    </div>
                                )}

                                {med.mealTiming && med.mealTiming !== 'none' && (
                                    <div className='mb-4'>
                                        <span className='inline-block px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-bold'>
                                            {mealTimingLabels[med.mealTiming]}
                                        </span>
                                    </div>
                                )}

                                {med.isActive && (
                                    <div className='mb-4'>
                                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-2'>Reminder Times</p>
                                        <div className='flex gap-2 flex-wrap'>
                                            {med.reminderTimes.map((time, index) => (
                                                <span
                                                    key={index}
                                                    className='px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2'
                                                >
                                                    <span>⏰</span>
                                                    {time}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className='flex gap-2'>
                                    {med.isActive && (
                                        <button
                                            onClick={() => handleDeleteReminder(med._id)}
                                            className='px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors'
                                        >
                                            Discontinue
                                        </button>
                                    )}
                                    {med.isDemo && (
                                        <span className='px-4 py-2 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-sm font-semibold'>Demo Data</span>
                                    )}
                                </div>
                            </article>
                        ))
                    )}
                </div>

                {/* Today's Schedule */}
                {activeTab === 'active' && todaySchedule.length > 0 && (
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-none mb-8'>
                        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Today's Medication Schedule</h2>
                        <p className='text-slate-600 dark:text-slate-300 mb-6'>Log each dose to keep adherence accurate.</p>
                        <div className='space-y-8'>
                            {Object.entries(groupedSchedule).map(([period, items]) => {
                                if (items.length === 0) return null;

                                const periodIcons = { Morning: '🌅', Afternoon: '☀️', Evening: '🌙', Night: '🌌' };

                                return (
                                    <div key={period} className='border-l-4 border-cyan-500 pl-4'>
                                        <h3 className='text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2'>
                                            <span>{periodIcons[period]}</span> {period}
                                        </h3>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            {items.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex flex-col p-4 rounded-xl border transition-colors ${item.intakeStatus === 'taken' ? 'bg-green-50 border-green-200' :
                                                        item.intakeStatus === 'skipped' ? 'bg-yellow-50 border-yellow-200' :
                                                            item.intakeStatus === 'missed' ? 'bg-red-50 border-red-200' :
                                                                'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:shadow-md'
                                                        }`}
                                                >
                                                    <div className='flex items-start justify-between mb-3'>
                                                        <div className='flex items-center gap-3'>
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm dark:shadow-none ${item.intakeStatus === 'taken' ? 'bg-green-500' :
                                                                item.intakeStatus === 'skipped' ? 'bg-yellow-500' :
                                                                    item.intakeStatus === 'missed' ? 'bg-red-500' :
                                                                        'bg-gradient-to-r from-cyan-600 to-sky-700'
                                                                }`}>
                                                                {item.scheduledTime}
                                                            </div>
                                                            <div>
                                                                <p className='font-bold text-lg text-slate-900 dark:text-white'>{item.name}</p>
                                                                <p className='text-slate-600 dark:text-slate-300 text-sm'>{item.dosage}</p>
                                                            </div>
                                                        </div>
                                                        {item.mealTiming && item.mealTiming !== 'none' && (
                                                            <span className='px-2 py-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 rounded text-[10px] uppercase font-bold tracking-wider'>
                                                                {(mealTimingLabels[item.mealTiming] || item.mealTiming).replace(/[^a-zA-Z]/g, '').replace('Food', '').trim()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className='flex gap-2 mt-auto pt-2 border-t border-white/50'>
                                                        {item.intakeStatus === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleLogIntake(item._id, item.scheduledTime, 'taken')}
                                                                    className='flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm dark:shadow-none transition-all'
                                                                >
                                                                    Take ✅
                                                                </button>
                                                                <button
                                                                    onClick={() => handleLogIntake(item._id, item.scheduledTime, 'skipped')}
                                                                    className='flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg shadow-sm dark:shadow-none transition-all'
                                                                >
                                                                    Skip ⏭️
                                                                </button>
                                                                <button
                                                                    onClick={() => handleLogIntake(item._id, item.scheduledTime, 'missed')}
                                                                    className='flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm dark:shadow-none transition-all'
                                                                >
                                                                    Missed ⚠️
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className='flex items-center justify-between w-full'>
                                                                <span className={`font-semibold text-sm ${item.intakeStatus === 'taken' ? 'text-green-700' :
                                                                    item.intakeStatus === 'skipped' ? 'text-yellow-700' :
                                                                        'text-red-700'
                                                                    }`}>
                                                                    Status: {item.intakeStatus.charAt(0).toUpperCase() + item.intakeStatus.slice(1)}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleLogIntake(item._id, item.scheduledTime, 'pending')}
                                                                    className='text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 underline'
                                                                >
                                                                    Undo
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Add Medication Modal */}
                {showAddModal && (
                    <div className='fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                        <div className='bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-gray-700'>
                            <div className='px-6 py-5 border-b border-slate-200 dark:border-gray-700 bg-gradient-to-r from-cyan-50 to-emerald-50 flex items-center justify-between'>
                                <div>
                                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>Add Medication</h2>
                                    <p className='text-sm text-slate-600 dark:text-slate-300 mt-1'>Set dose timing and care instructions in one go.</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className='text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors'>
                                    <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </div>

                            <div className='p-6 md:p-8 overflow-y-auto max-h-[75vh]'>

                                <form onSubmit={handleAddReminder} className='space-y-4'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Medication Name *</label>
                                            <input required type='text' name='name' value={formData.name} onChange={handleInputChange} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' placeholder='e.g., Aspirin' />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Dosage *</label>
                                            <input required type='text' name='dosage' value={formData.dosage} onChange={handleInputChange} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' placeholder='e.g., 500mg' />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Frequency *</label>
                                            <select name='frequency' value={formData.frequency} onChange={handleInputChange} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'>
                                                <option value='once_daily'>Once Daily</option>
                                                <option value='twice_daily'>Twice Daily</option>
                                                <option value='three_times_daily'>Three Times Daily</option>
                                                <option value='four_times_daily'>Four Times Daily</option>
                                                <option value='as_needed'>As Needed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Doctor's Name</label>
                                            <input type='text' name='doctorName' value={formData.doctorName} onChange={handleInputChange} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' placeholder='Dr. Smith' />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Start Date *</label>
                                            <input required type='date' name='startDate' value={formData.startDate} onChange={handleInputChange} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>End Date</label>
                                            <input type='date' name='endDate' value={formData.endDate} onChange={handleInputChange} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' />
                                        </div>
                                        <div className='md:col-span-2'>
                                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Instructions</label>
                                            <textarea name='instructions' value={formData.instructions} onChange={handleInputChange} rows='2' className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' placeholder='e.g., Take after food'></textarea>
                                        </div>
                                        <div className='md:col-span-2'>
                                            <div className='flex items-center justify-between mb-2'>
                                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200'>Reminder Times *</label>
                                                <button type='button' onClick={addTimeField} className='text-cyan-700 text-sm font-bold hover:text-cyan-800 transition-colors'>+ Add Time</button>
                                            </div>
                                            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                                {formData.reminderTimes.map((time, index) => (
                                                    <div key={index} className='relative'>
                                                        <input required type='time' value={time} onChange={(e) => handleTimeChange(index, e.target.value)} className='w-full p-2 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' />
                                                        {formData.reminderTimes.length > 1 && (
                                                            <button type='button' onClick={() => removeTimeField(index)} className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]'>x</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-4 pt-4'>
                                        <button type='button' onClick={() => setShowAddModal(false)} className='flex-1 px-6 py-3 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 transition-all'>Cancel</button>
                                        <button type='submit' className='flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all'>Save Medication</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Medications
