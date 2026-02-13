import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { FaShieldAlt, FaCheck, FaFilter, FaSearch, FaStar } from 'react-icons/fa'

const InsuranceMarketplace = () => {
    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [showPurchaseModal, setShowPurchaseModal] = useState(false)
    const [processing, setProcessing] = useState(false)

    // Mock Data for Insurance Plans
    const plans = [
        {
            id: 1,
            provider: 'SafeLife',
            name: 'Gold Health Shield',
            type: 'Health',
            premium: 499,
            coverage: '$500,000',
            features: ['Hospitalization', 'Critical Illness', 'Maternity Cover', 'No Room Rent Capping'],
            color: 'from-yellow-400 to-orange-500',
            recommended: true
        },
        {
            id: 2,
            provider: 'MediSecure',
            name: 'Silver Health Protect',
            type: 'Health',
            premium: 299,
            coverage: '$200,000',
            features: ['Hospitalization', 'Day Care Procedures', 'Ambulance Cover'],
            color: 'from-blue-400 to-cyan-500',
            recommended: false
        },
        {
            id: 3,
            provider: 'EyeGuard',
            name: 'Vision Plus',
            type: 'Vision',
            premium: 49,
            coverage: '$10,000',
            features: ['Eye Exams', 'Contact Lenses', 'Frames & Lenses'],
            color: 'from-green-400 to-emerald-500',
            recommended: false
        },
        {
            id: 4,
            provider: 'DentCare',
            name: 'Dental Elite',
            type: 'Dental',
            premium: 79,
            coverage: '$25,000',
            features: ['Root Canal', 'Cleaning', 'Fillings', 'X-Rays'],
            color: 'from-purple-400 to-indigo-500',
            recommended: false
        },
        {
            id: 5,
            provider: 'LifeSustain',
            name: 'Term Life Secure',
            type: 'Life',
            premium: 120,
            coverage: '$1,000,000',
            features: ['Death Benefit', 'Accidental Death Rider', 'Terminal Illness Cover'],
            color: 'from-red-400 to-pink-500',
            recommended: true
        },
        {
            id: 6,
            provider: 'SafeLife',
            name: 'Platinum Health',
            type: 'Health',
            premium: 999,
            coverage: '$2,000,000',
            features: ['Global Coverage', 'OPD Cover', 'Health Checkups', 'Bonus on No Claim'],
            color: 'from-slate-700 to-slate-900',
            recommended: false
        }
    ]

    const filters = [
        { id: 'all', label: 'All Plans' },
        { id: 'Health', label: 'Health' },
        { id: 'Life', label: 'Life' },
        { id: 'Vision', label: 'Vision' },
        { id: 'Dental', label: 'Dental' }
    ]

    const filteredPlans = activeFilter === 'all'
        ? plans
        : plans.filter(plan => plan.type === activeFilter)

    const handlePurchase = async () => {
        setProcessing(true)
        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.info('Payment feature coming soon!')
            setShowPurchaseModal(false)
        } catch (error) {
            console.error(error)
            toast.error('Something went wrong')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className='min-h-screen py-8 mb-20'>
            {/* Header */}
            <div className='mb-8 text-center'>
                <h1 className='text-4xl font-bold medical-heading mb-4'>Insurance Marketplace</h1>
                <p className='text-gray-600 max-w-2xl mx-auto'>
                    Compare and buy the best insurance plans for you and your family.
                    Secure your future with top-rated providers.
                </p>
            </div>

            {/* Filters */}
            <div className='flex flex-wrap justify-center gap-3 mb-12'>
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-6 py-2.5 rounded-full font-bold transition-all ${activeFilter === filter.id
                            ? 'bg-gradient-primary text-white shadow-glow'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Plans Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4'>
                {filteredPlans.map(plan => (
                    <div key={plan.id} className='relative glass-card overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'>
                        {/* Header Background */}
                        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${plan.color}`}></div>

                        {plan.recommended && (
                            <div className='absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1'>
                                <FaStar /> Recommended
                            </div>
                        )}

                        <div className='p-8'>
                            <div className='flex items-center gap-3 mb-4'>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                                    <FaShieldAlt />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-500 font-bold uppercase'>{plan.provider}</p>
                                    <h3 className='text-xl font-bold text-gray-900'>{plan.name}</h3>
                                </div>
                            </div>

                            <div className='mb-6'>
                                <p className='text-3xl font-bold text-gray-900'>${plan.premium}<span className='text-sm text-gray-500 font-medium'>/mo</span></p>
                                <p className='text-sm text-emerald-600 font-bold mt-1'>Coverage: {plan.coverage}</p>
                            </div>

                            <ul className='space-y-3 mb-8'>
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className='flex items-center gap-3 text-sm text-gray-600'>
                                        <div className='w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs flex-shrink-0'>
                                            <FaCheck />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => { setSelectedPlan(plan); setShowPurchaseModal(true) }}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all`}
                            >
                                Buy Policy
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Purchase Modal */}
            {showPurchaseModal && selectedPlan && (
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in'>
                    <div className='bg-white rounded-3xl p-8 max-w-md w-full animate-slide-up shadow-2xl relative overflow-hidden'>
                        {/* Decorative Background */}
                        <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-r ${selectedPlan.color}`}></div>

                        <div className='relative z-10'>
                            <div className='w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl mx-auto mb-6'>
                                📝
                            </div>

                            <h2 className='text-2xl font-bold text-center mb-2'>Confirm Purchase</h2>
                            <p className='text-gray-500 text-center mb-8'>You are about to purchase the <span className='font-bold text-gray-800'>{selectedPlan.name}</span></p>

                            <div className='bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100'>
                                <div className='flex justify-between mb-4'>
                                    <span className='text-gray-500'>Provider</span>
                                    <span className='font-bold text-gray-800'>{selectedPlan.provider}</span>
                                </div>
                                <div className='flex justify-between mb-4'>
                                    <span className='text-gray-500'>Monthly Premium</span>
                                    <span className='font-bold text-gray-800'>${selectedPlan.premium}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-500'>Coverage Info</span>
                                    <span className='font-bold text-emerald-600'>{selectedPlan.coverage}</span>
                                </div>
                            </div>

                            <div className='flex gap-4'>
                                <button
                                    onClick={() => setShowPurchaseModal(false)}
                                    className='flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePurchase}
                                    disabled={processing}
                                    className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r ${selectedPlan.color} ${processing ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                                >
                                    {processing ? (
                                        <>
                                            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm & Pay'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InsuranceMarketplace
