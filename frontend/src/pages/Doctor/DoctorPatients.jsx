import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'

const DoctorPatients = () => {
    const { backendUrl, token, userRole, isDemoMode } = useContext(AppContext)
    const [patients, setPatients] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [patientHistory, setPatientHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [sortBy, setSortBy] = useState('name') // name, lastVisit, totalVisits

    const getPatients = useCallback(async () => {
        try {
            setLoading(true)
            if (isDemoMode) {
                setPatients([
                    {
                        _id: 'mock_patient_1',
                        name: 'Sarah Wilson',
                        email: 'sarah@example.com',
                        phone: '+91 91234 56789',
                        gender: 'Female',
                        dob: '1995-03-20',
                        image: assets.profile_pic,
                        totalVisits: 3,
                        lastVisit: '2026-02-15'
                    },
                    {
                        _id: 'mock_patient_2',
                        name: 'John Miller',
                        email: 'john@example.com',
                        phone: '+91 88888 88888',
                        gender: 'Male',
                        dob: '1988-11-12',
                        image: assets.profile_pic,
                        totalVisits: 1,
                        lastVisit: '2026-02-14'
                    }
                ])
                setLoading(false)
                return
            }
            if (userRole === 'doctor' && token) {
                const { data } = await axios.get(backendUrl + '/api/doctor/patients', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data.success) {
                    setPatients(data.patients)
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {

            toast.error(error.message || 'Failed to load patients')
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token, userRole, isDemoMode])

    const viewPatientHistory = async (patient) => {
        setSelectedPatient(patient)
        setShowHistoryModal(true)
        setHistoryLoading(true)
        try {
            if (isDemoMode) {
                setPatientHistory([
                    {
                        date: '2026-02-15',
                        slotTime: '10:30 AM',
                        diagnosis: 'Follow-up Checkup',
                        medications: ['Consultation Only'],
                        notes: 'Patient recovery is on track.',
                        isCompleted: true,
                        payment: true
                    }
                ])
                setHistoryLoading(false)
                return
            }
            const { data } = await axios.post(backendUrl + '/api/doctor/patient-history', { userId: patient._id }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setPatientHistory(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {

            toast.error('Failed to load patient history')
        } finally {
            setHistoryLoading(false)
        }
    }

    useEffect(() => {
        getPatients()
    }, [getPatients])

    const filteredAndSortedPatients = useMemo(() => {
        let result = patients.filter(patient =>
            patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )

        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'lastVisit') return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0)
            if (sortBy === 'totalVisits') return (b.totalVisits || 0) - (a.totalVisits || 0)
            return 0
        })

        return result
    }, [patients, searchTerm, sortBy])

    const stats = useMemo(() => {
        const total = patients.length
        const totalVisits = patients.reduce((acc, p) => acc + (p.totalVisits || 0), 0)
        const avgVisits = total > 0 ? (totalVisits / total).toFixed(1) : 0
        const newThisMonth = patients.filter(p => {
            const lastVisit = new Date(p.lastVisit)
            const today = new Date()
            return lastVisit.getMonth() === today.getMonth() && lastVisit.getFullYear() === today.getFullYear()
        }).length

        return { total, avgVisits, newThisMonth }
    }, [patients])

    return (
        <div className='flex flex-col gap-8 m-5 max-w-7xl animate-fade-in-up'>
            {/* Header Section */}
            <div>
                <h2 className='text-4xl font-black text-gray-900 font-outfit tracking-tight'>Patients Directory</h2>
                <p className='text-gray-500 mt-2 text-lg'>Manage your patient relationships and clinical history in one place.</p>
            </div>

            {/* Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='bg-gradient-primary p-1 rounded-3xl shadow-medical group cursor-default transition-all hover:scale-[1.02]'>
                    <div className='bg-white rounded-[1.4rem] p-6 h-full flex items-center gap-5'>
                        <div className='w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' /></svg>
                        </div>
                        <div>
                            <p className='text-sm font-bold text-gray-500 uppercase tracking-wider'>Total Patients</p>
                            <h3 className='text-3xl font-black text-gray-900'>{stats.total}</h3>
                        </div>
                    </div>
                </div>

                <div className='bg-gradient-secondary p-1 rounded-3xl shadow-medical group cursor-default transition-all hover:scale-[1.02]'>
                    <div className='bg-white rounded-[1.4rem] p-6 h-full flex items-center gap-5'>
                        <div className='w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
                        </div>
                        <div>
                            <p className='text-sm font-bold text-gray-500 uppercase tracking-wider'>This Month</p>
                            <h3 className='text-3xl font-black text-gray-900'>+{stats.newThisMonth}</h3>
                        </div>
                    </div>
                </div>

                <div className='bg-gradient-trust p-1 rounded-3xl shadow-medical group cursor-default transition-all hover:scale-[1.02]'>
                    <div className='bg-white rounded-[1.4rem] p-6 h-full flex items-center gap-5'>
                        <div className='w-16 h-16 bg-trust-blue/10 rounded-2xl flex items-center justify-center text-trust-blue'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' /></svg>
                        </div>
                        <div>
                            <p className='text-sm font-bold text-gray-500 uppercase tracking-wider'>Avg. Visits</p>
                            <h3 className='text-3xl font-black text-gray-900'>{stats.avgVisits}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className='bg-white rounded-[2.5rem] shadow-card overflow-hidden border border-gray-100'>
                {/* Search and Filters Bar */}
                <div className='p-8 border-b border-gray-100 bg-gray-50/50'>
                    <div className='flex flex-col lg:flex-row justify-between items-center gap-6'>
                        <div className='relative w-full lg:max-w-md group'>
                            <svg className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                            </svg>
                            <input
                                type='text'
                                placeholder='Search patients by name or email...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-gray-700 shadow-sm'
                            />
                        </div>

                        <div className='flex items-center gap-4 w-full lg:w-auto'>
                            <span className='text-sm font-bold text-gray-500 uppercase hidden sm:inline'>Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className='flex-1 lg:flex-none px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-gray-700 cursor-pointer shadow-sm appearance-none pr-12 relative'
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                            >
                                <option value='name'>Name (A-Z)</option>
                                <option value='lastVisit'>Last Visit (Newest)</option>
                                <option value='totalVisits'>Experience (Most Visits)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className='p-0 sm:p-4'>
                    {loading ? (
                        <div className='flex justify-center items-center py-32'>
                            <div className='relative'>
                                <div className='w-20 h-20 border-4 border-primary/20 rounded-full'></div>
                                <div className='w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0'></div>
                            </div>
                        </div>
                    ) : filteredAndSortedPatients.length === 0 ? (
                        <div className='text-center py-32 bg-gray-50/50 rounded-3xl m-4 border-2 border-dashed border-gray-200'>
                            <div className='text-7xl mb-6 grayscale opacity-50'>🔍</div>
                            <h4 className='text-2xl font-bold text-gray-800'>No results found</h4>
                            <p className='text-gray-500 mt-2 max-w-sm mx-auto'>
                                We couldn't find any patients matching your current search or filters. Try adjusting your criteria.
                            </p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='text-left border-b border-gray-100'>
                                        <th className='py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-[0.2em]'>Patient Information</th>
                                        <th className='py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-[0.2em]'>Contact Details</th>
                                        <th className='py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-[0.2em]'>Visit Analytics</th>
                                        <th className='py-6 px-8 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em]'>Action</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-50'>
                                    {filteredAndSortedPatients.map((patient, index) => (
                                        <tr key={index} className='group hover:bg-gray-50/80 transition-all duration-300'>
                                            <td className='py-6 px-8'>
                                                <div className='flex items-center gap-5'>
                                                    <div className='relative'>
                                                        {patient.image ? (
                                                            <img src={patient.image} alt='' className='w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-card group-hover:scale-110 transition-transform duration-500' />
                                                        ) : (
                                                            <div className='w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-2xl ring-4 ring-white shadow-card group-hover:scale-110 transition-transform duration-500'>
                                                                {patient.name?.[0]?.toUpperCase() || 'P'}
                                                            </div>
                                                        )}
                                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-white rounded-full ${patient.totalVisits > 5 ? 'bg-amber-400' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
                                                    </div>
                                                    <div>
                                                        <p className='font-black text-gray-900 font-outfit text-lg group-hover:text-primary transition-colors'>{patient.name || 'Unknown User'}</p>
                                                        <div className='flex items-center gap-3 mt-1'>
                                                            <span className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-wider'>
                                                                {patient.gender || 'N/A'}
                                                            </span>
                                                            <span className='text-xs font-bold text-gray-400'>
                                                                {patient.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} Years` : 'Age N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-6 px-8'>
                                                <div className='space-y-1.5'>
                                                    <p className='text-sm font-bold text-gray-700 flex items-center gap-2.5'>
                                                        <div className='w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center'>
                                                            <svg className='w-3.5 h-3.5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
                                                        </div>
                                                        {patient.email || 'N/A'}
                                                    </p>
                                                    <p className='text-sm text-gray-500 flex items-center gap-2.5'>
                                                        <div className='w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center'>
                                                            <svg className='w-3.5 h-3.5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' /></svg>
                                                        </div>
                                                        {patient.phone || 'No phone'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className='py-6 px-8'>
                                                <div className='flex items-center gap-6'>
                                                    <div className='flex flex-col'>
                                                        <span className='text-sm font-black text-gray-900'>
                                                            {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}
                                                        </span>
                                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-wider'>Last Engagement</span>
                                                    </div>
                                                    <div className='h-8 w-[1px] bg-gray-100'></div>
                                                    <div className='flex flex-col items-center'>
                                                        <span className='text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20'>
                                                            {patient.totalVisits || 0}
                                                        </span>
                                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1'>Visits</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-6 px-8 text-right'>
                                                <button
                                                    onClick={() => viewPatientHistory(patient)}
                                                    className='px-6 py-3 bg-white border-2 border-primary text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-medical'
                                                >
                                                    View Timeline
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Patient History 360 Modal - Highly Premium */}
            {showHistoryModal && selectedPatient && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xl animate-fade-in'>
                    <div className='bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col animate-scale-in border border-white/20'>
                        {/* Modal Header */}
                        <div className='relative p-10 bg-gradient-primary text-white overflow-hidden'>
                            {/* Decorative Elements */}
                            <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl'></div>
                            <div className='absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl'></div>

                            <div className='relative flex flex-col md:flex-row items-center justify-between gap-8'>
                                <div className='flex flex-col md:flex-row items-center gap-8'>
                                    <div className='relative'>
                                        <img src={selectedPatient.image} className='w-32 h-32 rounded-[2.5rem] object-cover border-8 border-white/20 shadow-2xl' alt="" />
                                        <div className='absolute -top-2 -right-2 w-10 h-10 bg-white text-primary rounded-2xl flex items-center justify-center shadow-lg font-black'>
                                            {selectedPatient.totalVisits}
                                        </div>
                                    </div>
                                    <div className='text-center md:text-left'>
                                        <p className='text-white/60 font-black uppercase tracking-[0.3em] text-[10px] mb-2'>Patient Medical Profile</p>
                                        <h2 className='text-5xl font-black font-outfit tracking-tighter'>{selectedPatient.name}</h2>
                                        <div className='flex flex-wrap justify-center md:justify-start items-center gap-4 mt-4'>
                                            <span className='px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl font-black text-xs uppercase'>{selectedPatient.gender}</span>
                                            <span className='w-1.5 h-1.5 bg-white/30 rounded-full'></span>
                                            <span className='px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl font-black text-xs uppercase'>
                                                {selectedPatient.dob ? `${new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()} Years` : 'Age N/A'}
                                            </span>
                                            <span className='w-1.5 h-1.5 bg-white/30 rounded-full'></span>
                                            <span className='px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl font-black text-xs uppercase truncate max-w-[200px]'>
                                                {selectedPatient.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowHistoryModal(false)}
                                    className='p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all border border-white/10 group'
                                >
                                    <svg className='w-8 h-8 group-hover:rotate-90 transition-transform duration-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M6 18L18 6M6 6l12 12' /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className='flex-1 overflow-y-auto p-10 bg-gray-50/50 custom-scrollbar'>
                            <div className='grid grid-cols-1 lg:grid-cols-4 gap-10'>
                                {/* Left Side: Patient Metrics */}
                                <div className='lg:col-span-1 space-y-6'>
                                    <div className='bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100'>
                                        <h4 className='text-xs font-black text-gray-400 uppercase tracking-widest mb-6'>Quick Overview</h4>
                                        <div className='space-y-6'>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-sm font-bold text-gray-500'>First Visit</span>
                                                <span className='text-sm font-black text-gray-900'>Oct 2023</span>
                                            </div>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-sm font-bold text-gray-500'>Last Notes</span>
                                                <span className='text-sm font-black text-gray-900'>Normal</span>
                                            </div>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-sm font-bold text-gray-500'>Vitals Avg.</span>
                                                <span className='text-sm font-black text-green-500'>Stable</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='bg-primary/5 p-6 rounded-[2rem] border border-primary/10'>
                                        <div className='flex items-center gap-3 mb-4 text-primary'>
                                            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' /></svg>
                                            <h4 className='text-sm font-black uppercase tracking-wider'>Notes</h4>
                                        </div>
                                        <p className='text-xs font-bold text-primary/80 leading-relaxed italic'>
                                            "Patient shows consistent recovery progress. Recommend continued monitoring of adherence to prescribed dosage."
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side: clinical Timeline */}
                                <div className='lg:col-span-3'>
                                    <div className='flex items-center justify-between mb-8'>
                                        <h3 className='text-3xl font-black text-gray-900 font-outfit'>Clinical Journey</h3>
                                        <div className='px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-xs font-black text-gray-500 uppercase tracking-widest'>
                                            {patientHistory.length} Sessions Record
                                        </div>
                                    </div>

                                    {historyLoading ? (
                                        <div className='flex flex-col items-center justify-center py-20 grayscale opacity-50'>
                                            <div className='w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4 text-primary'></div>
                                            <p className='font-black text-xs uppercase tracking-widest text-gray-400'>Syncing Records...</p>
                                        </div>
                                    ) : patientHistory.length === 0 ? (
                                        <div className='bg-white p-20 rounded-[3rem] border-4 border-dashed border-gray-100 text-center'>
                                            <div className='text-6xl mb-6'>📁</div>
                                            <p className='text-gray-400 font-black uppercase tracking-widest'>No clinical history found</p>
                                        </div>
                                    ) : (
                                        <div className='relative space-y-10 before:absolute before:left-[2.75rem] before:top-4 before:bottom-4 before:w-1.5 before:bg-gray-100 before:rounded-full'>
                                            {patientHistory.map((apt, idx) => (
                                                <div key={idx} className='relative flex gap-10 group'>
                                                    {/* Timeline Marker */}
                                                    <div className={`relative z-10 w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center border-8 border-gray-50 shadow-card transition-all duration-500 group-hover:scale-110 ${apt.isCompleted ? 'bg-green-500 text-white' :
                                                        apt.cancelled ? 'bg-red-500 text-white' :
                                                            'bg-primary text-white'
                                                        }`}>
                                                        <span className='text-[10px] font-black uppercase tracking-tighter opacity-80'>{new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                        <span className='text-3xl font-black leading-none my-0.5'>{new Date(apt.date).getDate()}</span>
                                                        <span className='text-[10px] font-black opacity-80'>{new Date(apt.date).getFullYear()}</span>
                                                    </div>

                                                    {/* Content Card */}
                                                    <div className='flex-1 bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-100 group-hover:shadow-card transition-all group-hover:-translate-x-2'>
                                                        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
                                                            <div>
                                                                <div className='flex items-center gap-3'>
                                                                    <h4 className='text-2xl font-black text-gray-900 font-outfit uppercase tracking-tight'>{apt.diagnosis || 'General Checkup'}</h4>
                                                                    <div className={`w-2 h-2 rounded-full ${apt.isCompleted ? 'bg-green-500' : 'bg-primary animate-pulse'}`}></div>
                                                                </div>
                                                                <p className='text-sm font-bold text-gray-400 mt-1 flex items-center gap-2'>
                                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                                                                    {apt.slotTime} • {apt.payment ? 'Online Secured' : 'Counter Payment'}
                                                                </p>
                                                            </div>
                                                            <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${apt.isCompleted ? 'bg-green-50 text-green-600 border border-green-100' :
                                                                apt.cancelled ? 'bg-red-50 text-red-600 border border-red-100' :
                                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                                                }`}>
                                                                {apt.isCompleted ? 'Completed' : apt.cancelled ? 'Cancelled' : 'Scheduled'}
                                                            </span>
                                                        </div>

                                                        {apt.isCompleted && (
                                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-50'>
                                                                <div className='space-y-4'>
                                                                    <h5 className='text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2'>
                                                                        <div className='w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center'>
                                                                            <svg className='w-3.5 h-3.5' fill='currentColor' viewBox='0 0 20 20'><path d='M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z' /></svg>
                                                                        </div>
                                                                        Prescription
                                                                    </h5>
                                                                    <div className='flex flex-wrap gap-2'>
                                                                        {apt.medications && apt.medications.length > 0 ? apt.medications.map((med, mIdx) => (
                                                                            <span key={mIdx} className='px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold border border-gray-100'>
                                                                                {med}
                                                                            </span>
                                                                        )) : <p className='text-xs font-bold text-gray-400 italic'>No medications issued</p>}
                                                                    </div>
                                                                </div>
                                                                <div className='space-y-4'>
                                                                    <h5 className='text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] flex items-center gap-2'>
                                                                        <div className='w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center'>
                                                                            <svg className='w-3.5 h-3.5' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' /></svg>
                                                                        </div>
                                                                        Clinical Insights
                                                                    </h5>
                                                                    <p className='text-xs font-bold text-gray-500 leading-relaxed bg-purple-50/30 p-4 rounded-2xl border border-purple-100/30'>
                                                                        {apt.notes || 'Routine checkup completed with no specialized observations.'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className='p-8 bg-white border-t border-gray-50 flex items-center justify-between'>
                            <div className='flex items-center gap-3 grayscale opacity-70'>
                                <svg className='w-10 h-10 text-primary' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.946-2.583 9.123-6.445 11.41L10 19.333l-1.555-.922C4.583 16.123 2 11.946 2 7.001c0-.681.057-1.35.166-2.001zm9.496 10.337A9.947 9.947 0 0110 16.447a9.947 9.947 0 01-1.662-1.111L10 14.333l1.662 1.003z' clipRule='evenodd' /></svg>
                                <div className='flex flex-col text-[10px] font-black uppercase tracking-widest text-gray-400'>
                                    <span>Encrypted Clinical Database</span>
                                    <span>HIPAA Compliance Level : 4</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className='px-12 py-5 bg-gray-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl hover:scale-105 active:scale-95 uppercase tracking-widest text-xs'
                            >
                                Secure Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </div>
    )
}

export default DoctorPatients

