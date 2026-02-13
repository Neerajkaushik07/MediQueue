import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const HealthDashboard = () => {
    const navigate = useNavigate()
    const { token } = useContext(AppContext)

    const healthFeatures = [
        {
            title: 'Medical Records',
            description: 'View and manage your complete medical history',
            icon: '📋',
            path: '/medical-records',
            color: 'from-blue-500 to-blue-600',
            stats: 'All records in one place'
        },
        {
            title: 'Medications',
            description: 'Track prescriptions and set medication reminders',
            icon: '💊',
            path: '/medications',
            color: 'from-green-500 to-green-600',
            stats: 'Never miss a dose'
        },
        {
            title: 'Health Metrics',
            description: 'Monitor vital signs and track your health progress',
            icon: '📊',
            path: '/health-metrics',
            color: 'from-purple-500 to-purple-600',
            stats: 'Track your vitals'
        },
        {
            title: 'Lab Reports',
            description: 'Access all your test results and lab reports',
            icon: '🔬',
            path: '/lab-reports',
            color: 'from-pink-500 to-pink-600',
            stats: 'Easy access to reports'
        },
        {
            title: 'Teleconsultation',
            description: 'Schedule online video consultations with doctors',
            icon: '🎥',
            path: '/doctors',
            color: 'from-indigo-500 to-indigo-600',
            stats: 'Consult from home'
        },
        {
            title: 'Emergency Services',
            description: 'Quick access to emergency medical services',
            icon: '🚑',
            path: '/emergency',
            color: 'from-red-500 to-red-600',
            stats: '24/7 emergency support'
        },
        {
            title: 'Family Health',
            description: 'Manage health records for your entire family',
            icon: '👨‍👩‍👧‍👦',
            path: '/family-health',
            color: 'from-orange-500 to-orange-600',
            stats: 'Family health management'
        },
        {
            title: 'Insurance & Billing',
            description: 'Track insurance coverage and medical bills',
            icon: '💰',
            path: '/family-health',
            color: 'from-teal-500 to-teal-600',
            stats: 'Manage payments easily'
        },
        {
            title: 'Health Education',
            description: 'Read articles and tips for better health',
            icon: '📚',
            path: '/health-blog',
            color: 'from-yellow-500 to-yellow-600',
            stats: 'Learn about health'
        }
    ]

    const quickStats = [
        { label: 'Total Appointments', value: '12', icon: '📅', color: 'text-blue-600' },
        { label: 'Active Prescriptions', value: '3', icon: '💊', color: 'text-green-600' },
        { label: 'Medical Records', value: '24', icon: '📋', color: 'text-purple-600' },
        { label: 'Lab Reports', value: '8', icon: '🔬', color: 'text-pink-600' }
    ]

    return (
        <div className='min-h-screen py-8'>
            {/* Demo Data Notice for non-logged-in users */}
            {!token && (
                <div className='mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-primary p-4 rounded-lg'>
                    <div className='flex items-start gap-3'>
                        <span className='text-2xl'>ℹ️</span>
                        <div className='flex-1'>
                            <h3 className='font-semibold text-gray-800 mb-1'>Viewing Demo Data</h3>
                            <p className='text-sm text-gray-600 mb-2'>
                                You're currently viewing sample health data. Login to save and manage your actual health records.
                            </p>
                            <button
                                onClick={() => navigate('/health-profile')}
                                className='text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors'
                            >
                                Login to Access Your Real Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-4xl font-bold medical-heading mb-2'>
                    Your Health Dashboard
                </h1>
                <p className='text-gray-600'>
                    Manage your complete healthcare journey in one place
                </p>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                {quickStats.map((stat, index) => (
                    <div key={index} className='glass-card p-6 hover:shadow-xl transition-all duration-300'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-gray-600 text-sm mb-1'>{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className='text-4xl'>{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Health Features Grid */}
            <div className='mb-8'>
                <h2 className='text-2xl font-bold mb-6'>Health Management Features</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {healthFeatures.map((feature, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(feature.path)}
                            className='medical-card bg-gradient-primary p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 group text-white border-none'
                        >
                            <div className={`w-16 h-16 bg-gradient-calm rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h3 className='text-xl font-bold mb-2 text-white group-hover:text-white/90 transition-colors'>
                                {feature.title}
                            </h3>
                            <p className='text-white/80 mb-4 text-sm'>
                                {feature.description}
                            </p>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs text-white/70'>{feature.stats}</span>
                                <svg
                                    className='w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className='glass-card p-6'>
                <h2 className='text-2xl font-bold mb-6'>Recent Activity</h2>
                <div className='space-y-4'>
                    {[
                        { action: 'Appointment scheduled', time: '2 hours ago', icon: '📅', color: 'bg-blue-100 text-blue-600' },
                        { action: 'Prescription added', time: '1 day ago', icon: '💊', color: 'bg-green-100 text-green-600' },
                        { action: 'Lab report uploaded', time: '3 days ago', icon: '🔬', color: 'bg-purple-100 text-purple-600' },
                        { action: 'Health metric logged', time: '5 days ago', icon: '📊', color: 'bg-pink-100 text-pink-600' }
                    ].map((activity, index) => (
                        <div key={index} className='flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors'>
                            <div className='flex items-center gap-4'>
                                <div className={`w-12 h-12 ${activity.color} rounded-full flex items-center justify-center text-xl`}>
                                    {activity.icon}
                                </div>
                                <div>
                                    <p className='font-semibold'>{activity.action}</p>
                                    <p className='text-sm text-gray-500'>{activity.time}</p>
                                </div>
                            </div>
                            <button className='text-gray-400 hover:text-primary'>
                                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-6'>
                <button
                    onClick={() => navigate('/doctors')}
                    className='glass-card p-6 hover:shadow-xl transition-all group'
                >
                    <div className='text-4xl mb-3'>👨‍⚕️</div>
                    <h3 className='font-bold text-lg mb-2 group-hover:text-primary'>Book Appointment</h3>
                    <p className='text-sm text-gray-600'>Find and book with top doctors</p>
                </button>

                <button
                    onClick={() => navigate('/emergency')}
                    className='glass-card p-6 hover:shadow-xl transition-all group bg-red-50'
                >
                    <div className='text-4xl mb-3'>🚨</div>
                    <h3 className='font-bold text-lg mb-2 text-red-600'>Emergency</h3>
                    <p className='text-sm text-gray-600'>Quick access to emergency services</p>
                </button>

                <button
                    onClick={() => navigate('/health-tips')}
                    className='glass-card p-6 hover:shadow-xl transition-all group'
                >
                    <div className='text-4xl mb-3'>💡</div>
                    <h3 className='font-bold text-lg mb-2 group-hover:text-primary'>Health Tips</h3>
                    <p className='text-sm text-gray-600'>Daily tips for better health</p>
                </button>
            </div>
        </div>
    )
}

export default HealthDashboard
