import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const navigate = useNavigate()
    return (
        <div className='relative overflow-hidden bg-gradient-calm rounded-2xl my-6 mb-16'>
            {/* Background Pattern */}
            <div className='absolute inset-0 opacity-30 bg-pattern-medical' style={{ backgroundSize: '20px 20px' }}></div>

            <div className='relative flex flex-col md:flex-row items-center px-6 md:px-10 lg:px-20 py-12 md:py-16'>
                {/* --------- Header Left --------- */}
                <div className='md:w-1/2 flex flex-col items-start justify-center gap-6 z-10'>
                    <div className='trust-badge animate-fade-in'>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Certified Healthcare Platform</span>
                    </div>

                    <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight medical-heading animate-fade-in-up'>
                        Quality Healthcare
                        <span className='block mt-2 accent-heading'>At Your Fingertips</span>
                    </h1>

                    <p className='text-gray-600 text-lg leading-relaxed max-w-lg animate-fade-in-up' style={{ animationDelay: '0.1s' }}>
                        Connect with trusted medical professionals. Book appointments seamlessly and take control of your health journey with confidence.
                    </p>

                    {/* Key Features */}
                    <div className='flex flex-col gap-3 animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
                        <div className='flex items-center gap-3 text-gray-700'>
                            <div className='w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0'>
                                <svg className='w-4 h-4 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className='font-medium'>100+ Verified Doctors</span>
                        </div>
                        <div className='flex items-center gap-3 text-gray-700'>
                            <div className='w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0'>
                                <svg className='w-4 h-4 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className='font-medium'>Instant Appointment Booking</span>
                        </div>
                        <div className='flex items-center gap-3 text-gray-700'>
                            <div className='w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0'>
                                <svg className='w-4 h-4 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className='font-medium'>24/7 Healthcare Support</span>
                        </div>
                    </div>

                    <div className='flex gap-4 mt-4 animate-fade-in-up' style={{ animationDelay: '0.3s' }}>
                        <button
                            onClick={() => { document.getElementById('speciality').scrollIntoView({ behavior: 'smooth' }) }}
                            className='btn-primary flex items-center gap-2 transition-transform hover:scale-105 duration-300'
                        >
                            <span>Book Appointment</span>
                            <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                            className='btn-secondary'
                        >
                            View Doctors
                        </button>
                    </div>

                    {/* Stats */}
                    <div className='flex gap-8 mt-6 animate-fade-in-up' style={{ animationDelay: '0.4s' }}>
                        <div className='text-left'>
                            <p className='text-3xl font-bold gradient-text'>500+</p>
                            <p className='text-sm text-gray-600 mt-1'>Happy Patients</p>
                        </div>
                        <div className='text-left'>
                            <p className='text-3xl font-bold gradient-text'>50+</p>
                            <p className='text-sm text-gray-600 mt-1'>Specialities</p>
                        </div>
                        <div className='text-left'>
                            <p className='text-3xl font-bold gradient-text'>4.8★</p>
                            <p className='text-sm text-gray-600 mt-1'>Rating</p>
                        </div>
                    </div>
                </div>

                {/* --------- Header Right --------- */}
                <div className='md:w-1/2 flex items-center justify-center mt-10 md:mt-0 relative'>
                    <div className='relative animate-fade-in' style={{ animationDelay: '0.2s' }}>
                        <img
                            className='w-full h-auto rounded-2xl shadow-card'
                            src={assets.header_img}
                            alt="Medical professionals"
                        />
                        {/* Trust badge overlay */}
                        <div className='absolute bottom-6 left-6 bg-white rounded-xl p-4 shadow-card max-w-xs'>
                            <div className='flex items-center gap-3'>
                                <div className='w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center'>
                                    <svg className='w-6 h-6 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className='font-bold text-gray-900'>Trusted Care</p>
                                    <p className='text-sm text-gray-600'>Licensed & Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
