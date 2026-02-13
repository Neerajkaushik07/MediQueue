import React, { useState, useContext, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const MedicalRecords = () => {
    const { backendUrl, token, userData } = useContext(AppContext)
    const [activeTab, setActiveTab] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [loading, setLoading] = useState(true)
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
    }, [backendUrl, token])

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
        try {
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

    const filteredRecords = activeTab === 'all'
        ? records
        : records.filter(record => record.recordType === activeTab)

    const getTypeIcon = (type) => {
        const typeObj = recordTypes.find(t => t.value === type)
        return typeObj ? typeObj.icon : '📋'
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-600'
            case 'resolved': return 'bg-blue-100 text-blue-600'
            case 'ongoing': return 'bg-orange-100 text-orange-600'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    return (
        <div className='min-h-screen py-8'>
            {/* Demo Data Notice */}
            {/* Demo Data Notice removed */}
            {/* Header */}
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-4xl font-bold medical-heading mb-2'>Medical Records</h1>
                    <p className='text-gray-600'>View and manage your complete medical history</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className='btn-primary px-6 py-3 flex items-center gap-2'
                >
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                    </svg>
                    Add Record
                </button>
            </div>

            {/* Record Type Tabs */}
            <div className='glass-card p-6 mb-8'>
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4'>
                    {recordTypes.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => setActiveTab(type.value)}
                            className={`p-4 rounded-xl transition-all ${activeTab === type.value
                                ? 'bg-primary text-white shadow-lg scale-105'
                                : 'bg-white hover:bg-gray-50'
                                }`}
                        >
                            <div className='text-3xl mb-2'>{type.icon}</div>
                            <p className='font-semibold text-sm mb-1'>{type.label}</p>
                            <p className='text-xs opacity-75'>{type.count} records</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Records List */}
            <div className='space-y-4'>
                {loading ? (
                    <div className='flex justify-center py-12'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className='glass-card p-12 text-center'>
                        <div className='text-6xl mb-4'>📋</div>
                        <h3 className='text-xl font-bold mb-2'>No Records Found</h3>
                        <p className='text-gray-600 mb-6'>
                            You don't have any {activeTab !== 'all' ? activeTab : ''} records yet
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className='btn-primary px-6 py-3'
                        >
                            Add Your First Record
                        </button>
                    </div>
                ) : (
                    filteredRecords.map((record) => (
                        <div
                            key={record._id}
                            className='glass-card p-6 hover:shadow-xl transition-all cursor-pointer group'
                        >
                            <div className='flex items-start justify-between'>
                                <div className='flex items-start gap-4 flex-1'>
                                    <div className='w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform'>
                                        {getTypeIcon(record.recordType)}
                                    </div>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <h3 className='text-xl font-bold group-hover:text-primary transition-colors'>
                                                {record.title}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </div>
                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3'>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-lg'>📅</span>
                                                <span>{new Date(record.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-lg'>👨‍⚕️</span>
                                                <span>{record.doctorName || 'Not specified'}</span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-lg'>🏥</span>
                                                <span>{record.hospital || 'Not specified'}</span>
                                            </div>
                                        </div>
                                        {record.diagnosis && (
                                            <p className='text-gray-700 mb-2'>
                                                <span className='font-semibold'>Diagnosis:</span> {record.diagnosis}
                                            </p>
                                        )}
                                        <div className='flex gap-2 mt-4'>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedRecord(record)
                                                    setShowViewModal(true)
                                                }}
                                                className='px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90'
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDownload(record)
                                                }}
                                                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200'
                                            >
                                                Download
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleShare(record)
                                                }}
                                                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200'
                                            >
                                                Share
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Record Modal */}
            {showAddModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between mb-6'>
                            <h2 className='text-2xl font-bold'>Add Medical Record</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className='text-gray-400 hover:text-gray-600'
                            >
                                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddRecord} className='space-y-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Record Title *</label>
                                    <input
                                        required
                                        type='text'
                                        name='title'
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all'
                                        placeholder='e.g., Blood Test Results'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Record Type *</label>
                                    <select
                                        name='recordType'
                                        value={formData.recordType}
                                        onChange={handleInputChange}
                                        className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all'
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
                                    <label className='block text-sm font-semibold mb-1'>Date *</label>
                                    <input
                                        required
                                        type='date'
                                        name='date'
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Doctor Name</label>
                                    <input
                                        type='text'
                                        name='doctorName'
                                        value={formData.doctorName}
                                        onChange={handleInputChange}
                                        className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all'
                                        placeholder='Dr. Name'
                                    />
                                </div>
                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-semibold mb-1'>Hospital/Clinic</label>
                                    <input
                                        type='text'
                                        name='hospital'
                                        value={formData.hospital}
                                        onChange={handleInputChange}
                                        className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all'
                                        placeholder='Hospital Name'
                                    />
                                </div>
                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-semibold mb-1'>Diagnosis</label>
                                    <input
                                        type='text'
                                        name='diagnosis'
                                        value={formData.diagnosis}
                                        onChange={handleInputChange}
                                        className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all'
                                        placeholder='Primary Diagnosis'
                                    />
                                </div>
                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-semibold mb-1'>Description/Symptoms *</label>
                                    <textarea
                                        required
                                        name='description'
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows='3'
                                        className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all'
                                        placeholder='Detailed description or symptoms...'
                                    ></textarea>
                                </div>
                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-semibold mb-1'>Additional Notes</label>
                                    <textarea
                                        name='notes'
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows='2'
                                        className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all'
                                        placeholder='Any extra notes...'
                                    ></textarea>
                                </div>
                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-semibold mb-1'>Attachments (Photos/PDFs)</label>
                                    <input
                                        type='file'
                                        multiple
                                        onChange={handleFileChange}
                                        className='w-full p-3 bg-gray-50 border border-dotted border-primary/30 rounded-xl transition-all'
                                    />
                                    <p className='text-[10px] text-gray-500 mt-1'>Max 5 files. Supported: Images, PDFs</p>
                                </div>
                            </div>

                            <div className='flex gap-4 pt-4'>
                                <button
                                    type='button'
                                    onClick={() => setShowAddModal(false)}
                                    className='flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className='flex-1 px-6 py-3 bg-gradient-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all'
                                >
                                    Add Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {showViewModal && selectedRecord && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between mb-8 pb-4 border-b border-gray-100'>
                            <div className='flex items-center gap-4'>
                                <div className='w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center text-3xl text-white'>
                                    {getTypeIcon(selectedRecord.recordType)}
                                </div>
                                <div>
                                    <h2 className='text-2xl font-bold'>{selectedRecord.title}</h2>
                                    <p className='text-gray-500'>{new Date(selectedRecord.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className='text-gray-400 hover:text-gray-600'
                            >
                                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='glass-card p-4'>
                                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Doctor</p>
                                    <p className='font-semibold text-gray-800'>{selectedRecord.doctorName || 'Not specified'}</p>
                                </div>
                                <div className='glass-card p-4'>
                                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Hospital</p>
                                    <p className='font-semibold text-gray-800'>{selectedRecord.hospital || 'Not specified'}</p>
                                </div>
                            </div>

                            <div>
                                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Diagnosis</p>
                                <div className='p-4 bg-primary/5 border border-primary/10 rounded-xl'>
                                    <p className='text-gray-800 font-medium'>{selectedRecord.diagnosis || 'No diagnosis recorded'}</p>
                                </div>
                            </div>

                            <div>
                                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Description & Symptoms</p>
                                <p className='text-gray-700 leading-relaxed'>{selectedRecord.description}</p>
                            </div>

                            {selectedRecord.notes && (
                                <div>
                                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Additional Notes</p>
                                    <p className='text-gray-600 p-4 bg-gray-50 rounded-xl border border-gray-100 italic'>{selectedRecord.notes}</p>
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
                                                className='flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm transition-all'
                                            >
                                                <span>📄</span>
                                                <span className='truncate max-w-[150px] font-medium'>{file.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='flex gap-4 mt-10 pt-6 border-t border-gray-100'>
                            <button
                                onClick={() => handleDownload(selectedRecord)}
                                className='flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all'
                            >
                                Download Report
                            </button>
                            <button
                                onClick={() => handleShare(selectedRecord)}
                                className='flex-1 px-6 py-3 bg-gradient-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all'
                            >
                                Share Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MedicalRecords
