import React, { useState, useContext, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FaUserFriends, FaShieldAlt, FaFileInvoiceDollar, FaPlus, FaTrash, FaEdit, FaChevronRight } from 'react-icons/fa'

const FamilyHealth = () => {
    const { backendUrl, token } = useContext(AppContext)
    const [activeTab, setActiveTab] = useState('family')
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [showMemberModal, setShowMemberModal] = useState(false)
    const [showInsuranceModal, setShowInsuranceModal] = useState(false)
    const [isEditingInsurance, setIsEditingInsurance] = useState(false)
    const [selectedInsuranceId, setSelectedInsuranceId] = useState(null)

    // Form States
    const [memberForm, setMemberForm] = useState({
        name: '', relationship: 'spouse', gender: 'male', age: '', bloodGroup: '', allergies: ''
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
        { _id: 'f1', name: 'Sarah Wilson', relationship: 'Spouse', gender: 'Female', age: 34, bloodGroup: 'A+', allergies: ['Penicillin'], profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
        { _id: 'f2', name: 'Leo Wilson', relationship: 'Child', gender: 'Male', age: 8, bloodGroup: 'A+', allergies: [], profileImage: 'https://images.unsplash.com/photo-1513956589380-bad6ac3f7a9f?w=150' }
    ]

    const demoInsurance = [
        { _id: 'i1', providerName: 'Blue Shield Health', policyNumber: 'BSH-99283-X', type: 'Family Floater', status: 'Active', endDate: '2025-05-20', premium: '$450/mo' },
        { _id: 'i2', providerName: 'Guardian Vision', policyNumber: 'GV-8821-V', type: 'Vision Care', status: 'Active', endDate: '2024-12-15', premium: '$25/mo' }
    ]

    const demoBills = [
        { _id: 'b1', billNumber: 'BILL-1002', billDate: '2024-02-10', totalAmount: 1200, patientPayable: 200, paymentStatus: 'pending', service: 'Surgery Consultation' },
        { _id: 'b2', billNumber: 'BILL-1001', billDate: '2024-01-15', totalAmount: 85, patientPayable: 0, paymentStatus: 'paid', service: 'General Checkup' }
    ]

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            if (token) {
                const [familyRes, insuranceRes, billingRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/family-health/family`, { headers: { token } }),
                    axios.get(`${backendUrl}/api/family-health/insurance`, { headers: { token } }),
                    axios.get(`${backendUrl}/api/family-health/billing`, { headers: { token } })
                ])

                setFamilyMembers(familyRes.data.success && familyRes.data.members.length > 0 ? familyRes.data.members : demoFamily)
                setInsurancePolicies(insuranceRes.data.success && insuranceRes.data.policies.length > 0 ? insuranceRes.data.policies : demoInsurance)
                setBills(billingRes.data.success && billingRes.data.bills.length > 0 ? billingRes.data.bills : demoBills)
            } else {
                setFamilyMembers(demoFamily)
                setInsurancePolicies(demoInsurance)
                setBills(demoBills)
            }
        } catch (error) {
            console.error('Error fetching family health data:', error)
            setFamilyMembers(demoFamily)
            setInsurancePolicies(demoInsurance)
            setBills(demoBills)
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleAddMember = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post(`${backendUrl}/api/family-health/family/add`, {
                ...memberForm,
                age: Number(memberForm.age),
                allergies: memberForm.allergies ? memberForm.allergies.split(',').map(s => s.trim()).filter(s => s) : []
            }, { headers: { token } })

            if (data.success) {
                toast.success('Family member added successfully!')
                setShowMemberModal(false)
                setMemberForm({ name: '', relationship: 'spouse', gender: 'male', age: '', bloodGroup: '', allergies: '' })
                fetchData()
            } else {
                toast.error(data.message)
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

    const handlePayBill = (billId) => {
        toast.info('Payment feature coming soon!')
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

    const tabs = [
        { id: 'family', label: 'Family Members', icon: FaUserFriends, color: 'text-blue-500' },
        { id: 'insurance', label: 'Insurance', icon: FaShieldAlt, color: 'text-green-500' },
        { id: 'billing', label: 'Billing', icon: FaFileInvoiceDollar, color: 'text-purple-500' }
    ]

    return (
        <div className='min-h-screen py-8 mb-20'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-4xl font-bold medical-heading mb-2'>Family Health Hub</h1>
                <p className='text-gray-600'>Manage health records, insurance, and bills for your entire family</p>
            </div>

            {/* Tab Navigation */}
            <div className='flex gap-4 mb-8 bg-white p-2 rounded-2xl shadow-luxury max-w-2xl overflow-x-auto'>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                            ? 'bg-gradient-primary text-white shadow-glow'
                            : 'text-gray-500 hover:bg-gray-50'
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
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
                    </div>
                ) : (
                    <div className='animate-fade-in'>
                        {/* Family Tab */}
                        {activeTab === 'family' && (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {familyMembers.map(member => (
                                    <div key={member._id} className='glass-card p-6 group hover:shadow-2xl transition-all'>
                                        <div className='flex items-center gap-4 mb-6'>
                                            <img
                                                src={member.profileImage || 'https://via.placeholder.com/150'}
                                                alt={member.name}
                                                className='w-16 h-16 rounded-full object-cover border-4 border-primary/10 group-hover:border-primary transition-all'
                                            />
                                            <div>
                                                <h3 className='text-xl font-bold'>{member.name}</h3>
                                                <span className='px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase'>
                                                    {member.relationship}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='space-y-3 mb-6'>
                                            <div className='flex justify-between text-sm py-2 border-b border-gray-50'>
                                                <span className='text-gray-400'>Age / Gender</span>
                                                <span className='font-bold text-gray-700'>{member.age} yrs • {member.gender}</span>
                                            </div>
                                            <div className='flex justify-between text-sm py-2 border-b border-gray-50'>
                                                <span className='text-gray-400'>Blood Group</span>
                                                <span className='font-bold text-red-500'>{member.bloodGroup || 'N/A'}</span>
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <span className='text-xs font-bold text-gray-400 uppercase'>Allergies</span>
                                                <p className='text-sm text-gray-600'>
                                                    {member.allergies?.length > 0 ? member.allergies.join(', ') : 'No known allergies'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/medical-records', { state: { memberName: member.name } })}
                                            className='w-full py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-xl font-bold transition-all text-gray-700 flex items-center justify-center gap-2'
                                        >
                                            View Health Record <FaChevronRight className='text-xs' />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setShowMemberModal(true)}
                                    className='glass-card p-6 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all group'
                                >
                                    <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all'>
                                        <FaPlus className='text-2xl' />
                                    </div>
                                    <span className='font-bold text-gray-500 group-hover:text-primary'>Add Family Member</span>
                                </button>
                            </div>
                        )}

                        {/* Insurance Tab */}
                        {activeTab === 'insurance' && (
                            <div className='space-y-6'>
                                {insurancePolicies.map(policy => (
                                    <div key={policy._id} className='glass-card p-8 flex flex-col md:flex-row gap-8 items-start justify-between hover:shadow-xl transition-all'>
                                        <div className='flex gap-6 items-center'>
                                            <div className='w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-4xl text-green-500'>
                                                <FaShieldAlt />
                                            </div>
                                            <div>
                                                <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase mb-2 inline-block'>
                                                    {policy.status}
                                                </span>
                                                <h3 className='text-2xl font-bold text-gray-900'>{policy.providerName}</h3>
                                                <p className='text-gray-500'>Policy #: <span className='font-mono font-bold'>{policy.policyNumber}</span></p>
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap gap-8 w-full md:w-auto'>
                                            <div className='min-w-[120px]'>
                                                <p className='text-xs font-bold text-gray-400 uppercase mb-1'>Type</p>
                                                <p className='font-bold text-gray-700'>{policy.type}</p>
                                            </div>
                                            <div className='min-w-[120px]'>
                                                <p className='text-xs font-bold text-gray-400 uppercase mb-1'>Expiry Date</p>
                                                <p className='font-bold text-gray-700'>{new Date(policy.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className='min-w-[120px]'>
                                                <p className='text-xs font-bold text-gray-400 uppercase mb-1'>Premium</p>
                                                <p className='font-bold text-primary'>{policy.premium}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEditInsuranceClick(policy)}
                                            className='p-4 hover:bg-gray-100 rounded-2xl transition-colors'
                                        >
                                            <FaEdit className='text-gray-400 text-xl hover:text-primary' />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        setIsEditingInsurance(false)
                                        setInsuranceForm({ providerName: '', policyNumber: '', type: '', endDate: '', premium: '' })
                                        setShowInsuranceModal(true)
                                    }}
                                    className='w-full py-8 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all text-gray-400 hover:text-primary font-bold'
                                >
                                    <FaPlus /> Add New Policy
                                </button>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className='glass-card overflow-hidden'>
                                <table className='w-full text-left'>
                                    <thead>
                                        <tr className='bg-gray-50 border-b border-gray-100'>
                                            <th className='px-8 py-5 text-xs font-bold text-gray-400 uppercase'>Invoice</th>
                                            <th className='px-8 py-5 text-xs font-bold text-gray-400 uppercase'>Date</th>
                                            <th className='px-8 py-5 text-xs font-bold text-gray-400 uppercase'>Service</th>
                                            <th className='px-8 py-5 text-xs font-bold text-gray-400 uppercase'>Amount</th>
                                            <th className='px-8 py-5 text-xs font-bold text-gray-400 uppercase'>Status</th>
                                            <th className='px-8 py-5 text-xs font-bold text-gray-400 uppercase'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-50'>
                                        {bills.map(bill => (
                                            <tr key={bill._id} className='hover:bg-gray-50/50 transition-colors'>
                                                <td className='px-8 py-6'>
                                                    <span className='font-mono font-bold text-gray-800'>{bill.billNumber}</span>
                                                </td>
                                                <td className='px-8 py-6 text-gray-600'>
                                                    {new Date(bill.billDate).toLocaleDateString()}
                                                </td>
                                                <td className='px-8 py-6 font-semibold text-gray-700'>
                                                    {bill.service}
                                                </td>
                                                <td className='px-8 py-6'>
                                                    <div className='flex flex-col'>
                                                        <span className='font-bold text-gray-900'>${bill.totalAmount}</span>
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
                                                        className='text-primary font-bold hover:underline'
                                                    >
                                                        {bill.paymentStatus === 'paid' ? 'View Receipt' : 'Pay Now'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Add Member Modal */}
            {showMemberModal && (
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-3xl p-8 max-w-xl w-full animate-slide-up'>
                        <h2 className='text-2xl font-bold mb-6'>Add Family Member</h2>
                        <form onSubmit={handleAddMember} className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='col-span-2'>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Full Name</label>
                                    <input required type='text' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Relationship</label>
                                    <select className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' value={memberForm.relationship} onChange={e => setMemberForm({ ...memberForm, relationship: e.target.value })}>
                                        <option value='spouse'>Spouse</option>
                                        <option value='child'>Child</option>
                                        <option value='parent'>Parent</option>
                                        <option value='sibling'>Sibling</option>
                                        <option value='other'>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Age</label>
                                    <input required type='number' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' value={memberForm.age} onChange={e => setMemberForm({ ...memberForm, age: e.target.value })} />
                                </div>
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Gender</label>
                                    <select className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' value={memberForm.gender} onChange={e => setMemberForm({ ...memberForm, gender: e.target.value })}>
                                        <option value='male'>Male</option>
                                        <option value='female'>Female</option>
                                        <option value='other'>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Blood Group</label>
                                    <input type='text' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' placeholder='e.g. A+' value={memberForm.bloodGroup} onChange={e => setMemberForm({ ...memberForm, bloodGroup: e.target.value })} />
                                </div>
                                <div className='col-span-2'>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Allergies (comma separated)</label>
                                    <input type='text' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' placeholder='e.g. Peanuts, Aspirin' value={memberForm.allergies} onChange={e => setMemberForm({ ...memberForm, allergies: e.target.value })} />
                                </div>
                            </div>
                            <div className='flex gap-4 mt-8'>
                                <button type='button' onClick={() => setShowMemberModal(false)} className='flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl'>Cancel</button>
                                <button type='submit' className='flex-1 py-3 bg-gradient-primary text-white font-bold rounded-xl shadow-glow'>Add Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Insurance Modal */}
            {showInsuranceModal && (
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-3xl p-8 max-w-xl w-full animate-slide-up'>
                        <h2 className='text-2xl font-bold mb-6'>{isEditingInsurance ? 'Edit Insurance Policy' : 'Add Insurance Policy'}</h2>
                        <form onSubmit={handleAddInsurance} className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='col-span-2'>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Provider Name</label>
                                    <input required type='text' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' value={insuranceForm.providerName} onChange={e => setInsuranceForm({ ...insuranceForm, providerName: e.target.value })} />
                                </div>
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Policy Number</label>
                                    <input required type='text' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' value={insuranceForm.policyNumber} onChange={e => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })} />
                                </div>
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Policy Type</label>
                                    <input required type='text' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' placeholder='e.g. Life, Vision' value={insuranceForm.type} onChange={e => setInsuranceForm({ ...insuranceForm, type: e.target.value })} />
                                </div>
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Expiry Date</label>
                                    <input required type='date' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' value={insuranceForm.endDate} onChange={e => setInsuranceForm({ ...insuranceForm, endDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className='block text-sm font-bold text-gray-700 mb-1'>Premium</label>
                                    <input required type='text' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' placeholder='e.g. $50/mo' value={insuranceForm.premium} onChange={e => setInsuranceForm({ ...insuranceForm, premium: e.target.value })} />
                                </div>
                            </div>
                            <div className='flex gap-4 mt-8'>
                                <button type='button' onClick={() => setShowInsuranceModal(false)} className='flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl'>Cancel</button>
                                <button type='submit' className='flex-1 py-3 bg-gradient-primary text-white font-bold rounded-xl shadow-glow'>
                                    {isEditingInsurance ? 'Update Policy' : 'Add Policy'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FamilyHealth
