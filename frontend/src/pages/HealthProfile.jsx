import React, { useState, useContext, useEffect, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const HealthProfile = () => {
    const { backendUrl, token, userData, setUserData } = useContext(AppContext)

    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState({
        bloodGroup: '',
        height: 0,
        weight: 0,
        bmi: 0,
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        emergencyContacts: [],
        familyMembers: [],
        insurance: null,
        healthGoals: []
    })

    const [modalConfig, setModalConfig] = useState({
        show: false,
        type: '', // 'allergy', 'condition', 'contact', 'goal', 'vitals'
        data: {}
    })

    const fetchProfile = useCallback(async () => {
        if (!token) {
            setLoading(false)
            return
        }
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                const user = data.userData
                setProfile(prev => ({
                    ...prev,
                    bloodGroup: user.bloodGroup || prev.bloodGroup,
                    height: user.height || prev.height,
                    weight: user.weight || prev.weight,
                    bmi: user.weight && user.height ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : prev.bmi,
                    allergies: Array.isArray(user.allergies) && user.allergies.length > 0
                        ? user.allergies.map((a, i) => ({ id: i, name: a, severity: 'medium', reaction: 'Known allergy' }))
                        : prev.allergies,
                    chronicConditions: Array.isArray(user.chronicConditions) && user.chronicConditions.length > 0
                        ? user.chronicConditions.map((c, i) => ({ id: i, name: c, diagnosedDate: new Date(), managedBy: 'Specialist' }))
                        : prev.chronicConditions,
                    emergencyContacts: user.emergencyContact?.name ? [{
                        id: 1,
                        name: user.emergencyContact.name,
                        relationship: user.emergencyContact.relationship,
                        phone: user.emergencyContact.phone
                    }] : prev.emergencyContacts,
                    healthGoals: Array.isArray(user.healthGoals) && user.healthGoals.length > 0
                        ? user.healthGoals.map(g => g.goal)
                        : prev.healthGoals
                }))
            }
        } catch (error) {
            console.error('Error fetching health profile:', error)
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token])

    const updateBackend = async (updatedProfile) => {
        if (!token) return
        try {
            const formData = new FormData()
            formData.append('userId', userData._id)
            formData.append('bloodGroup', updatedProfile.bloodGroup)
            formData.append('height', updatedProfile.height)
            formData.append('weight', updatedProfile.weight)
            formData.append('allergies', JSON.stringify(updatedProfile.allergies.map(a => a.name)))
            formData.append('chronicConditions', JSON.stringify(updatedProfile.chronicConditions.map(c => c.name)))

            if (updatedProfile.emergencyContacts.length > 0) {
                formData.append('emergencyContact', JSON.stringify({
                    name: updatedProfile.emergencyContacts[0].name,
                    relationship: updatedProfile.emergencyContacts[0].relationship,
                    phone: updatedProfile.emergencyContacts[0].phone
                }))
            }

            formData.append('healthGoals', JSON.stringify(updatedProfile.healthGoals.map(g => ({ goal: g, status: 'active' }))))
            // Note: address needs to be sent if following previous pattern or if backend requires it
            formData.append('address', JSON.stringify(userData.address))

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })
            if (data.success) {
                toast.success('Profile Updated')
                fetchProfile()
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleSaveVitals = (e) => {
        e.preventDefault()
        const updated = {
            ...profile,
            bloodGroup: modalConfig.data.bloodGroup,
            height: modalConfig.data.height,
            weight: modalConfig.data.weight,
            bmi: (modalConfig.data.weight / ((modalConfig.data.height / 100) ** 2)).toFixed(1)
        }
        setProfile(updated)
        updateBackend(updated)
        setModalConfig({ show: false, type: '', data: {} })
    }

    const handleSaveContact = (e) => {
        e.preventDefault()
        const updated = {
            ...profile,
            emergencyContacts: [modalConfig.data]
        }
        setProfile(updated)
        updateBackend(updated)
        setModalConfig({ show: false, type: '', data: {} })
    }

    const handleAddGoal = (e) => {
        e.preventDefault()
        const updated = {
            ...profile,
            healthGoals: [...profile.healthGoals, modalConfig.data.goal]
        }
        setProfile(updated)
        updateBackend(updated)
        setModalConfig({ show: false, type: '', data: {} })
    }

    const handleAddAllery = (e) => {
        e.preventDefault()
        const updated = {
            ...profile,
            allergies: [...profile.allergies, { ...modalConfig.data, id: Date.now() }]
        }
        setProfile(updated)
        updateBackend(updated)
        setModalConfig({ show: false, type: '', data: {} })
    }

    const handleAddCondition = (e) => {
        e.preventDefault()
        const updated = {
            ...profile,
            chronicConditions: [...profile.chronicConditions, { ...modalConfig.data, id: Date.now() }]
        }
        setProfile(updated)
        updateBackend(updated)
        setModalConfig({ show: false, type: '', data: {} })
    }

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-700'
            case 'medium': return 'bg-yellow-100 text-yellow-700'
            case 'low': return 'bg-green-100 text-green-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className='min-h-screen py-8'>
            {/* Header */}
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-4xl font-bold medical-heading mb-2'>Health Profile</h1>
                    <p className='text-gray-600'>Comprehensive health information in one place</p>
                </div>

            </div>

            {/* Basic Health Info */}
            <div className='glass-card p-6 mb-6'>
                <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold flex items-center gap-2'>
                        <span>📊</span>
                        Basic Health Information
                    </h2>
                    <button
                        onClick={() => setModalConfig({ show: true, type: 'vitals', data: { bloodGroup: profile.bloodGroup, height: profile.height, weight: profile.weight } })}
                        className='px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20'
                    >
                        Edit Vitals
                    </button>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                    <div className='text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl'>
                        <div className='text-3xl mb-2'>🩸</div>
                        <p className='text-sm text-gray-600 mb-1'>Blood Group</p>
                        <p className='text-2xl font-bold text-red-600'>{profile.bloodGroup || '?'}</p>
                    </div>
                    <div className='text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl'>
                        <div className='text-3xl mb-2'>📏</div>
                        <p className='text-sm text-gray-600 mb-1'>Height</p>
                        <p className='text-2xl font-bold text-blue-600'>{profile.height || '0'} cm</p>
                    </div>
                    <div className='text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl'>
                        <div className='text-3xl mb-2'>⚖️</div>
                        <p className='text-sm text-gray-600 mb-1'>Weight</p>
                        <p className='text-2xl font-bold text-green-600'>{profile.weight || '0'} kg</p>
                    </div>
                    <div className='text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl'>
                        <div className='text-3xl mb-2'>📈</div>
                        <p className='text-sm text-gray-600 mb-1'>BMI</p>
                        <p className='text-2xl font-bold text-purple-600'>{profile.bmi || '0'}</p>
                    </div>
                </div>
            </div>

            {/* Allergies */}
            <div className='glass-card p-6 mb-6'>
                <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold flex items-center gap-2'>
                        <span>⚠️</span>
                        Allergies
                    </h2>
                    <button
                        onClick={() => setModalConfig({ show: true, type: 'allergy', data: { name: '', severity: 'medium', reaction: '' } })}
                        className='px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90'
                    >
                        + Add Allergy
                    </button>
                </div>
                <div className='space-y-3'>
                    {profile.allergies.map((allergy) => (
                        <div key={allergy.id} className='flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg'>
                            <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-2'>
                                    <h3 className='font-bold text-lg'>{allergy.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(allergy.severity)}`}>
                                        {allergy.severity.toUpperCase()}
                                    </span>
                                </div>
                                <p className='text-gray-600 text-sm'>Reaction: {allergy.reaction}</p>
                            </div>
                            <button className='px-4 py-2 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-100'>
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chronic Conditions */}
            <div className='glass-card p-6 mb-6'>
                <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold flex items-center gap-2'>
                        <span>🏥</span>
                        Chronic Conditions
                    </h2>
                    <button
                        onClick={() => setModalConfig({ show: true, type: 'condition', data: { name: '', diagnosedDate: new Date().toISOString().split('T')[0], managedBy: '' } })}
                        className='px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90'
                    >
                        + Add Condition
                    </button>
                </div>
                <div className='space-y-3'>
                    {profile.chronicConditions.map((condition) => (
                        <div key={condition.id} className='flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg'>
                            <div className='flex-1'>
                                <h3 className='font-bold text-lg mb-2'>{condition.name}</h3>
                                <div className='text-sm text-gray-600 space-y-1'>
                                    <p>Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}</p>
                                    <p>Managed by: {condition.managedBy}</p>
                                </div>
                            </div>
                            <button className='px-4 py-2 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-100'>
                                Manage
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                {/* Emergency Contacts */}
                <div className='glass-card p-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-xl font-bold flex items-center gap-2'>
                            <span>🚨</span>
                            Emergency Contacts
                        </h2>
                        <button
                            onClick={() => setModalConfig({ show: true, type: 'contact', data: profile.emergencyContacts[0] || { name: '', relationship: '', phone: '' } })}
                            className='text-primary text-sm hover:underline font-bold'
                        >
                            {profile.emergencyContacts.length > 0 ? 'Edit' : '+ Add'}
                        </button>
                    </div>
                    <div className='space-y-3'>
                        {profile.emergencyContacts.map((contact) => (
                            <div key={contact.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                <div>
                                    <p className='font-bold'>{contact.name}</p>
                                    <p className='text-sm text-gray-600'>{contact.relationship}</p>
                                    <p className='text-sm text-primary'>{contact.phone}</p>
                                </div>
                                <button className='text-gray-600 hover:text-gray-800'>✏️</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Family Members */}
                <div className='glass-card p-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-xl font-bold flex items-center gap-2'>
                            <span>👨‍👩‍👧‍👦</span>
                            Family Members
                        </h2>
                        <button
                            onClick={() => toast.info('Add member feature coming soon!')}
                            className='text-primary text-sm hover:underline'
                        >
                            + Add
                        </button>
                    </div>
                    <div className='space-y-3'>
                        {profile.familyMembers.map((member) => (
                            <div key={member.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                <div>
                                    <p className='font-bold'>{member.name}</p>
                                    <p className='text-sm text-gray-600'>
                                        {member.relationship} • {member.age} years • {member.bloodGroup}
                                    </p>
                                </div>
                                <button className='px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90'>
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Insurance */}
            <div className='glass-card p-6 mb-6'>
                <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold flex items-center gap-2'>
                        <span>🛡️</span>
                        Insurance Information
                    </h2>
                    <button
                        onClick={() => toast.info('Insurance verification feature coming soon!')}
                        className='px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90'
                    >
                        Verify Insurance
                    </button>
                </div>
                {profile?.insurance ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        <div className='p-4 bg-blue-50 rounded-lg'>
                            <p className='text-sm text-gray-600 mb-1'>Provider</p>
                            <p className='font-bold'>{profile.insurance.provider}</p>
                        </div>
                        <div className='p-4 bg-green-50 rounded-lg'>
                            <p className='text-sm text-gray-600 mb-1'>Policy Number</p>
                            <p className='font-bold'>{profile.insurance.policyNumber}</p>
                        </div>
                        <div className='p-4 bg-purple-50 rounded-lg'>
                            <p className='text-sm text-gray-600 mb-1'>Coverage</p>
                            <p className='font-bold'>₹{profile.insurance.coverageAmount?.toLocaleString()}</p>
                        </div>
                        <div className='p-4 bg-orange-50 rounded-lg'>
                            <p className='text-sm text-gray-600 mb-1'>Valid Until</p>
                            <p className='font-bold'>{profile.insurance.validUntil ? new Date(profile.insurance.validUntil).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                ) : (
                    <div className='text-center py-8 bg-gray-50 rounded-xl'>
                        <p className='text-gray-500 font-semibold mb-2'>No insurance policy found</p>
                        <p className='text-sm text-gray-400'>Add your details to ease hospital admission processes.</p>
                    </div>
                )}
            </div>

            {/* Health Goals */}
            <div className='glass-card p-6 mb-6'>
                <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold flex items-center gap-2'>
                        <span>🎯</span>
                        Health Goals
                    </h2>
                    <button
                        onClick={() => setModalConfig({ show: true, type: 'goal', data: { goal: '' } })}
                        className='px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90'
                    >
                        + Add Goal
                    </button>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {profile.healthGoals.length > 0 ? profile.healthGoals.map((goal, index) => (
                        <div key={index} className='flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg'>
                            <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm'>
                                ✓
                            </div>
                            <p className='font-semibold'>{goal}</p>
                        </div>
                    )) : (
                        <div className='col-span-2 text-center py-4 text-gray-400'>No active health goals. Add one to start tracking!</div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {modalConfig.show && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl'>
                        <h2 className='text-2xl font-bold mb-6 capitalize'>
                            {modalConfig.type === 'allergy' && 'Add Allergy'}
                            {modalConfig.type === 'condition' && 'Add Condition'}
                            {modalConfig.type === 'contact' && 'Emergency Contact'}
                            {modalConfig.type === 'vitals' && 'Edit Vitals'}
                        </h2>
                        <form onSubmit={
                            modalConfig.type === 'allergy' ? handleAddAllery :
                                modalConfig.type === 'condition' ? handleAddCondition :
                                    modalConfig.type === 'contact' ? handleSaveContact :
                                        handleSaveVitals
                        } className='space-y-4'>

                            {modalConfig.type === 'vitals' && (
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='col-span-2'>
                                        <label className='block text-sm font-semibold mb-1'>Blood Group</label>
                                        <select value={modalConfig.data.bloodGroup} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, bloodGroup: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl'>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Height (cm)</label>
                                        <input type='number' value={modalConfig.data.height} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, height: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Weight (kg)</label>
                                        <input type='number' value={modalConfig.data.weight} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, weight: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                    </div>
                                </div>
                            )}

                            {modalConfig.type === 'goal' && (
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>New Health Goal *</label>
                                    <input required type='text' placeholder='e.g. Drink 2L water' value={modalConfig.data.goal} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, goal: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                </div>
                            )}

                            {modalConfig.type === 'contact' && (
                                <>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Name *</label>
                                        <input required type='text' value={modalConfig.data.name} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Relationship</label>
                                        <input type='text' value={modalConfig.data.relationship} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, relationship: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Phone *</label>
                                        <input required type='text' value={modalConfig.data.phone} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, phone: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                    </div>
                                </>
                            )}

                            {(modalConfig.type === 'allergy' || modalConfig.type === 'condition') && (
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Name *</label>
                                    <input required type='text' value={modalConfig.data.name} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                </div>
                            )}

                            {modalConfig.type === 'allergy' && (
                                <>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Severity</label>
                                        <select value={modalConfig.data.severity} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, severity: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl'>
                                            <option value='low'>Low</option>
                                            <option value='medium'>Medium</option>
                                            <option value='high'>High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Reaction</label>
                                        <input type='text' value={modalConfig.data.reaction} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, reaction: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                    </div>
                                </>
                            )}

                            {modalConfig.type === 'condition' && (
                                <>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Diagnosed Date</label>
                                        <input type='date' value={modalConfig.data.diagnosedDate} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, diagnosedDate: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Managed By</label>
                                        <input type='text' value={modalConfig.data.managedBy} onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, managedBy: e.target.value } }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                                    </div>
                                </>
                            )}
                            <div className='flex gap-4 pt-4'>
                                <button type='button' onClick={() => setModalConfig({ show: false, type: '', data: {} })} className='flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl'>Cancel</button>
                                <button type='submit' className='flex-1 px-6 py-3 bg-gradient-primary text-white font-bold rounded-xl shadow-lg'>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HealthProfile
