import React, { useState, useContext, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'

const MedicalRecords = () => {
    const { backendUrl, token, isDemoMode, doctors } = useContext(AppContext)
    const [activeTab, setActiveTab] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [loading, setLoading] = useState(true)

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('')
    const [filterDate, setFilterDate] = useState('')

    // Edit & delete State
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)

    const [records, setRecords] = useState([
        {
            _id: 'demo1',
            recordType: 'consultation',
            title: 'General Checkup (Demo)',
            date: '2024-10-15',
            doctorName: 'Dr. Richard James',
            hospital: 'City Hospital',
            status: 'active',
            diagnosis: 'Healthy, recommended vitamin D supplements.',
            description: 'Patient came for annual checkup. Vital signs are normal.',
            isDemo: true
        },
        {
            _id: 'demo2',
            recordType: 'diagnosis',
            title: 'Blood Test Results (Demo)',
            date: '2024-09-20',
            doctorName: 'Dr. Emily Blunt',
            hospital: 'MediLab',
            status: 'active',
            diagnosis: 'Slightly elevated cholesterol.',
            description: 'Follow up required in 3 months.',
            isDemo: true
        },
        {
            _id: 'demo3',
            recordType: 'vaccination',
            title: 'Flu Shot (Demo)',
            date: '2024-09-01',
            doctorName: 'Nurse Joy',
            hospital: 'Community Health Center',
            status: 'active',
            diagnosis: 'Annual influenza vaccination.',
            description: 'Patient received annual flu shot.',
            isDemo: true
        }
    ])

    // Form State
    const [formData, setFormData] = useState({
        recordType: 'consultation',
        title: '',
        description: '',
        diagnosis: '',
        doctorName: '',
        hospital: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'active'
    })
    const [attachments, setAttachments] = useState([])

    const fetchRecords = useCallback(async () => {
        if (isDemoMode) {
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/health/medical-records', { headers: { token } })
            if (data.success) {
                // Keep demo records and append backend records
                setRecords(prev => {
                    const demos = prev.filter(r => r.isDemo)
                    return [...demos, ...data.records]
                })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token, isDemoMode])

    useEffect(() => {
        if (token) {
            fetchRecords()
        }
    }, [token, fetchRecords])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
        setAttachments(Array.from(e.target.files))
    }

    const handleAddRecord = async (e) => {
        e.preventDefault()
        if (isDemoMode) {
            toast.info("Changes cannot be saved in Demo Mode");
            // Add a temporary mock record locally just for UI effect
            if (isEditing) {
                setRecords(prev => prev.map(r => r._id === editId ? { ...r, ...formData } : r));
                toast.success('Record updated (Demo simulation)');
            } else {
                const newRecord = {
                    _id: `demo_new_${Date.now()}`,
                    ...formData,
                    attachments: attachments,
                    status: 'active',
                    isDemo: true
                };
                setRecords(prev => [newRecord, ...prev]);
                toast.success('Record added (Demo simulation)');
            }
            setShowAddModal(false);
            setFormData({
                recordType: 'consultation',
                title: '',
                description: '',
                diagnosis: '',
                doctorName: '',
                hospital: '',
                date: new Date().toISOString().split('T')[0],
                notes: '',
                status: 'active'
            });
            setIsEditing(false);
            setEditId(null);
            setAttachments([]);
            return;
        }

        try {
            if (isEditing) {
                // PUT Request supports JSON in current backend controller often, let's verify if file upload is supported in PUT
                // Usually PUT updates fields. File upload might need checking. Let's assume standard field update for now.
                const { data } = await axios.put(backendUrl + '/api/health/medical-records/' + editId, formData, { headers: { token } })
                if (data.success) {
                    toast.success(data.message)
                    fetchRecords()
                    setShowAddModal(false)
                    setFormData({
                        recordType: 'consultation',
                        title: '',
                        description: '',
                        diagnosis: '',
                        doctorName: '',
                        hospital: '',
                        date: new Date().toISOString().split('T')[0],
                        notes: '',
                        status: 'active'
                    })
                    setIsEditing(false);
                    setEditId(null);
                } else {
                    toast.error(data.message)
                }
            } else {
                // ADD Request (POST) with Files
                const dataToSubmit = new FormData()
                Object.keys(formData).forEach(key => {
                    dataToSubmit.append(key, formData[key])
                })
                attachments.forEach(file => {
                    dataToSubmit.append('attachments', file)
                })

                const { data } = await axios.post(backendUrl + '/api/health/medical-records/add', dataToSubmit, { headers: { token } })
                if (data.success) {
                    toast.success(data.message)
                    setShowAddModal(false)
                    setFormData({
                        recordType: 'consultation',
                        title: '',
                        description: '',
                        diagnosis: '',
                        doctorName: '',
                        hospital: '',
                        date: new Date().toISOString().split('T')[0],
                        notes: '',
                        status: 'active'
                    })
                    setAttachments([])
                    fetchRecords()
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    const startEdit = (record) => {
        setFormData({
            recordType: record.recordType || 'consultation',
            title: record.title || '',
            description: record.description || '',
            diagnosis: record.diagnosis || '',
            doctorName: record.doctorName || '',
            hospital: record.hospital || '',
            date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0],
            notes: record.notes || '',
            status: record.status || 'active'
        })
        setEditId(record._id)
        setIsEditing(true)
        setShowAddModal(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this medical record? This action cannot be undone.")) {
            return;
        }

        if (isDemoMode) {
            setRecords(prev => prev.filter(r => r._id !== id))
            toast.success('Record deleted (Demo Mode)')
            return
        }

        try {
            const { data } = await axios.delete(backendUrl + '/api/health/medical-records/' + id, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                fetchRecords()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    const handleDownload = (record) => {
        const content = `
Medical Record: ${record.title}
Date: ${new Date(record.date).toLocaleDateString()}
Type: ${record.recordType}
Doctor: ${record.doctorName || 'N/A'}
Hospital: ${record.hospital || 'N/A'}
Diagnosis: ${record.diagnosis || 'N/A'}
Description: ${record.description}
Notes: ${record.notes || 'N/A'}
Status: ${record.status}
        `
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `medical_record_${record._id}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Record summary downloaded!')
    }

    const handleShare = async (record) => {
        const shareData = {
            title: `Medical Record: ${record.title}`,
            text: `View my medical record dated ${new Date(record.date).toLocaleDateString()} at ${record.hospital}.`,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
                toast.success('Shared successfully!')
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`)
                toast.success('Summary copied to clipboard!')
            }
        } catch (err) {
            console.error(err)
        }
    }

    const recordTypes = [
        { value: 'all', label: 'All Records', icon: '📋', count: records.length },
        { value: 'consultation', label: 'Consultations', icon: '🩺', count: records.filter(r => r.recordType === 'consultation').length },
        { value: 'diagnosis', label: 'Diagnoses', icon: '🔬', count: records.filter(r => r.recordType === 'diagnosis').length },
        { value: 'surgery', label: 'Surgeries', icon: '⚕️', count: records.filter(r => r.recordType === 'surgery').length },
        { value: 'vaccination', label: 'Vaccinations', icon: '💉', count: records.filter(r => r.recordType === 'vaccination').length },
        { value: 'allergy', label: 'Allergies', icon: '🚫', count: 0 },
        { value: 'chronic_condition', label: 'Chronic Conditions', icon: '📊', count: 0 }
    ]

    const filteredRecords = records.filter(record => {
        const matchesType = activeTab === 'all' || record.recordType === activeTab
        const s = searchTerm.toLowerCase()
        const matchesSearch = !s ||
            record.title.toLowerCase().includes(s) ||
            (record.doctorName && record.doctorName.toLowerCase().includes(s)) ||
            (record.diagnosis && record.diagnosis.toLowerCase().includes(s))
        const matchesDate = !filterDate || record.date.includes(filterDate)

        return matchesType && matchesSearch && matchesDate
    }).sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending

    const getTypeIcon = (type) => {
        const typeObj = recordTypes.find(t => t.value === type)
        return typeObj ? typeObj.icon : '📋'
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            case 'resolved': return 'bg-cyan-100 text-cyan-700 border border-cyan-200'
            case 'ongoing': return 'bg-amber-100 text-amber-700 border border-amber-200'
            default: return 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-gray-700'
        }
    }

    const activeCount = records.filter(r => r.status === 'active').length
    const latestRecordDate = records.length ? new Date(records.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0].date).toLocaleDateString() : 'N/A'
    const hasFilters = searchTerm || filterDate || activeTab !== 'all'

    return (
        <div className='min-h-screen pt-8 pb-20 px-4 md:px-6'>
            <div className='max-w-7xl mx-auto'>
                <div className='relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-6 md:p-8 mb-8'>
                    <div className='absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl'></div>
                    <div className='absolute -right-16 -bottom-16 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl'></div>
                    <div className='relative flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between'>
                        <div>
                            <p className='text-xs md:text-sm font-semibold uppercase tracking-wide text-cyan-700 mb-2'>Health Archive</p>
                            <h1 className='text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2'>Medical Records</h1>
                            <p className='text-slate-600 dark:text-slate-300 max-w-xl'>Track consultations, diagnoses, and care history in one organized timeline.</p>
                        </div>
                        <div className='flex flex-wrap gap-3'>
                            <button
                                onClick={() => {
                                    setIsEditing(false)
                                    setFormData({
                                        recordType: 'consultation',
                                        title: '',
                                        description: '',
                                        diagnosis: '',
                                        doctorName: '',
                                        hospital: '',
                                        date: new Date().toISOString().split('T')[0],
                                        notes: '',
                                        status: 'active'
                                    })
                                    setAttachments([])
                                    setShowAddModal(true)
                                }}
                                className='px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2'
                            >
                                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                                </svg>
                                Add Record
                            </button>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Total Records</p>
                        <p className='text-3xl font-black text-slate-900 dark:text-white'>{records.length}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Active Cases</p>
                        <p className='text-3xl font-black text-emerald-600'>{activeCount}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Filtered Results</p>
                        <p className='text-3xl font-black text-cyan-700'>{filteredRecords.length}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Latest Entry</p>
                        <p className='text-xl font-bold text-slate-900 dark:text-white'>{latestRecordDate}</p>
                    </div>
                </div>

                <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-5 mb-8 shadow-sm dark:shadow-none'>
                    <div className='flex flex-col md:flex-row gap-3'>
                        <div className='relative flex-1'>
                            <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                            </svg>
                            <input
                                type='text'
                                placeholder='Search title, doctor, diagnosis...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                            />
                        </div>
                        <input
                            type='date'
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className='w-full md:w-auto px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                        />
                        {hasFilters && (
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setFilterDate('')
                                    setActiveTab('all')
                                }}
                                className='px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:bg-gray-900 transition-colors'
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-5 mb-8 shadow-sm dark:shadow-none'>
                    <div className='flex flex-wrap gap-2'>
                        {recordTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setActiveTab(type.value)}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === type.value
                                    ? 'bg-cyan-600 text-white shadow-md'
                                    : 'bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700'
                                    }`}
                            >
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === type.value ? 'bg-white dark:bg-gray-800/20' : 'bg-slate-200 text-slate-600 dark:text-slate-300'}`}>{type.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className='space-y-4'>
                    {loading ? (
                        <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center'>
                            <div className='inline-flex items-center gap-3 text-slate-600 dark:text-slate-300'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600'></div>
                                <span className='font-semibold'>Loading your records...</span>
                            </div>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center'>
                            <div className='text-6xl mb-4'>📋</div>
                            <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>No Records Found</h3>
                            <p className='text-slate-600 dark:text-slate-300 mb-6'>
                                {hasFilters
                                    ? 'No entries match your current filters. Try clearing them.'
                                    : `You don't have any ${activeTab !== 'all' ? activeTab : ''} records yet.`}
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className='px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all'
                            >
                                Add Your First Record
                            </button>
                        </div>
                    ) : (
                        filteredRecords.map((record) => (
                            <article
                                key={record._id}
                                className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-lg transition-all'
                            >
                                <div className='flex flex-col lg:flex-row lg:items-start gap-5'>
                                    <div className='w-14 h-14 bg-gradient-to-r from-cyan-600 to-sky-700 rounded-2xl flex items-center justify-center text-2xl text-white flex-shrink-0'>
                                        {getTypeIcon(record.recordType)}
                                    </div>
                                    <div className='flex-1'>
                                        <div className='flex flex-wrap items-center gap-2 mb-2'>
                                            <h3 className='text-xl font-bold text-slate-900 dark:text-white'>{record.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                            {record.isDemo && <span className='px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200'>Demo</span>}
                                        </div>

                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600 dark:text-slate-300 mb-3'>
                                            <p><span className='font-semibold text-slate-700 dark:text-slate-200'>Date:</span> {new Date(record.date).toLocaleDateString()}</p>
                                            <p><span className='font-semibold text-slate-700 dark:text-slate-200'>Doctor:</span> {record.doctorName || 'Not specified'}</p>
                                            <p><span className='font-semibold text-slate-700 dark:text-slate-200'>Hospital:</span> {record.hospital || 'Not specified'}</p>
                                        </div>

                                        {record.diagnosis && (
                                            <p className='text-slate-700 dark:text-slate-200 mb-2'>
                                                <span className='font-semibold'>Diagnosis:</span> {record.diagnosis}
                                            </p>
                                        )}

                                        <p className='text-sm text-slate-600 dark:text-slate-300 line-clamp-2'>{record.description}</p>

                                        <div className='flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100'>
                                            <button
                                                onClick={() => {
                                                    setSelectedRecord(record)
                                                    setShowViewModal(true)
                                                }}
                                                className='px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-semibold hover:bg-cyan-100 transition-colors'
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => startEdit(record)}
                                                className='px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors'
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDownload(record)}
                                                className='px-4 py-2 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors'
                                            >
                                                Download
                                            </button>
                                            <button
                                                onClick={() => handleShare(record)}
                                                className='px-4 py-2 bg-violet-50 text-violet-700 rounded-lg text-sm font-semibold hover:bg-violet-100 transition-colors'
                                                title='Share Record'
                                            >
                                                Share
                                            </button>
                                            <button
                                                onClick={() => handleDelete(record._id)}
                                                className='px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors'
                                                title='Delete Record'
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>

            {/* Add Record Modal */}
            {showAddModal && (
                <div className='fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-gray-700'>
                        <div className='px-6 py-5 border-b border-slate-200 dark:border-gray-700 bg-gradient-to-r from-cyan-50 to-emerald-50 flex items-center justify-between'>
                            <div>
                                <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>{isEditing ? 'Edit Medical Record' : 'Add Medical Record'}</h2>
                                <p className='text-sm text-slate-600 dark:text-slate-300 mt-1'>Keep your timeline updated and easy to review.</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className='text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors'
                            >
                                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>
                        <div className='p-6 md:p-8 overflow-y-auto w-full h-full'>
                            <div className='mb-4 flex items-center gap-2 text-xs font-semibold text-cyan-700 uppercase tracking-wide'>
                                <span className='h-2 w-2 rounded-full bg-cyan-600'></span>
                                Record Information
                            </div>

                            <form onSubmit={handleAddRecord} className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Record Title *</label>
                                        <input
                                            required
                                            type='text'
                                            name='title'
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                                            placeholder='e.g., Blood Test Results'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Record Type *</label>
                                        <select
                                            name='recordType'
                                            value={formData.recordType}
                                            onChange={handleInputChange}
                                            className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                                        >
                                            <option value='consultation'>Consultation</option>
                                            <option value='diagnosis'>Diagnosis</option>
                                            <option value='surgery'>Surgery</option>
                                            <option value='vaccination'>Vaccination</option>
                                            <option value='allergy'>Allergy</option>
                                            <option value='chronic_condition'>Chronic Condition</option>
                                            <option value='other'>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Date *</label>
                                        <input
                                            required
                                            type='date'
                                            name='date'
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Doctor Name</label>
                                        <input
                                            list='doctors-list'
                                            type='text'
                                            name='doctorName'
                                            value={formData.doctorName}
                                            onChange={handleInputChange}
                                            className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                                            placeholder='Dr. Name'
                                        />
                                        <datalist id='doctors-list'>
                                            {doctors && doctors.map(doc => (
                                                <option key={doc._id} value={doc.name} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className='md:col-span-2'>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Hospital/Clinic</label>
                                        <input
                                            type='text'
                                            name='hospital'
                                            value={formData.hospital}
                                            onChange={handleInputChange}
                                            className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                                            placeholder='Hospital Name'
                                        />
                                    </div>
                                    <div className='md:col-span-2'>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Diagnosis</label>
                                        <input
                                            type='text'
                                            name='diagnosis'
                                            value={formData.diagnosis}
                                            onChange={handleInputChange}
                                            className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                                            placeholder='Primary Diagnosis'
                                        />
                                    </div>
                                    <div className='md:col-span-2'>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Description/Symptoms *</label>
                                        <textarea
                                            required
                                            name='description'
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows='3'
                                            className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                                            placeholder='Detailed description or symptoms...'
                                        ></textarea>
                                    </div>
                                    <div className='md:col-span-2'>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Additional Notes</label>
                                        <textarea
                                            name='notes'
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows='2'
                                            className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all'
                                            placeholder='Any extra notes...'
                                        ></textarea>
                                    </div>
                                    <div className='md:col-span-2'>
                                        {isEditing ? (
                                            <p className='text-sm text-slate-500 dark:text-slate-400 italic'>Editing attachments is currently not supported.</p>
                                        ) : (
                                            <>
                                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Attachments (Photos/PDFs)</label>
                                                <input
                                                    type='file'
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-dotted border-cyan-300 rounded-xl transition-all'
                                                />
                                                <p className='text-[10px] text-slate-500 dark:text-slate-400 mt-1'>Max 5 files. Supported: Images, PDFs</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className='flex gap-4 pt-4'>
                                    <button
                                        type='button'
                                        onClick={() => setShowAddModal(false)}
                                        className='flex-1 px-6 py-3 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 transition-all'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        className='flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all'
                                    >
                                        {isEditing ? 'Update Record' : 'Add Record'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {showViewModal && selectedRecord && (
                <div className='fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-gray-700'>
                        <div className='p-8 overflow-y-auto w-full h-full'>
                            <div className='flex items-center justify-between mb-8 pb-4 border-b border-slate-100'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-14 h-14 bg-gradient-to-r from-cyan-600 to-sky-700 rounded-xl flex items-center justify-center text-3xl text-white'>
                                        {getTypeIcon(selectedRecord.recordType)}
                                    </div>
                                    <div>
                                        <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>{selectedRecord.title}</h2>
                                        <p className='text-slate-500 dark:text-slate-400'>{new Date(selectedRecord.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className='text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors'
                                >
                                    <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </div>

                            <div className='space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 p-4'>
                                        <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2'>Doctor</p>
                                        <p className='font-semibold text-slate-800 dark:text-slate-100'>{selectedRecord.doctorName || 'Not specified'}</p>
                                    </div>
                                    <div className='rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 p-4'>
                                        <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2'>Hospital</p>
                                        <p className='font-semibold text-slate-800 dark:text-slate-100'>{selectedRecord.hospital || 'Not specified'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2'>Diagnosis</p>
                                    <div className='p-4 bg-cyan-50 border border-cyan-100 rounded-xl'>
                                        <p className='text-slate-800 dark:text-slate-100 font-medium'>{selectedRecord.diagnosis || 'No diagnosis recorded'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2'>Description & Symptoms</p>
                                    <p className='text-slate-700 dark:text-slate-200 leading-relaxed'>{selectedRecord.description}</p>
                                </div>

                                {selectedRecord.notes && (
                                    <div>
                                        <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2'>Additional Notes</p>
                                        <p className='text-slate-600 dark:text-slate-300 p-4 bg-slate-50 dark:bg-gray-900 rounded-xl border border-slate-100 italic'>{selectedRecord.notes}</p>
                                    </div>
                                )}

                                {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                                    <div>
                                        <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Attachments</p>
                                        <div className='flex flex-wrap gap-3'>
                                            {selectedRecord.attachments.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-gray-900 hover:bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-sm transition-all'
                                                >
                                                    <span>📄</span>
                                                    <span className='truncate max-w-[150px] font-medium'>{file.name}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MedicalRecords
