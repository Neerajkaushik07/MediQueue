import React from 'react'
import { useNavigate } from 'react-router-dom'

const HealthFeatures = () => {
    const navigate = useNavigate()

    const features = [
        {
            icon: '📋',
            title: 'Medical Records',
            description: 'Access and manage your complete medical history, test results, and doctor notes in one secure place',
            path: '/medical-records',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            icon: '💊',
            title: 'Medications',
            description: 'Track prescriptions, set reminders, and manage your medication schedule effortlessly',
            path: '/medications',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: '📊',
            title: 'Health Metrics',
            description: 'Monitor vital signs, track health trends, and visualize your wellness journey',
            path: '/health-metrics',
            gradient: 'from-green-500 to-teal-500'
        },
        {
            icon: '👤',
            title: 'Health Profile',
            description: 'Maintain comprehensive health information including allergies, conditions, and emergency contacts',
            path: '/health-profile',
            gradient: 'from-orange-500 to-red-500'
        },
        {
            icon: '🔬',
            title: 'Lab Reports',
            description: 'View and download laboratory test results with detailed analysis and historical comparisons',
            path: '/lab-reports',
            gradient: 'from-indigo-500 to-purple-500'
        },
        {
            icon: '👨‍👩‍👧‍👦',
            title: 'Family Health',
            description: 'Manage health records for your entire family from a single dashboard',
            path: '/family-health',
            gradient: 'from-pink-500 to-rose-500'
        },
        {
            icon: '🚨',
            title: 'Emergency Services',
            description: 'Quick access to emergency contacts, nearby hospitals, and critical health information',
            path: '/emergency',
            gradient: 'from-red-500 to-orange-500'
        },
        {
            icon: '🛡️',
            title: 'Insurance',
            description: 'Store insurance details, track claims, and manage healthcare coverage information',
            path: '/insurance-marketplace',
            gradient: 'from-cyan-500 to-blue-500'
        },
        {
            icon: '🏥',
            title: 'Teleconsultation',
            description: 'Connect with healthcare providers remotely through secure video consultations',
            path: '/teleconsultation',
            gradient: 'from-teal-500 to-green-500'
        },
        {
            icon: '💬',
            title: 'Health Tips',
            description: 'Get personalized health advice, wellness tips, and preventive care recommendations',
            path: '/health-tips',
            gradient: 'from-violet-500 to-purple-500'
        },
        {
            icon: '📅',
            title: 'Appointment Management',
            description: 'Schedule, reschedule, and track all your medical appointments in one place',
            path: '/my-appointments',
            gradient: 'from-amber-500 to-orange-500'
        },
        {
            icon: '📖',
            title: 'Health Blog',
            description: 'Stay informed with expert articles on health, wellness, and medical advancements',
            path: '/health-blog',
            gradient: 'from-emerald-500 to-teal-500'
        }
    ]

    return (
        <div className='overflow-hidden'>
            {/* Hero Section */}
            <div className='section-padding bg-gradient-calm rounded-3xl mb-16'>
                <div className='max-w-7xl mx-auto text-center'>
                    <div className='inline-block px-4 py-2 bg-gradient-primary rounded-full text-sm font-semibold mb-4 text-white'>
                        ✨ COMPREHENSIVE HEALTH FEATURES
                    </div>
                    <h1 className='text-4xl md:text-6xl font-bold mb-6'>
                        <span className='text-black'>Your Complete </span>
                        <span className='text-transparent bg-clip-text bg-gradient-primary'>Health Dashboard</span>
                    </h1>
                    <p className='text-gray-600 text-lg md:text-xl mb-12 leading-relaxed max-w-3xl mx-auto'>
                        Track medical records, medications, health metrics, lab reports, and more - all in one secure, easy-to-use platform
                    </p>

                    {/* Quick Highlights Grid */}
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto'>
                        {[
                            { icon: '🔒', title: 'Secure Vault', desc: 'Bank-grade encryption' },
                            { icon: '☁️', title: 'Cloud Sync', desc: 'Access anywhere' },
                            { icon: '⚡', title: 'Instant Access', desc: 'No more waiting' },
                            { icon: '📈', title: 'Health Insights', desc: 'Data-driven care' }
                        ].map((item, idx) => (
                            <div key={idx} className='bg-gradient-primary p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300'>
                                <div className='text-3xl mb-2'>{item.icon}</div>
                                <h4 className='font-bold text-sm md:text-base mb-1'>{item.title}</h4>
                                <p className='text-white/80 text-[10px] md:text-xs leading-tight'>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    {/* Button Removed: Open Health Dashboard */}
                </div>
            </div>

            {/* Features Grid */}
            <div className='section-padding bg-gradient-primary rounded-3xl mb-16 shadow-luxury'>
                <div className='max-w-7xl mx-auto'>
                    <div className='text-center mb-12'>
                        <span className='inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4'>
                            All Features
                        </span>
                        <h2 className='text-4xl md:text-5xl font-bold text-white mt-4'>
                            Everything You Need for Better Health
                        </h2>
                        <p className='mt-4 text-white/80 max-w-2xl mx-auto'>
                            Powerful tools and features designed to help you take control of your health journey
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(feature.path)}
                                className='medical-card p-8 cursor-pointer group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in-up bg-gradient-calm border-none'
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className={`w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    {feature.icon}
                                </div>
                                <h3 className='text-xl font-bold text-gray-900 mb-3'>
                                    {feature.title}
                                </h3>
                                <p className='text-gray-600 leading-relaxed mb-4'>
                                    {feature.description}
                                </p>
                                <div className='flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all duration-300'>
                                    Learn More
                                    <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className='section-padding bg-gradient-calm rounded-3xl mb-16'>
                <div className='max-w-4xl mx-auto text-center'>
                    <h2 className='text-3xl md:text-4xl font-bold medical-heading mb-4'>
                        Ready to Take Control of Your Health?
                    </h2>
                    <p className='text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto'>
                        Join thousands of users who trust MediQueue for their healthcare management needs
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>

                        <button
                            onClick={() => navigate('/community')}
                            className='bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 border-2 border-primary/20'
                        >
                            Join Community
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HealthFeatures
