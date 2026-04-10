import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FaUserFriends, FaShieldAlt, FaFileInvoiceDollar, FaPlus, FaTrash, FaEdit, FaChevronRight, FaPhoneAlt, FaExclamationTriangle } from 'react-icons/fa'

const FamilyHealth = () => {
    const { backendUrl, token } = useContext(AppContext)
    const [activeTab, setActiveTab] = useState('family')
    const [showRelationDropdown, setShowRelationDropdown] = useState(false)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [showMemberModal, setShowMemberModal] = useState(false)
    const [showInsuranceModal, setShowInsuranceModal] = useState(false)
    const [isEditingInsurance, setIsEditingInsurance] = useState(false)
    const [selectedInsuranceId, setSelectedInsuranceId] = useState(null)
    const [isEditingMember, setIsEditingMember] = useState(false)
    const [selectedMemberId, setSelectedMemberId] = useState(null)
    const [deleteMemberId, setDeleteMemberId] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [billingSummary, setBillingSummary] = useState({ total: 0, paid: 0, outstanding: 0 })
    const [sosLoading, setSosLoading] = useState(false)
    const [sosCancelLoading, setSosCancelLoading] = useState(false)
    const [activeEmergency, setActiveEmergency] = useState(null)
    const [allergyInput, setAllergyInput] = useState('')
    const [billFilters, setBillFilters] = useState({ status: 'all', query: '', startDate: '', endDate: '' })

    // Form States
    const [memberForm, setMemberForm] = useState({
        name: '', relationship: 'husband', gender: 'male', age: '', bloodGroup: '', allergies: [], profileImage: ''
    })
    const [insuranceForm, setInsuranceForm] = useState({
        providerName: '', policyNumber: '', type: '', endDate: '', premium: ''
    })

    // Data states
    const [familyMembers, setFamilyMembers] = useState([])
    const [insurancePolicies, setInsurancePolicies] = useState([])
    const [bills, setBills] = useState([])

    // Demo Data
    const demoFamily = [
        { _id: 'f1', name: 'Sarah Wilson', relationship: 'Wife', gender: 'Female', age: 34, bloodGroup: 'A+', allergies: ['Penicillin'], profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
        { _id: 'f2', name: 'Leo Wilson', relationship: 'Son', gender: 'Male', age: 8, bloodGroup: 'A+', allergies: [], profileImage: 'https://images.unsplash.com/photo-1513956589380-bad6ac3f7a9f?w=150' }
    ]

    const demoInsurance = [
        { _id: 'i1', providerName: 'Blue Shield Health', policyNumber: 'BSH-99283-X', type: 'Family Floater', status: 'Active', endDate: '2025-05-20', premium: '$450/mo' },
        { _id: 'i2', providerName: 'Guardian Vision', policyNumber: 'GV-8821-V', type: 'Vision Care', status: 'Active', endDate: '2024-12-15', premium: '$25/mo' }
    ]

    const demoBills = [
        { _id: 'b1', billNumber: 'BILL-1002', billDate: '2024-02-10', totalAmount: 1200, patientPayable: 200, paymentStatus: 'pending', service: 'Surgery Consultation' },
        { _id: 'b2', billNumber: 'BILL-1001', billDate: '2024-01-15', totalAmount: 85, patientPayable: 0, paymentStatus: 'paid', service: 'General Checkup' }
    ]

    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            const statusMatch = billFilters.status === 'all' || bill.paymentStatus === billFilters.status
            const query = billFilters.query.toLowerCase()
            const queryMatch = !query || bill.billNumber.toLowerCase().includes(query) || bill.service.toLowerCase().includes(query)

            const billDate = new Date(bill.billDate)
            const startOk = billFilters.startDate ? billDate >= new Date(billFilters.startDate) : true
            const endOk = billFilters.endDate ? billDate <= new Date(billFilters.endDate) : true

            return statusMatch && queryMatch && startOk && endOk
        })
    }, [bills, billFilters])

    const filteredSummary = useMemo(() => {
        return filteredBills.reduce((acc, bill) => {
            acc.total += Number(bill.totalAmount || 0)
            if (bill.paymentStatus === 'paid') {
                acc.paid += Number(bill.patientPayable ?? bill.totalAmount ?? 0)
            } else {
                acc.outstanding += Number(bill.patientPayable ?? bill.totalAmount ?? 0)
            }
            return acc
        }, { total: 0, paid: 0, outstanding: 0 })
    }, [filteredBills])

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            if (token) {
                const [familyRes, insuranceRes, billingRes, summaryRes, activeEmergencyRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/family-health/family`, { headers: { token } }),
                    axios.get(`${backendUrl}/api/family-health/insurance`, { headers: { token } }),
                    axios.get(`${backendUrl}/api/family-health/billing`, { headers: { token } }),
                    axios.get(`${backendUrl}/api/family-health/billing/summary`, { headers: { token } }),
                    axios.get(`${backendUrl}/api/family-health/emergency/active`, { headers: { token } })
                ])

                setFamilyMembers(familyRes.data.success && familyRes.data.members.length > 0 ? familyRes.data.members : demoFamily)
                setInsurancePolicies(insuranceRes.data.success && insuranceRes.data.policies.length > 0 ? insuranceRes.data.policies : demoInsurance)
                setBills(billingRes.data.success && billingRes.data.bills.length > 0 ? billingRes.data.bills : demoBills)
                if (summaryRes.data?.success) {
                    const { totalAmount = 0, paidAmount = 0, outstandingAmount = 0 } = summaryRes.data.summary || {}
                    setBillingSummary({ total: totalAmount, paid: paidAmount, outstanding: outstandingAmount })
                }
                if (activeEmergencyRes.data?.success) {
                    const active = activeEmergencyRes.data.activeServices || activeEmergencyRes.data.active || activeEmergencyRes.data.service
                    setActiveEmergency(Array.isArray(active) ? active[0] : active || null)
                } else {
                    setActiveEmergency(null)
                }
            } else {
                setFamilyMembers(demoFamily)
                setInsurancePolicies(demoInsurance)
                setBills(demoBills)
                setBillingSummary({ total: 1285, paid: 1085, outstanding: 200 })
                setActiveEmergency(null)
            }
        } catch (error) {
            console.error('Error fetching family health data:', error)
            setFamilyMembers(demoFamily)
            setInsurancePolicies(demoInsurance)
            setBills(demoBills)
            setBillingSummary({ total: 1285, paid: 1085, outstanding: 200 })
            setActiveEmergency(null)
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const resetMemberForm = () => {
        setMemberForm({ name: '', relationship: 'husband', gender: 'male', age: '', bloodGroup: '', allergies: [], profileImage: '' })
        setSelectedMemberId(null)
        setIsEditingMember(false)
        setAllergyInput('')
    }

    const handleSubmitMember = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...memberForm,
                age: Number(memberForm.age),
                allergies: Array.isArray(memberForm.allergies) ? memberForm.allergies : []
            }

            const url = isEditingMember
                ? `${backendUrl}/api/family-health/family/${selectedMemberId}`
                : `${backendUrl}/api/family-health/family/add`

            const method = isEditingMember ? 'put' : 'post'
            const { data } = await axios[method](url, payload, { headers: { token } })

            if (data.success) {
                toast.success(isEditingMember ? 'Family member updated!' : 'Family member added successfully!')
                setShowMemberModal(false)
                resetMemberForm()
                fetchData()
            } else {
                toast.error(data.message || 'Action failed')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleAddInsurance = async (e) => {
        e.preventDefault()
        try {
            if (isEditingInsurance) {
                const { data } = await axios.put(`${backendUrl}/api/family-health/insurance/${selectedInsuranceId}`, insuranceForm, { headers: { token } })
                if (data.success) {
                    toast.success('Insurance policy updated successfully!')
                    setShowInsuranceModal(false)
                    setIsEditingInsurance(false)
                    setInsuranceForm({ providerName: '', policyNumber: '', type: '', endDate: '', premium: '' })
                    fetchData()
                } else {
                    toast.error(data.message)
                }
            } else {
                const { data } = await axios.post(`${backendUrl}/api/family-health/insurance/add`, insuranceForm, { headers: { token } })
                if (data.success) {
                    toast.success('Insurance policy added successfully!')
                    setShowInsuranceModal(false)
                    setInsuranceForm({ providerName: '', policyNumber: '', type: '', endDate: '', premium: '' })
                    fetchData()
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleOpenAddMember = () => {
        resetMemberForm()
        setShowMemberModal(true)
    }

    const handleEditMemberClick = (member) => {
        setMemberForm({
            name: member.name || '',
            relationship: member.relationship || 'husband',
            gender: member.gender || 'male',
            age: member.age || '',
            bloodGroup: member.bloodGroup || '',
            allergies: Array.isArray(member.allergies) ? member.allergies : [],
            profileImage: member.profileImage || ''
        })
        setSelectedMemberId(member._id)
        setIsEditingMember(true)
        setShowMemberModal(true)
        setAllergyInput('')
    }

    const handleAllergyKeyDown = (e) => {
        if (e.key !== 'Enter' && e.key !== ',') return
        e.preventDefault()
        const value = allergyInput.trim()
        if (!value) return
        if (!memberForm.allergies.includes(value)) {
            setMemberForm({ ...memberForm, allergies: [...memberForm.allergies, value] })
        }
        setAllergyInput('')
    }

    const handleRemoveAllergy = (value) => {
        setMemberForm({ ...memberForm, allergies: memberForm.allergies.filter(a => a !== value) })
    }

    const getInsuranceStatus = (endDate) => {
        const today = new Date()
        const expiry = new Date(endDate)
        const diffDays = Math.round((expiry - today) / (1000 * 60 * 60 * 24))

        if (Number.isNaN(diffDays)) return { label: 'Unknown', badgeClass: 'bg-gray-100 text-gray-600', daysRemaining: null }
        if (diffDays < 0) return { label: 'Expired', badgeClass: 'bg-red-100 text-red-700', daysRemaining: diffDays }
        if (diffDays <= 30) return { label: 'Expiring soon', badgeClass: 'bg-amber-100 text-amber-700', daysRemaining: diffDays }
        return { label: 'Active', badgeClass: 'bg-green-100 text-green-700', daysRemaining: diffDays }
    }

    const handleEditInsuranceClick = (policy) => {
        setInsuranceForm({
            providerName: policy.providerName,
            policyNumber: policy.policyNumber,
            type: policy.type,
            endDate: policy.endDate.split('T')[0],
            premium: policy.premium
        })
        setSelectedInsuranceId(policy._id)
        setIsEditingInsurance(true)
        setShowInsuranceModal(true)
    }

    const handlePayBill = async (billId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/family-health/billing/${billId}/payment`, {}, { headers: { token } })
            if (data.success) {
                toast.success('Payment recorded')
                fetchData()
            } else {
                toast.error(data.message || 'Payment could not be processed')
            }
        } catch (error) {
            toast.error(error.message || 'Payment could not be processed')
        }
    }

    const handleDeleteMember = async () => {
        if (!deleteMemberId) return
        try {
            const { data } = await axios.delete(`${backendUrl}/api/family-health/family/${deleteMemberId}`, { headers: { token } })
            if (data.success) {
                toast.success('Family member removed')
                setShowDeleteModal(false)
                setDeleteMemberId(null)
                fetchData()
            } else {
                toast.error(data.message || 'Failed to remove member')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleRequestSOS = async () => {
        try {
            setSosLoading(true)
            const { data } = await axios.post(`${backendUrl}/api/family-health/emergency/request`, {}, { headers: { token } })
            if (data.success) {
                toast.success('Emergency request sent')
                const active = data.service || data.activeService
                if (active) setActiveEmergency(active)
                else fetchData()
            } else {
                toast.error(data.message || 'Could not send emergency request')
            }
        } catch (error) {
            toast.error(error.message || 'Could not send emergency request')
        } finally {
            setSosLoading(false)
        }
    }

    const handleCancelSOS = async () => {
        if (!activeEmergency?._id) return
        try {
            setSosCancelLoading(true)
            const { data } = await axios.post(`${backendUrl}/api/family-health/emergency/${activeEmergency._id}/cancel`, {}, { headers: { token } })
            if (data.success) {
                toast.info('Emergency request cancelled')
                setActiveEmergency(null)
            } else {
                toast.error(data.message || 'Unable to cancel request')
            }
        } catch (error) {
            toast.error(error.message || 'Unable to cancel request')
        } finally {
            setSosCancelLoading(false)
        }
    }

    const handleDownloadReceipt = (bill) => {
        try {
            const doc = new jsPDF()

            // Header
            doc.setFontSize(22)
            doc.setTextColor(33, 150, 243)
            doc.text('PAYMENT RECEIPT', 105, 20, { align: 'center' })

            doc.setDrawColor(200, 200, 200)
            doc.line(20, 25, 190, 25)

            // Receipt Details
            doc.setFontSize(12)
            doc.setTextColor(40, 44, 52)
            doc.text(`Receipt #: REC-${bill.billNumber.split('-')[1] || Date.now()}`, 20, 40)
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 47)
            doc.text(`Transaction ID: TXN${Date.now()}`, 20, 54)

            // Payment Info
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text('Payment Summary', 20, 70)

            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            doc.text(`Bill Number: ${bill.billNumber}`, 20, 80)
            doc.text(`Service: ${bill.service}`, 20, 87)
            doc.text(`Status: PAID`, 20, 94)

            // Table
            const columns = ["Description", "Quantity", "Amount"]
            const rows = [
                [bill.service, "1", `$${bill.totalAmount}`],
                ["Insurance Covered", "-", `-$${bill.totalAmount - (bill.patientPayable || 0)}`],
                ["Total Paid", "-", `$${bill.patientPayable || bill.totalAmount}`]
            ]

            autoTable(doc, {
                head: [columns],
                body: rows,
                startY: 105,
                theme: 'striped',
                headStyles: { fillColor: [33, 150, 243] }
            })

            // Footer
            const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 105) + 30
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.text('Thank you for choosing MediQueue!', 105, finalY, { align: 'center' })

            doc.setFontSize(10)
            doc.setTextColor(150)
            doc.text(`MediQueue Healthcare Services`, 105, finalY + 10, { align: 'center' })

            doc.save(`Receipt_${bill.billNumber}.pdf`)
            toast.success('Receipt downloaded successfully!')
        } catch (error) {
            console.error('Receipt PDF Error:', error)
            toast.error('Failed to generate receipt')
        }
    }

    const handleExportBillsCSV = () => {
        const headers = ['Invoice', 'Date', 'Service', 'Amount', 'Payable', 'Status']
        const rows = filteredBills.map(bill => [
            bill.billNumber,
            new Date(bill.billDate).toLocaleDateString(),
            bill.service,
            bill.totalAmount,
            bill.patientPayable ?? bill.totalAmount,
            bill.paymentStatus
        ])

        const csvContent = [headers, ...rows].map(row => row.map(String).map(val => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'billing-export.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Billing CSV exported')
    }

    const handleExportBillsPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text('Billing Export', 14, 18)

        const columns = ['Invoice', 'Date', 'Service', 'Amount', 'Payable', 'Status']
        const rows = filteredBills.map(bill => [
            bill.billNumber,
            new Date(bill.billDate).toLocaleDateString(),
            bill.service,
            `$${bill.totalAmount}`,
            `$${bill.patientPayable ?? bill.totalAmount}`,
            bill.paymentStatus
        ])

        autoTable(doc, {
            head: [columns],
            body: rows,
            startY: 24,
            theme: 'grid'
        })

        doc.save('billing-export.pdf')
        toast.success('Billing PDF exported')
    }

    const tabs = [
        { id: 'family', label: 'Family Members', icon: FaUserFriends, color: 'text-blue-500' },
        { id: 'insurance', label: 'Insurance', icon: FaShieldAlt, color: 'text-green-500' },
        { id: 'billing', label: 'Billing', icon: FaFileInvoiceDollar, color: 'text-purple-500' }
    ]

    const activePoliciesCount = insurancePolicies.filter(policy => {
        const status = getInsuranceStatus(policy.endDate)
        return status.label === 'Active' || status.label === 'Expiring soon'
    }).length

    const pendingBillsCount = bills.filter(bill => bill.paymentStatus !== 'paid').length

    return (
        <div className='min-h-screen py-8 mb-20 px-4 md:px-6'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-6 md:p-8 mb-8'>
                    <div className='absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl'></div>
                    <div className='absolute -right-16 -bottom-16 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl'></div>
                    <div className='relative'>
                        <p className='text-xs md:text-sm font-semibold uppercase tracking-wide text-cyan-700 mb-2'>Family Care Dashboard</p>
                        <h1 className='text-3xl md:text-4xl font-black text-slate-900 mb-2'>Family Health Hub</h1>
                        <p className='text-slate-600 max-w-2xl'>Manage health records, insurance coverage, and billing for every family member from one place.</p>
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                    <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                        <p className='text-sm text-slate-500 mb-1'>Family Members</p>
                        <p className='text-3xl font-black text-slate-900'>{familyMembers.length}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                        <p className='text-sm text-slate-500 mb-1'>Active Policies</p>
                        <p className='text-3xl font-black text-emerald-600'>{activePoliciesCount}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                        <p className='text-sm text-slate-500 mb-1'>Outstanding Bills</p>
                        <p className='text-3xl font-black text-amber-600'>{pendingBillsCount}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                        <p className='text-sm text-slate-500 mb-1'>Total Billed</p>
                        <p className='text-3xl font-black text-cyan-700'>${Number(billingSummary.total || 0).toLocaleString()}</p>
                    </div>
                </div>

                <div className='rounded-2xl border border-red-200 bg-red-50 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8'>
                    <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600'>
                            <FaExclamationTriangle />
                        </div>
                        <div>
                            <p className='text-sm text-red-700 font-bold uppercase tracking-wide'>Emergency support</p>
                            <p className='text-red-900/80'>Use SOS to alert the care team instantly in urgent situations.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRequestSOS}
                        disabled={sosLoading || !!activeEmergency}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-white transition-all ${(sosLoading || activeEmergency) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        <FaPhoneAlt className='text-sm' />
                        {activeEmergency ? 'SOS Active' : sosLoading ? 'Sending...' : 'Send SOS'}
                    </button>
                </div>

                {activeEmergency && (
                    <div className='rounded-2xl p-4 mb-8 border border-amber-200 bg-amber-50 flex items-center justify-between gap-4'>
                        <div>
                            <p className='text-xs font-bold text-amber-700 uppercase'>Emergency in progress</p>
                            <p className='text-slate-800 font-semibold'>Care team has been alerted. Request ID: {activeEmergency._id}</p>
                            {activeEmergency.createdAt && (
                                <p className='text-xs text-slate-600 mt-1'>Started: {new Date(activeEmergency.createdAt).toLocaleString()}</p>
                            )}
                        </div>
                        <button
                            onClick={handleCancelSOS}
                            disabled={sosCancelLoading}
                            className={`px-4 py-2 rounded-xl font-bold text-white transition-all ${sosCancelLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-black'}`}
                        >
                            {sosCancelLoading ? 'Cancelling...' : 'Cancel SOS'}
                        </button>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className='flex gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-3xl overflow-x-auto'>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-3 px-5 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                ? 'bg-cyan-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className={activeTab === tab.id ? 'text-white' : tab.color} />
                            <span className='whitespace-nowrap'>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className='min-h-[400px]'>
                    {loading ? (
                        <div className='flex justify-center py-20'>
                            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600'></div>
                        </div>
                    ) : (
                        <div className='animate-fade-in'>
                            {/* Family Tab */}
                            {activeTab === 'family' && (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {familyMembers.map(member => (
                                        <div key={member._id} className='rounded-2xl border border-slate-200 bg-white p-6 group hover:shadow-lg transition-all'>
                                            <div className='flex items-center gap-4 mb-6'>
                                                <img
                                                    src={member.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random` }}
                                                    alt={member.name}
                                                    className='w-16 h-16 rounded-full object-cover border-4 border-cyan-100 group-hover:border-cyan-400 transition-all'
                                                />
                                                <div>
                                                    <h3 className='text-xl font-bold text-slate-900'>{member.name}</h3>
                                                    <span className='px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-bold uppercase'>
                                                        {member.relationship}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className='space-y-3 mb-6'>
                                                <div className='flex justify-between text-sm py-2 border-b border-slate-100'>
                                                    <span className='text-slate-400'>Age / Gender</span>
                                                    <span className='font-bold text-slate-700'>{member.age} yrs • {member.gender}</span>
                                                </div>
                                                <div className='flex justify-between text-sm py-2 border-b border-slate-100'>
                                                    <span className='text-slate-400'>Blood Group</span>
                                                    <span className='font-bold text-red-600'>{member.bloodGroup || 'N/A'}</span>
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <span className='text-xs font-bold text-slate-400 uppercase'>Allergies</span>
                                                    <p className='text-sm text-slate-600'>
                                                        {member.allergies?.length > 0 ? member.allergies.join(', ') : 'No known allergies'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='flex gap-3 items-center'>
                                                <button
                                                    onClick={() => navigate('/medical-records', { state: { memberName: member.name } })}
                                                    className='flex-1 py-3 bg-slate-50 hover:bg-cyan-600 hover:text-white rounded-xl font-bold transition-all text-slate-700 flex items-center justify-center gap-2'
                                                >
                                                    View Health Record <FaChevronRight className='text-xs' />
                                                </button>
                                                <button
                                                    onClick={() => handleEditMemberClick(member)}
                                                    className='w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-all'
                                                    title='Edit Member'
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => { setDeleteMemberId(member._id); setShowDeleteModal(true); }}
                                                    className='w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all'
                                                    title='Remove Member'
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleOpenAddMember}
                                        className='rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 flex flex-col items-center justify-center gap-4 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all group'
                                    >
                                        <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all'>
                                            <FaPlus className='text-2xl' />
                                        </div>
                                        <span className='font-bold text-slate-500 group-hover:text-cyan-700'>Add Family Member</span>
                                    </button>
                                </div>
                            )}

                            {/* Insurance Tab */}
                            {activeTab === 'insurance' && (
                                <div className='space-y-6'>
                                    {insurancePolicies.map(policy => {
                                        const status = getInsuranceStatus(policy.endDate)
                                        return (
                                            <div key={policy._id} className='rounded-2xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start justify-between hover:shadow-lg transition-all'>
                                                <div className='flex gap-6 items-center'>
                                                    <div className='w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-4xl text-emerald-600'>
                                                        <FaShieldAlt />
                                                    </div>
                                                    <div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 inline-block ${status.badgeClass}`}>
                                                            {status.label}
                                                        </span>
                                                        <h3 className='text-2xl font-bold text-slate-900'>{policy.providerName}</h3>
                                                        <p className='text-slate-500'>Policy #: <span className='font-mono font-bold'>{policy.policyNumber}</span></p>
                                                        {status.daysRemaining !== null && status.daysRemaining >= 0 && (
                                                            <p className='text-xs text-amber-700 font-semibold mt-1'>Expires in {status.daysRemaining} days</p>
                                                        )}
                                                        {status.daysRemaining !== null && status.daysRemaining < 0 && (
                                                            <p className='text-xs text-red-600 font-semibold mt-1'>Expired {Math.abs(status.daysRemaining)} days ago</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='flex flex-wrap gap-8 w-full md:w-auto'>
                                                    <div className='min-w-[120px]'>
                                                        <p className='text-xs font-bold text-slate-400 uppercase mb-1'>Type</p>
                                                        <p className='font-bold text-slate-700'>{policy.type}</p>
                                                    </div>
                                                    <div className='min-w-[120px]'>
                                                        <p className='text-xs font-bold text-slate-400 uppercase mb-1'>Expiry Date</p>
                                                        <p className='font-bold text-slate-700'>{new Date(policy.endDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className='min-w-[120px]'>
                                                        <p className='text-xs font-bold text-slate-400 uppercase mb-1'>Premium</p>
                                                        <p className='font-bold text-cyan-700'>{policy.premium}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleEditInsuranceClick(policy)}
                                                    className='p-4 hover:bg-slate-100 rounded-2xl transition-colors'
                                                >
                                                    <FaEdit className='text-slate-400 text-xl hover:text-cyan-700' />
                                                </button>
                                            </div>
                                        )
                                    })}
                                    <button
                                        onClick={() => {
                                            setIsEditingInsurance(false)
                                            setInsuranceForm({ providerName: '', policyNumber: '', type: '', endDate: '', premium: '' })
                                            setShowInsuranceModal(true)
                                        }}
                                        className='w-full py-8 border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center gap-4 hover:border-cyan-500 hover:bg-cyan-50 transition-all text-slate-400 hover:text-cyan-700 font-bold'
                                    >
                                        <FaPlus /> Add New Policy
                                    </button>
                                </div>
                            )}

                            {/* Billing Tab */}
                            {activeTab === 'billing' && (
                                <div className='space-y-6'>
                                    <div className='rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap gap-4 items-end shadow-sm'>
                                        <div className='flex-1 min-w-[200px]'>
                                            <label className='block text-xs font-bold text-slate-500 mb-1'>Search</label>
                                            <input
                                                type='text'
                                                placeholder='Search invoice or service'
                                                value={billFilters.query}
                                                onChange={e => setBillFilters({ ...billFilters, query: e.target.value })}
                                                className='w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none'
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-xs font-bold text-slate-500 mb-1'>Status</label>
                                            <select
                                                value={billFilters.status}
                                                onChange={e => setBillFilters({ ...billFilters, status: e.target.value })}
                                                className='px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none'
                                            >
                                                <option value='all'>All</option>
                                                <option value='paid'>Paid</option>
                                                <option value='pending'>Pending</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className='block text-xs font-bold text-slate-500 mb-1'>Start date</label>
                                            <input type='date' value={billFilters.startDate} onChange={e => setBillFilters({ ...billFilters, startDate: e.target.value })} className='px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' />
                                        </div>
                                        <div>
                                            <label className='block text-xs font-bold text-slate-500 mb-1'>End date</label>
                                            <input type='date' value={billFilters.endDate} onChange={e => setBillFilters({ ...billFilters, endDate: e.target.value })} className='px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' />
                                        </div>
                                        <div className='flex gap-2'>
                                            <button onClick={handleExportBillsCSV} type='button' className='px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold hover:bg-slate-200'>Export CSV</button>
                                            <button onClick={handleExportBillsPDF} type='button' className='px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800'>Export PDF</button>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                        <div className='rounded-2xl p-5 border border-slate-200 bg-white shadow-sm'>
                                            <p className='text-xs font-bold text-slate-400 uppercase mb-1'>Total Billed</p>
                                            <p className='text-3xl font-bold text-slate-900'>${Number(filteredSummary.total || 0).toLocaleString()}</p>
                                            <p className='text-sm text-slate-500 mt-1'>Filtered invoices</p>
                                        </div>
                                        <div className='rounded-2xl p-5 border border-slate-200 bg-white shadow-sm'>
                                            <p className='text-xs font-bold text-slate-400 uppercase mb-1'>Paid</p>
                                            <p className='text-3xl font-bold text-green-600'>${Number(filteredSummary.paid || 0).toLocaleString()}</p>
                                            <p className='text-sm text-slate-500 mt-1'>Settled invoices</p>
                                        </div>
                                        <div className='rounded-2xl p-5 border border-amber-200 bg-amber-50'>
                                            <p className='text-xs font-bold text-amber-700 uppercase mb-1'>Outstanding</p>
                                            <p className='text-3xl font-bold text-amber-700'>${Number(filteredSummary.outstanding || 0).toLocaleString()}</p>
                                            <p className='text-sm text-amber-700 mt-1'>Pending payment</p>
                                        </div>
                                    </div>

                                    <div className='rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm'>
                                        <table className='w-full text-left'>
                                            <thead>
                                                <tr className='bg-slate-50 border-b border-slate-100'>
                                                    <th className='px-8 py-5 text-xs font-bold text-slate-400 uppercase'>Invoice</th>
                                                    <th className='px-8 py-5 text-xs font-bold text-slate-400 uppercase'>Date</th>
                                                    <th className='px-8 py-5 text-xs font-bold text-slate-400 uppercase'>Service</th>
                                                    <th className='px-8 py-5 text-xs font-bold text-slate-400 uppercase'>Amount</th>
                                                    <th className='px-8 py-5 text-xs font-bold text-slate-400 uppercase'>Status</th>
                                                    <th className='px-8 py-5 text-xs font-bold text-slate-400 uppercase'>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className='divide-y divide-slate-100'>
                                                {filteredBills.length === 0 && (
                                                    <tr>
                                                        <td colSpan='6' className='px-8 py-6 text-center text-slate-500'>No bills match your filters.</td>
                                                    </tr>
                                                )}
                                                {filteredBills.map(bill => (
                                                    <tr key={bill._id} className={`transition-colors ${bill.paymentStatus !== 'paid' ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-slate-50/70'}`}>
                                                        <td className='px-8 py-6'>
                                                            <span className='font-mono font-bold text-slate-800'>{bill.billNumber}</span>
                                                        </td>
                                                        <td className='px-8 py-6 text-slate-600'>
                                                            {new Date(bill.billDate).toLocaleDateString()}
                                                        </td>
                                                        <td className='px-8 py-6 font-semibold text-slate-700'>
                                                            {bill.service}
                                                        </td>
                                                        <td className='px-8 py-6'>
                                                            <div className='flex flex-col'>
                                                                <span className='font-bold text-slate-900'>${bill.totalAmount}</span>
                                                                {bill.patientPayable > 0 && (
                                                                    <span className='text-[10px] text-red-500'>Payable: ${bill.patientPayable}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className='px-8 py-6'>
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {bill.paymentStatus}
                                                            </span>
                                                        </td>
                                                        <td className='px-8 py-6'>
                                                            <button
                                                                onClick={() => bill.paymentStatus === 'paid' ? handleDownloadReceipt(bill) : handlePayBill(bill._id)}
                                                                className='text-cyan-700 font-bold hover:underline'
                                                            >
                                                                {bill.paymentStatus === 'paid' ? 'View Receipt' : 'Pay Now'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Add Member Modal */}
                {showMemberModal && (
                    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start pt-[10vh] sm:pt-[15vh] justify-center z-50 p-4 overflow-y-auto'>
                        <div className='bg-white rounded-3xl p-8 max-w-xl w-full animate-slide-up mb-20 border border-slate-200'>
                            <h2 className='text-2xl font-bold text-slate-900 mb-6'>{isEditingMember ? 'Edit Family Member' : 'Add Family Member'}</h2>
                            <form onSubmit={handleSubmitMember} className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='col-span-2'>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Full Name</label>
                                        <input required type='text' className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
                                    </div>
                                    <div className='col-span-2'>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Profile Image URL (optional)</label>
                                        <input type='url' className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' placeholder='https://example.com/photo.jpg' value={memberForm.profileImage} onChange={e => setMemberForm({ ...memberForm, profileImage: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Relationship</label>
                                        <div className='relative'>
                                            <button
                                                type='button'
                                                onClick={() => setShowRelationDropdown(!showRelationDropdown)}
                                                className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-left flex justify-between items-center'
                                            >
                                                <span className='capitalize'>{memberForm.relationship}</span>
                                                <svg className={`w-4 h-4 text-slate-400 transition-transform ${showRelationDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </button>
                                            {showRelationDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setShowRelationDropdown(false)}></div>
                                                    <div className='absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto top-full left-0'>
                                                        {['husband', 'wife', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother', 'uncle', 'aunt', 'cousin', 'nephew', 'niece', 'other'].map(rel => (
                                                            <div
                                                                key={rel}
                                                                className={`p-3 hover:bg-cyan-50 cursor-pointer capitalize text-sm ${memberForm.relationship === rel ? 'bg-cyan-100 text-cyan-700 font-bold' : 'text-slate-700'}`}
                                                                onClick={() => {
                                                                    setMemberForm({ ...memberForm, relationship: rel })
                                                                    setShowRelationDropdown(false)
                                                                }}
                                                            >
                                                                {rel}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Age</label>
                                        <input required type='number' className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' value={memberForm.age} onChange={e => setMemberForm({ ...memberForm, age: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Gender</label>
                                        <select className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' value={memberForm.gender} onChange={e => setMemberForm({ ...memberForm, gender: e.target.value })}>
                                            <option value='male'>Male</option>
                                            <option value='female'>Female</option>
                                            <option value='other'>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Blood Group</label>
                                        <input type='text' className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' placeholder='e.g. A+' value={memberForm.bloodGroup} onChange={e => setMemberForm({ ...memberForm, bloodGroup: e.target.value })} />
                                    </div>
                                    <div className='col-span-2'>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Allergies</label>
                                        <div className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-2 min-h-[52px]'>
                                            {memberForm.allergies.map(allergy => (
                                                <span key={allergy} className='px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2'>
                                                    {allergy}
                                                    <button type='button' className='text-xs text-red-500 hover:text-red-700' onClick={() => handleRemoveAllergy(allergy)}>×</button>
                                                </span>
                                            ))}
                                            <input
                                                type='text'
                                                value={allergyInput}
                                                onChange={e => setAllergyInput(e.target.value)}
                                                onKeyDown={handleAllergyKeyDown}
                                                placeholder='Type and press Enter'
                                                className='flex-1 min-w-[160px] bg-transparent focus:outline-none text-sm text-slate-700'
                                            />
                                        </div>
                                        <p className='text-xs text-slate-500 mt-1'>Press Enter or comma to add each allergy.</p>
                                    </div>
                                </div>
                                <div className='flex gap-4 mt-8'>
                                    <button type='button' onClick={() => { setShowMemberModal(false); resetMemberForm() }} className='flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl'>Cancel</button>
                                    <button type='submit' className='flex-1 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold rounded-xl shadow-md'>
                                        {isEditingMember ? 'Save Changes' : 'Add Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Member Modal */}
                {showDeleteModal && (
                    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                        <div className='bg-white rounded-3xl p-8 max-w-md w-full animate-slide-up border border-slate-200'>
                            <div className='flex items-center gap-3 mb-4'>
                                <div className='w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500'>
                                    <FaTrash />
                                </div>
                                <div>
                                    <h2 className='text-xl font-bold text-slate-900'>Remove family member?</h2>
                                    <p className='text-sm text-slate-600'>This action cannot be undone.</p>
                                </div>
                            </div>
                            <p className='text-slate-700 mb-6'>The member's records will no longer be linked to your account.</p>
                            <div className='flex gap-4'>
                                <button
                                    type='button'
                                    onClick={() => { setShowDeleteModal(false); setDeleteMemberId(null) }}
                                    className='flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteMember}
                                    className='flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors'
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add/Edit Insurance Modal */}
                {showInsuranceModal && (
                    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                        <div className='bg-white rounded-3xl p-8 max-w-xl w-full animate-slide-up border border-slate-200'>
                            <h2 className='text-2xl font-bold text-slate-900 mb-6'>{isEditingInsurance ? 'Edit Insurance Policy' : 'Add Insurance Policy'}</h2>
                            <form onSubmit={handleAddInsurance} className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='col-span-2'>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Provider Name</label>
                                        <input required type='text' className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' value={insuranceForm.providerName} onChange={e => setInsuranceForm({ ...insuranceForm, providerName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Policy Number</label>
                                        <input required type='text' className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' value={insuranceForm.policyNumber} onChange={e => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Policy Type</label>
                                        <input required type='text' className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' placeholder='e.g. Life, Vision' value={insuranceForm.type} onChange={e => setInsuranceForm({ ...insuranceForm, type: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Expiry Date</label>
                                        <input required type='date' className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' value={insuranceForm.endDate} onChange={e => setInsuranceForm({ ...insuranceForm, endDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-bold text-slate-700 mb-1'>Premium</label>
                                        <input required type='text' className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none' placeholder='e.g. $50/mo' value={insuranceForm.premium} onChange={e => setInsuranceForm({ ...insuranceForm, premium: e.target.value })} />
                                    </div>
                                </div>
                                <div className='flex gap-4 mt-8'>
                                    <button type='button' onClick={() => setShowInsuranceModal(false)} className='flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl'>Cancel</button>
                                    <button type='submit' className='flex-1 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold rounded-xl shadow-md'>
                                        {isEditingInsurance ? 'Update Policy' : 'Add Policy'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FamilyHealth
