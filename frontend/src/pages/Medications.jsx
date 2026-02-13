import React, { useState, useContext, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const Medications = () => {
    const { backendUrl, token } = useContext(AppContext)
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
            endDate: '2024-12-31',
            doctorName: 'Dr. Richard James',
            instructions: 'Take after food',
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
            endDate: '2024-12-31',
            doctorName: 'Dr. Sarah Smith',
            instructions: 'Take in the morning',
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
        reminderTimes: ['08:00']
    })

    const fetchReminders = useCallback(async () => {
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
    }, [backendUrl, token])

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

    const handleLogIntake = async (reminderId, taken = true) => {
        if (reminderId.startsWith('demo')) {
            toast.success('Demo intake logged!')
            return
        }
        try {
            const { data } = await axios.post(`${backendUrl}/api/advanced-health/medication-reminders/${reminderId}/log`, { taken }, { headers: { token } })
            if (data.success) {
                toast.success('Intake logged successfully')
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
        med.reminderTimes.map(time => ({
            ...med,
            scheduledTime: time,
            isTaken: med.intakeHistory?.some(h =>
                new Date(h.date).toDateString() === new Date().toDateString() && h.time === time && h.taken
            )
        }))
    ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))

    return (
        <div className='min-h-screen py-8'>
            {/* Demo Data Notice */}
            {/* Demo Data Notice removed */}
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-4xl font-bold medical-heading mb-2'>Medications & Reminders</h1>
                <p className='text-gray-600'>Manage your prescriptions and never miss a dose</p>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                <div className='glass-card p-6'>
                    <div className='flex items-center justify-between mb-2'>
                        <span className='text-3xl'>💊</span>
                        <span className='text-2xl font-bold text-primary'>{activeMeds.length}</span>
                    </div>
                    <p className='text-gray-600 text-sm'>Active Medications</p>
                </div>
                <div className='glass-card p-6'>
                    <div className='flex items-center justify-between mb-2'>
                        <span className='text-3xl'>⏰</span>
                        <span className='text-2xl font-bold text-green-600'>
                            {activeMeds.reduce((acc, m) => acc + m.reminders.length, 0)}
                        </span>
                    </div>
                    <p className='text-gray-600 text-sm'>Daily Reminders</p>
                </div>
                <div className='glass-card p-6'>
                    <div className='flex items-center justify-between mb-2'>
                        <span className='text-3xl'>📊</span>
                        <span className='text-2xl font-bold text-blue-600'>
                            {activeMeds.length > 0
                                ? Math.round(activeMeds.reduce((acc, m) => acc + calculateAdherence(m), 0) / activeMeds.length)
                                : 0}%
                        </span>
                    </div>
                    <p className='text-gray-600 text-sm'>Adherence Rate</p>
                </div>
                <div className='glass-card p-6'>
                    <div className='flex items-center justify-between mb-2'>
                        <span className='text-3xl'>✅</span>
                        <span className='text-2xl font-bold text-purple-600'>{pastMeds.length}</span>
                    </div>
                    <p className='text-gray-600 text-sm'>Completed Courses</p>
                </div>
            </div>

            {/* Tabs */}
            <div className='glass-card p-2 mb-8 inline-flex rounded-xl'>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'active'
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Active ({activeMeds.length})
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'past'
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Past ({pastMeds.length})
                </button>
            </div>

            {/* Medications List */}
            <div className='space-y-4 mb-8'>
                {loading && reminders.length === 0 ? (
                    <div className='flex justify-center py-12'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
                    </div>
                ) : displayMeds.length === 0 ? (
                    <div className='glass-card p-12 text-center'>
                        <div className='text-6xl mb-4'>💊</div>
                        <h3 className='text-xl font-bold mb-2'>No Medications</h3>
                        <p className='text-gray-600 mb-6'>
                            You don't have any {activeTab} medications
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className='btn-primary px-6 py-3'
                        >
                            Add Medication
                        </button>
                    </div>
                ) : (
                    displayMeds.map((med) => (
                        <div
                            key={med._id}
                            className='glass-card p-6 hover:shadow-xl transition-all'
                        >
                            <div className='flex items-start justify-between mb-4'>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-3 mb-2'>
                                        <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-2xl'>
                                            💊
                                        </div>
                                        <div>
                                            <h3 className='text-xl font-bold'>{med.name}</h3>
                                            <p className='text-gray-600 text-sm'>{med.dosage} • {med.frequency.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                </div>
                                {med.isActive && (
                                    <div className='text-right'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <span className='text-sm text-gray-600'>Adherence</span>
                                            <span className='font-bold text-lg text-green-600'>{calculateAdherence(med)}%</span>
                                        </div>
                                        <div className='w-32 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                            <div
                                                className='h-full bg-gradient-to-r from-green-500 to-green-600'
                                                style={{ width: `${calculateAdherence(med)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                <div>
                                    <p className='text-sm text-gray-600 mb-1'>Duration</p>
                                    <p className='font-semibold'>
                                        {new Date(med.startDate).toLocaleDateString()} - {med.endDate ? new Date(med.endDate).toLocaleDateString() : 'Ongoing'}
                                    </p>
                                </div>
                                <div>
                                    <p className='text-sm text-gray-600 mb-1'>Prescribed by</p>
                                    <p className='font-semibold'>{med.doctorName || 'Not specified'}</p>
                                </div>
                            </div>

                            {med.instructions && (
                                <div className='bg-blue-50 p-4 rounded-lg mb-4'>
                                    <p className='text-sm text-blue-900'>
                                        <span className='font-semibold'>Instructions:</span> {med.instructions}
                                    </p>
                                </div>
                            )}

                            {med.isActive && (
                                <div className='mb-4'>
                                    <p className='text-sm text-gray-600 mb-2'>Reminder Times</p>
                                    <div className='flex gap-2 flex-wrap'>
                                        {med.reminderTimes.map((time, index) => (
                                            <span
                                                key={index}
                                                className='px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg text-sm font-semibold flex items-center gap-2'
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
                                    <>
                                        <button
                                            onClick={() => handleLogIntake(med._id)}
                                            className='px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600'
                                        >
                                            Mark as Taken
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReminder(med._id)}
                                            className='px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600'
                                        >
                                            Discontinue
                                        </button>
                                    </>
                                )}
                                <button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200'>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Today's Schedule */}
            {activeTab === 'active' && todaySchedule.length > 0 && (
                <div className='glass-card p-6'>
                    <h2 className='text-2xl font-bold mb-6'>Today's Medication Schedule</h2>
                    <div className='space-y-3'>
                        {todaySchedule.map((item, index) => (
                            <div
                                key={index}
                                className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                            >
                                <div className='flex items-center gap-4'>
                                    <div className='w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center'>
                                        <span className='text-white font-bold'>{item.scheduledTime}</span>
                                    </div>
                                    <div>
                                        <p className='font-bold text-lg'>{item.name}</p>
                                        <p className='text-gray-600 text-sm'>{item.dosage}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleLogIntake(item._id)}
                                    disabled={item.isTaken}
                                    className={`px-6 py-2 rounded-lg text-white font-semibold transition-all ${item.isTaken
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600 shadow-md'
                                        }`}
                                >
                                    {item.isTaken ? 'Taken' : 'Take Now'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Medication Modal */}
            {showAddModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between mb-6'>
                            <h2 className='text-2xl font-bold'>Add Medication</h2>
                            <button onClick={() => setShowAddModal(false)} className='text-gray-400 hover:text-gray-600'>
                                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddReminder} className='space-y-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Medication Name *</label>
                                    <input required type='text' name='name' value={formData.name} onChange={handleInputChange} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20' placeholder='e.g., Aspirin' />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Dosage *</label>
                                    <input required type='text' name='dosage' value={formData.dosage} onChange={handleInputChange} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20' placeholder='e.g., 500mg' />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Frequency *</label>
                                    <select name='frequency' value={formData.frequency} onChange={handleInputChange} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20'>
                                        <option value='once_daily'>Once Daily</option>
                                        <option value='twice_daily'>Twice Daily</option>
                                        <option value='three_times_daily'>Three Times Daily</option>
                                        <option value='four_times_daily'>Four Times Daily</option>
                                        <option value='as_needed'>As Needed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Doctor's Name</label>
                                    <input type='text' name='doctorName' value={formData.doctorName} onChange={handleInputChange} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20' placeholder='Dr. Smith' />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Start Date *</label>
                                    <input required type='date' name='startDate' value={formData.startDate} onChange={handleInputChange} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20' />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>End Date</label>
                                    <input type='date' name='endDate' value={formData.endDate} onChange={handleInputChange} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20' />
                                </div>
                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-semibold mb-1'>Instructions</label>
                                    <textarea name='instructions' value={formData.instructions} onChange={handleInputChange} rows='2' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20' placeholder='e.g., Take after food'></textarea>
                                </div>
                                <div className='md:col-span-2'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <label className='block text-sm font-semibold'>Reminder Times *</label>
                                        <button type='button' onClick={addTimeField} className='text-primary text-sm font-bold'>+ Add Time</button>
                                    </div>
                                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                        {formData.reminderTimes.map((time, index) => (
                                            <div key={index} className='relative'>
                                                <input required type='time' value={time} onChange={(e) => handleTimeChange(index, e.target.value)} className='w-full p-2 bg-gray-50 border border-gray-200 rounded-lg' />
                                                {formData.reminderTimes.length > 1 && (
                                                    <button type='button' onClick={() => removeTimeField(index)} className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]'>×</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-4 pt-4'>
                                <button type='button' onClick={() => setShowAddModal(false)} className='flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl'>Cancel</button>
                                <button type='submit' className='flex-1 px-6 py-3 bg-gradient-primary text-white font-bold rounded-xl shadow-lg'>Save Medication</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Medications
