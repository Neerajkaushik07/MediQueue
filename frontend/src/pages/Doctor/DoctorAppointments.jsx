import React, { useContext, useEffect, useState, useCallback } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorAppointments = () => {
    const { backendUrl, token, userRole, currencySymbol } = useContext(AppContext)
    const [appointments, setAppointments] = useState([])
    const [filteredAppointments, setFilteredAppointments] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all') // all, upcoming, completed, cancelled
    const [loading, setLoading] = useState(true)

    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [diagnosis, setDiagnosis] = useState('')
    const [medications, setMedications] = useState('')
    const [notes, setNotes] = useState('')

    const getAppointments = useCallback(async () => {
        try {
            setLoading(true)
            if (userRole === 'doctor' && token) {
                const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { Authorization: `Bearer ${token}` } })
                if (data.success) {
                    setAppointments(data.appointments.reverse())
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            
            toast.error(error.message || 'Failed to load appointments')
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token, userRole])

    const openPrescriptionModal = (appointment) => {
        setSelectedAppointment(appointment)
        setDiagnosis(appointment.diagnosis || '')
        setMedications(appointment.medications ? appointment.medications.join(', ') : '')
        setNotes(appointment.notes || '')
        setShowPrescriptionModal(true)
    }

    const handlePrescriptionSubmit = async () => {
        try {
            const medArray = medications.split(',').map(m => m.trim()).filter(m => m !== '')
            const payload = {
                appointmentId: selectedAppointment._id,
                diagnosis,
                medications: medArray,
                notes
            }

            const endpoint = selectedAppointment.isCompleted
                ? '/api/doctor/update-appointment-details'
                : '/api/doctor/complete-appointment'

            const { data } = await axios.post(backendUrl + endpoint, payload, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                toast.success(selectedAppointment.isCompleted ? 'Prescription updated' : 'Appointment completed with details')
                setShowPrescriptionModal(false)
                getAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            
            toast.error('Failed to save prescription details')
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                toast.success('Appointment cancelled')
                getAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            
            toast.error(error.message || 'Failed to cancel appointment')
        }
    }

    // Filter appointments based on status and search
    useEffect(() => {
        let filtered = [...appointments]

        // Apply status filter
        if (filterStatus === 'upcoming') {
            filtered = filtered.filter(apt => !apt.cancelled && !apt.isCompleted)
        } else if (filterStatus === 'completed') {
            filtered = filtered.filter(apt => apt.isCompleted)
        } else if (filterStatus === 'cancelled') {
            filtered = filtered.filter(apt => apt.cancelled)
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(apt =>
                apt.userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.slotDate.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredAppointments(filtered)
    }, [filterStatus, searchTerm, appointments])

    useEffect(() => {
        getAppointments()
    }, [getAppointments])

    const calculateAge = (dob) => {
        if (!dob) return 'N/A'
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        return age
    }

    const getStatusCounts = () => {
        return {
            all: appointments.length,
            upcoming: appointments.filter(apt => !apt.cancelled && !apt.isCompleted).length,
            completed: appointments.filter(apt => apt.isCompleted).length,
            cancelled: appointments.filter(apt => apt.cancelled).length
        }
    }

    const statusCounts = getStatusCounts()

    return (
        <div className='m-5 max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-6'>
                <h1 className='text-3xl font-bold text-gray-800 font-poppins'>Appointments Management</h1>
                <p className='text-gray-600 mt-2 font-medium'>Review appointments, provide diagnoses, and manage patient prescriptions.</p>
            </div>

            {/* Search and Filter Bar - Reverted to Original Design */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
                <div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
                    {/* Search */}
                    <div className='relative flex-1 max-w-md'>
                        <svg className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                        <input
                            type='text'
                            placeholder='Search by patient name or date...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className='flex gap-2 bg-gray-100 p-1 rounded-lg'>
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === 'all'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            All ({statusCounts.all})
                        </button>
                        <button
                            onClick={() => setFilterStatus('upcoming')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === 'upcoming'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Upcoming ({statusCounts.upcoming})
                        </button>
                        <button
                            onClick={() => setFilterStatus('completed')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === 'completed'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Completed ({statusCounts.completed})
                        </button>
                        <button
                            onClick={() => setFilterStatus('cancelled')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === 'cancelled'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Cancelled ({statusCounts.cancelled})
                        </button>
                    </div>
                </div>
            </div>

            {/* Appointment Cards Grid */}
            {loading ? (
                <div className='flex justify-center items-center py-20'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className='text-center py-32 bg-white rounded-3xl shadow-soft border border-gray-100'>
                    <div className='text-7xl mb-6 grayscale opacity-20'>📅</div>
                    <p className='text-gray-500 text-xl font-bold font-poppins'>
                        {searchTerm ? 'No matches found' : 'No appointments scheduled'}
                    </p>
                    <p className='text-gray-400 text-sm mt-2 font-medium tracking-wide font-poppins'>
                        {searchTerm ? 'Try adjusting your search filters' : 'Your patient queue is currently empty'}
                    </p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in'>
                    {filteredAppointments.map((item, index) => (
                        <div key={index} className={`bg-white rounded-3xl border border-gray-100 shadow-soft hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col group`}>
                            {/* Card Header */}
                            <div className='p-6 pb-4 flex items-start gap-4'>
                                <div className='relative'>
                                    <img
                                        className='w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-soft group-hover:scale-105 transition-transform duration-300'
                                        src={item.userData.image}
                                        alt={item.userData.name}
                                    />
                                    {item.payment && (
                                        <div className='absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-lg shadow-sm' title="Payment Completed">
                                            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3.5' d='M5 13l4 4L19 7' /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className='flex-1 overflow-hidden'>
                                    <h3 className='font-black text-gray-900 font-poppins text-lg truncate leading-tight group-hover:text-primary transition-colors'>{item.userData.name}</h3>
                                    <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mt-1'>{calculateAge(item.userData.dob)} Years • {item.userData.email.split('@')[0]}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-xs font-black text-gray-400 uppercase tracking-tighter'>Amt</p>
                                    <p className='text-lg font-black text-primary font-poppins leading-none mt-0.5'>{currencySymbol}{item.amount}</p>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className='px-6 py-4 bg-gray-50/50 flex flex-col gap-2'>
                                <div className='flex justify-between items-center'>
                                    <div className='flex items-center gap-2'>
                                        <span className='bg-white p-1.5 rounded-lg text-gray-400 shadow-sm'>
                                            <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                                        </span>
                                        <span className='text-sm font-bold text-gray-700'>{item.slotDate}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className='bg-white p-1.5 rounded-lg text-gray-400 shadow-sm'>
                                            <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                                        </span>
                                        <span className='text-sm font-bold text-gray-700'>{item.slotTime}</span>
                                    </div>
                                </div>
                                <div className='flex justify-between items-center mt-2'>
                                    <div className='flex items-center gap-2'>
                                        <span className={`w-2 h-2 rounded-full ${item.payment ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                        <span className='text-xs font-black uppercase tracking-widest text-gray-500'>{item.payment ? 'Paid Online' : 'Cash Payment'}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border ${item.cancelled ? 'bg-red-50 text-red-500 border-red-100' :
                                        item.isCompleted ? 'bg-green-50 text-green-500 border-green-100' :
                                            'bg-blue-50 text-blue-500 border-blue-100'
                                        }`}>
                                        {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Upcoming'}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className='p-6 pt-auto mt-auto flex items-center gap-2'>
                                {!item.cancelled ? (
                                    <>
                                        {!item.isCompleted ? (
                                            <>
                                                <button
                                                    onClick={() => cancelAppointment(item._id)}
                                                    className='flex-1 h-11 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-xl font-bold text-xs uppercase transition-all'
                                                >
                                                    Cancel Call
                                                </button>
                                                <button
                                                    onClick={() => openPrescriptionModal(item)}
                                                    className='flex-[1.5] h-11 flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-bold text-xs uppercase shadow-medical hover:bg-primary-dark transition-all active:scale-95'
                                                >
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M5 13l4 4L19 7' /></svg>
                                                    Check-in
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => openPrescriptionModal(item)}
                                                className='w-full h-11 flex items-center justify-center gap-2 bg-white border border-primary text-primary rounded-xl font-bold text-xs uppercase hover:bg-primary hover:text-white transition-all shadow-sm'
                                            >
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' /></svg>
                                                Edit Rx
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className='w-full h-11 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-gray-100'>
                                        No Actions Available
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Prescription Modal - Enhanced Aesthetic */}
            {showPrescriptionModal && selectedAppointment && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in'>
                    <div className='bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up border border-white/20'>
                        <div className='px-10 py-8 bg-gradient-primary relative'>
                            <div className='absolute inset-0 opacity-10' style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                            <div className='relative flex items-center justify-between'>
                                <div>
                                    <h2 className='text-2xl font-black text-white font-poppins tracking-tight'>
                                        {selectedAppointment.isCompleted ? 'Clinical Prescription' : 'Finalize Check-in'}
                                    </h2>
                                    <p className='text-white/70 text-sm font-medium mt-1'>Review and prescribe medications for the patient</p>
                                </div>
                                <button onClick={() => setShowPrescriptionModal(false)} className='w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all'>
                                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3.5' d='M6 18L18 6M6 6l12 12' /></svg>
                                </button>
                            </div>
                        </div>

                        <div className='p-10 overflow-y-auto max-h-[60vh] custom-scrollbar'>
                            <div className='flex items-center gap-5 mb-8 p-5 bg-gray-50 rounded-3xl border border-gray-100'>
                                <img className='w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-soft' src={selectedAppointment.userData.image} alt="" />
                                <div>
                                    <h3 className='text-xl font-black text-gray-900 font-poppins'>{selectedAppointment.userData.name}</h3>
                                    <p className='text-gray-400 text-xs font-black uppercase tracking-widest mt-0.5'>{calculateAge(selectedAppointment.userData.dob)} Years • Patient #MQ-{selectedAppointment._id.slice(-4).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className='space-y-8'>
                                <div className='group'>
                                    <label className='flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 group-focus-within:text-primary transition-colors'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /></svg>
                                        Diagnosis
                                    </label>
                                    <input
                                        type='text'
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        placeholder='e.g. Acute Viral Bronchitis'
                                        className='w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400'
                                    />
                                </div>

                                <div className='group'>
                                    <label className='flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 group-focus-within:text-primary transition-colors'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' /></svg>
                                        Medications Schedule
                                    </label>
                                    <textarea
                                        value={medications}
                                        onChange={(e) => setMedications(e.target.value)}
                                        placeholder='e.g. Amoxicillin 500mg (3x daily), Cetirizine 10mg'
                                        rows={3}
                                        className='w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400 resize-none'
                                    />
                                    <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 px-1'>Use commas to separate multiple prescription items</p>
                                </div>

                                <div className='group'>
                                    <label className='flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 group-focus-within:text-primary transition-colors'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' /></svg>
                                        Clinical Observations
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder='Patient reports mild fatigue and low-grade fever...'
                                        rows={4}
                                        className='w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-bold text-gray-700 placeholder:text-gray-400 resize-none'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center justify-end gap-4 px-10 py-6 bg-gray-50/50 border-t border-gray-100'>
                            <button
                                onClick={() => setShowPrescriptionModal(false)}
                                className='px-6 py-3 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors'
                            >
                                Discard
                            </button>
                            <button
                                onClick={handlePrescriptionSubmit}
                                className='px-10 py-3 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-dark transition-all shadow-medical active:scale-95'
                            >
                                {selectedAppointment.isCompleted ? 'Verify Changes' : 'Approve & Finalize'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DoctorAppointments
